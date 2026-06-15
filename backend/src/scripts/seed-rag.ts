import 'dotenv/config';
import { seedKnowledgeBase } from '../services/rag/seed.js';

async function main() {
  console.log('Starting RAG knowledge base seeding...');
  const result = await seedKnowledgeBase();
  console.log(`Done: ${result.created} created, ${result.skipped} skipped`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
