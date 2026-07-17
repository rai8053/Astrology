-- Create GIN index for full-text search on KnowledgeArticle
-- Enables efficient to_tsvector / to_tsquery search for RAG retrieval
CREATE INDEX IF NOT EXISTS "KnowledgeArticle_fts_idx"
  ON "KnowledgeArticle"
  USING GIN (to_tsvector('english', coalesce(content, '') || ' ' || coalesce(title, '')));
