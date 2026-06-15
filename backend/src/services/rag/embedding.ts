import OpenAI from 'openai';
import { logger } from '../../lib/logger.js';

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'openai/text-embedding-3-small';
const EMBEDDING_DIMENSIONS = parseInt(process.env.EMBEDDING_DIMENSIONS || '1536', 10);
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_BATCH_SIZE = 20;
const MAX_RETRIES = 3;

interface CacheEntry {
  embedding: number[];
  cachedAt: number;
}

export class EmbeddingService {
  private client: OpenAI;
  private cache: Map<string, CacheEntry>;
  private cacheHits: number;
  private cacheMisses: number;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENROUTER_API_KEY || '';
    this.client = new OpenAI({
      apiKey: key,
      baseURL: 'https://openrouter.ai/api/v1',
    });
    this.cache = new Map();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  private getCacheKey(text: string): string {
    return `${EMBEDDING_MODEL}:${text.length}:${text.slice(0, 200)}`;
  }

  private getFromCache(text: string): number[] | null {
    const key = this.getCacheKey(text);
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.cachedAt < CACHE_TTL_MS) {
      this.cacheHits++;
      return entry.embedding;
    }
    if (entry) this.cache.delete(key);
    return null;
  }

  private setCache(text: string, embedding: number[]): void {
    if (this.cache.size > 5000) {
      const entries = Array.from(this.cache.entries());
      const toDelete = entries.slice(0, 1000);
      for (const [k] of toDelete) this.cache.delete(k);
    }
    this.cache.set(this.getCacheKey(text), { embedding, cachedAt: Date.now() });
  }

  get cacheStats() {
    return { hits: this.cacheHits, misses: this.cacheMisses, size: this.cache.size };
  }

  private chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const cached = this.getFromCache(text);
    if (cached) return cached;

    this.cacheMisses++;
    return this.generateWithRetry(text);
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    const uncached: Array<{ index: number; text: string }> = [];

    for (let i = 0; i < texts.length; i++) {
      const cached = this.getFromCache(texts[i]);
      if (cached) {
        results[i] = cached;
      } else {
        uncached.push({ index: i, text: texts[i] });
        results[i] = []; // placeholder
      }
    }

    if (uncached.length === 0) return results;

    this.cacheMisses += uncached.length;
    const chunks = this.chunkArray(uncached, MAX_BATCH_SIZE);

    for (const chunk of chunks) {
      const embeddings = await this.batchGenerateWithRetry(chunk.map(c => c.text));
      for (let j = 0; j < chunk.length; j++) {
        const idx = chunk[j].index;
        results[idx] = embeddings[j];
        this.setCache(chunk[j].text, embeddings[j]);
      }
    }

    return results;
  }

  private async callEmbeddingAPI(input: string | string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: EMBEDDING_MODEL,
      input,
      dimensions: EMBEDDING_DIMENSIONS,
    });
    return response.data.map(item => item.embedding);
  }

  private async generateWithRetry(text: string): Promise<number[]> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const embeddings = await this.callEmbeddingAPI(text);
        const embedding = embeddings[0];
        this.setCache(text, embedding);
        return embedding;
      } catch (error: unknown) {
        lastError = error as Error;
        const errMsg = error instanceof Error ? error.message : String(error);
        logger.warn({ errMsg, attempt: attempt + 1, maxRetries: MAX_RETRIES }, 'Embedding API call failed');
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
        }
      }
    }

    throw lastError || new Error('Embedding generation failed');
  }

  private async batchGenerateWithRetry(texts: string[]): Promise<number[][]> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await this.callEmbeddingAPI(texts);
      } catch (error: unknown) {
        lastError = error as Error;
        const errMsg = error instanceof Error ? error.message : String(error);
        logger.warn({ errMsg, batchSize: texts.length, attempt: attempt + 1 }, 'Batch embedding API call failed');
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
        }
      }
    }

    throw lastError || new Error('Batch embedding generation failed');
  }

  computeCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  computeCosineSimilarities(queryVector: number[], vectors: number[][]): number[] {
    return vectors.map(v => this.computeCosineSimilarity(queryVector, v));
  }
}

export const embeddingService = new EmbeddingService();
