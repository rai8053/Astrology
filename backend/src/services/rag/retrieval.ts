import { prisma } from '../../lib/prisma.js';
import { logger } from '../../lib/logger.js';
import type { KnowledgeCategory, RetrievalResult } from '@shared/types/rag';

const DEFAULT_TOP_K = 5;
const MAX_TOP_K = 20;

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
}

export class RetrievalService {
  async retrieve(
    query: string,
    options: RetrieveOptions = {},
  ): Promise<{ results: RetrievalResult[]; metrics: RetrievalMetrics }> {
    const startTime = Date.now();
    const k = Math.min(options.k || DEFAULT_TOP_K, MAX_TOP_K);

    const articles = await this.searchArticles(query, options, k);

    const results: RetrievalResult[] = articles.map((a, i) => ({
      article: {
        id: a.id,
        title: a.title,
        content: a.content,
        category: a.category as KnowledgeCategory,
        tags: a.tags,
        source: a.source,
        createdAt: a.createdat.toISOString(),
        updatedAt: a.updatedat.toISOString(),
      },
      score: 1 - (i / articles.length),
    }));

    const elapsed = Date.now() - startTime;
    const tokensIn = Math.ceil(query.length / 4);

    logger.info({
      query: query.slice(0, 100),
      k,
      resultsCount: results.length,
      latencyMs: elapsed,
    }, 'RAG retrieval completed');

    return {
      results,
      metrics: { latencyMs: elapsed, tokensIn, resultsCount: results.length },
    };
  }

  private async searchArticles(query: string, options: RetrieveOptions, k: number): Promise<ArticleWithEmbedding[]> {
    const terms = query.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean).slice(0, 10);
    if (terms.length === 0) return [];

    const tsQuery = terms.map(t => `${t}:*`).join(' & ');
    const textSearch = `to_tsvector('english', content || ' ' || title) @@ to_tsquery('english', $1)`;
    const rankExpr = `ts_rank(to_tsvector('english', content || ' ' || title), to_tsquery('english', $1))`;
    let sql = `SELECT id, title, content, category, tags, source, "createdAt" as createdat, "updatedAt" as updatedat FROM "KnowledgeArticle" WHERE ${textSearch}`;
    const params: unknown[] = [tsQuery];
    let paramIdx = 2;

    if (options.category) {
      if (Array.isArray(options.category)) {
        sql += ` AND category = ANY($${paramIdx}::text[])`;
        params.push(options.category);
      } else {
        sql += ` AND category = $${paramIdx}`;
        params.push(options.category);
      }
      paramIdx++;
    }

    if (options.tags && options.tags.length > 0) {
      sql += ` AND tags && $${paramIdx}::text[]`;
      params.push(options.tags);
      paramIdx++;
    }

    sql += ` ORDER BY ${rankExpr} DESC LIMIT $${paramIdx}`;
    params.push(k);

    return await prisma.$queryRawUnsafe(sql, ...params) as ArticleWithEmbedding[];
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
    const terms = query.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean).slice(0, 5);
    if (terms.length === 0) return [];

    const tsQuery = terms.map(t => `${t}:*`).join(' & ');
    const textSearch = `to_tsvector('english', content || ' ' || title) @@ to_tsquery('english', $2)`;
    const rankExpr = `ts_rank(to_tsvector('english', content || ' ' || title), to_tsquery('english', $2))`;
    const sql = `SELECT id, title, content, category, tags, source, "createdAt" as createdat, "updatedAt" as updatedat FROM "KnowledgeArticle" WHERE id != ALL($1::text[]) AND ${textSearch} ORDER BY ${rankExpr} DESC LIMIT $3`;
    const articles = await prisma.$queryRawUnsafe(sql, excludeIds, tsQuery, k) as ArticleWithEmbedding[];

    return articles.map((a, i) => ({
      article: {
        id: a.id,
        title: a.title,
        content: a.content,
        category: a.category as KnowledgeCategory,
        tags: a.tags,
        source: a.source,
        createdAt: a.createdat.toISOString(),
        updatedAt: a.updatedat.toISOString(),
      },
      score: 1 - (i / articles.length),
    }));
  }
}

export const retrievalService = new RetrievalService();
