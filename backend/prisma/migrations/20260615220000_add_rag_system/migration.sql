-- Create KnowledgeArticle table
CREATE TABLE IF NOT EXISTS "KnowledgeArticle" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    source TEXT,
    metadata JSONB,
    embedding double precision[],
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_article_category ON "KnowledgeArticle" (category);
CREATE INDEX IF NOT EXISTS idx_knowledge_article_tags ON "KnowledgeArticle" USING gin (tags);

-- Create RetrievalMetric table
CREATE TABLE IF NOT EXISTS "RetrievalMetric" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sessionId" TEXT,
    "messageId" TEXT,
    query TEXT NOT NULL,
    k INTEGER NOT NULL,
    results INTEGER NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "tokensIn" INTEGER NOT NULL DEFAULT 0,
    "tokensOut" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retrieval_metric_session ON "RetrievalMetric" ("sessionId");
CREATE INDEX IF NOT EXISTS idx_retrieval_metric_created ON "RetrievalMetric" ("createdAt");
