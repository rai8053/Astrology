import { prisma } from '../../lib/prisma.js';
import { logger } from '../../lib/logger.js';
import { embeddingService } from './embedding.js';
import type { KnowledgeCategory, RetrievalResult } from '@shared/types/rag';

const DEFAULT_TOP_K = 5;
const MAX_TOP_K = 20;
const MIN_SCORE_THRESHOLD = 0.3;

interface RetrieveOptions {
  k?: number;
  category?: KnowledgeCategory | KnowledgeCategory[];
  tags?: string[];
  minScore?: number;
}

interface RetrievalMetrics {
  latencyMs: number;
  tokensIn: number;
  resultsCount: number;
}

interface ArticleWithEmbedding {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  source: string | null;
  createdat: Date;
  updatedat: Date;
  embedding: number[] | null;
}

export class RetrievalService {
  async retrieve(
    query: string,
    options: RetrieveOptions = {},
  ): Promise<{ results: RetrievalResult[]; metrics: RetrievalMetrics }> {
    const startTime = Date.now();
    const k = Math.min(options.k || DEFAULT_TOP_K, MAX_TOP_K);
    const minScore = options.minScore ?? MIN_SCORE_THRESHOLD;

    const queryVector = await embeddingService.generateEmbedding(query);

    const articles = await this.getArticlesWithEmbeddings(options);

    const articlesWithScores = articles
      .filter(a => Array.isArray(a.embedding) && a.embedding!.length > 0)
      .map(a => {
        const score = embeddingService.computeCosineSimilarity(queryVector, a.embedding!);
        return { article: a, score };
      })
      .filter(r => r.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, k);

    const results: RetrievalResult[] = articlesWithScores.map(r => ({
      article: {
        id: r.article.id,
        title: r.article.title,
        content: r.article.content,
        category: r.article.category as KnowledgeCategory,
        tags: r.article.tags,
        source: r.article.source,
        createdAt: r.article.createdat.toISOString(),
        updatedAt: r.article.updatedat.toISOString(),
      },
      score: r.score,
    }));

    const elapsed = Date.now() - startTime;
    const tokensIn = Math.ceil(query.length / 4);

    logger.info({
      query: query.slice(0, 100),
      k,
      resultsCount: results.length,
      totalCandidates: articles.length,
      latencyMs: elapsed,
      minScore,
    }, 'RAG retrieval completed');

    return {
      results,
      metrics: { latencyMs: elapsed, tokensIn, resultsCount: results.length },
    };
  }

  private async getArticlesWithEmbeddings(options: RetrieveOptions): Promise<ArticleWithEmbedding[]> {
    let sql = `SELECT id, title, content, category, tags, source, "createdAt" as createdat, "updatedAt" as updatedat, embedding FROM "KnowledgeArticle" WHERE 1=1`;
    const params: unknown[] = [];

    if (options.category) {
      if (Array.isArray(options.category)) {
        sql += ` AND category = ANY($${params.length + 1}::text[])`;
        params.push(options.category);
      } else {
        sql += ` AND category = $${params.length + 1}`;
        params.push(options.category);
      }
    }

    if (options.tags && options.tags.length > 0) {
      sql += ` AND tags && $${params.length + 1}::text[]`;
      params.push(options.tags);
    }

    sql += ' ORDER BY title ASC';

    return prisma.$queryRawUnsafe<ArticleWithEmbedding[]>(sql, ...params);
  }

  async logMetrics(
    sessionId: string | null,
    messageId: string | null,
    query: string,
    k: number,
    resultsCount: number,
    latencyMs: number,
    tokensIn: number,
  ): Promise<void> {
    try {
      await prisma.retrievalMetric.create({
        data: {
          sessionId,
          messageId,
          query,
          k,
          results: resultsCount,
          latencyMs,
          tokensIn,
        },
      });
    } catch (err) {
      logger.warn({ err }, 'Failed to log retrieval metric');
    }
  }

  async findSimilar(query: string, excludeIds: string[], k: number = 3): Promise<RetrievalResult[]> {
    const queryVector = await embeddingService.generateEmbedding(query);

    const sql = `SELECT id, title, content, category, tags, source, "createdAt" as createdat, "updatedAt" as updatedat, embedding FROM "KnowledgeArticle" WHERE id != ALL($1::text[]) AND embedding IS NOT NULL ORDER BY title ASC`;
    const articles = await prisma.$queryRawUnsafe<ArticleWithEmbedding[]>(sql, excludeIds);

    const scored = articles
      .filter(a => Array.isArray(a.embedding) && a.embedding!.length > 0)
      .map(a => ({
        article: a,
        score: embeddingService.computeCosineSimilarity(queryVector, a.embedding!),
      }))
      .filter(r => r.score >= MIN_SCORE_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, k);

    return scored.map(r => ({
      article: {
        id: r.article.id,
        title: r.article.title,
        content: r.article.content,
        category: r.article.category as KnowledgeCategory,
        tags: r.article.tags,
        source: r.article.source,
        createdAt: r.article.createdat.toISOString(),
        updatedAt: r.article.updatedat.toISOString(),
      },
      score: r.score,
    }));
  }
}

export const retrievalService = new RetrievalService();
