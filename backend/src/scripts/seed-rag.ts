import 'dotenv/config';
import { seedKnowledgeBase } from '../services/rag/seed.js';
import { logger } from '../lib/logger.js';

async function main() {
  logger.info('Starting RAG knowledge base seeding...');
  const result = await seedKnowledgeBase();
  logger.info({ created: result.created, skipped: result.skipped }, 'RAG seeding done');
  process.exit(0);
}

main().catch((err) => {
  logger.error({ err }, 'RAG seeding failed');
  process.exit(1);
});
