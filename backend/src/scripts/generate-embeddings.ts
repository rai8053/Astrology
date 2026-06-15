import 'dotenv/config';
import { prisma } from '../lib/prisma.js';
import { embeddingService } from '../services/rag/embedding.js';
import { logger } from '../lib/logger.js';

async function main() {
  logger.info('Generating embeddings for articles without them...');

  const articles = await prisma.$queryRawUnsafe(
    `SELECT id, title, content FROM "KnowledgeArticle" ORDER BY title ASC`,
  ) as Array<{ id: string; title: string; content: string }>;

  let updated = 0;
  let skipped = 0;

  for (const article of articles) {
    const existing = await prisma.$queryRawUnsafe(
      `SELECT embedding FROM "KnowledgeArticle" WHERE id = $1`,
      article.id,
    ) as Array<{ embedding: unknown }>;
    if (existing[0]?.embedding) {
      skipped++;
      continue;
    }

    const embedding = await embeddingService.generateEmbedding(
      `${article.title}\n\n${article.content}`,
    );

    await prisma.$executeRawUnsafe(
      `UPDATE "KnowledgeArticle" SET embedding = $1::double precision[], "updatedAt" = NOW() WHERE id = $2`,
      embedding,
      article.id,
    );
    updated++;

    if (updated % 10 === 0) {
      logger.info({ updated, total: articles.length }, 'Embedding generation progress');
    }
  }

  logger.info({ updated, skipped, total: articles.length }, 'Embedding generation complete');
  process.exit(0);
}

main().catch((err) => {
  logger.error({ err }, 'Embedding generation failed');
  process.exit(1);
});
