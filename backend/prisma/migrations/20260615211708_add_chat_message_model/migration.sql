/*
  Warnings:

  - The `messages` column on the `ChatSession` table will be dropped (data will be migrated to the new `ChatMessage` table).
  - The `context` column on the `ChatSession` table will be dropped.

*/

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "model" TEXT,
    "embeddingId" TEXT,
    "metadata" JSONB,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE INDEX "ChatMessage_sessionId_idx" ON "ChatMessage"("sessionId");
CREATE INDEX "ChatMessage_sessionId_createdAt_idx" ON "ChatMessage"("sessionId", "createdAt");
CREATE INDEX "ChatMessage_role_idx" ON "ChatMessage"("role");
CREATE INDEX "ChatMessage_deletedAt_idx" ON "ChatMessage"("deletedAt");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: migrate existing JSON messages into ChatMessage table
-- Each element in the JSON array becomes one row, preserving order via ordinality.
INSERT INTO "ChatMessage" ("id", "sessionId", "role", "content", "tokenCount", "createdAt")
SELECT
    gen_random_uuid()::text,
    cs."id",
    CASE
        WHEN msg->>'role' = 'assistant' THEN 'ASSISTANT'::"MessageRole"
        WHEN msg->>'role' = 'system' THEN 'SYSTEM'::"MessageRole"
        ELSE 'USER'::"MessageRole"
    END,
    COALESCE(msg->>'content', ''),
    GREATEST(1, CEIL(LENGTH(COALESCE(msg->>'content', '')) / 4.0))::int,
    -- Use createdAt from the JSON if available, otherwise use the session's creation time + ordinal offset
    COALESCE(
        (msg->>'createdAt')::timestamptz,
        cs."createdAt" + (arr.ordinality * interval '1 second')
    )
FROM "ChatSession" cs
CROSS JOIN LATERAL jsonb_array_elements(
    CASE
        WHEN cs."messages" IS NOT NULL AND jsonb_typeof(cs."messages"::jsonb) = 'array'
        THEN cs."messages"::jsonb
        ELSE '[]'::jsonb
    END
) WITH ORDINALITY AS arr(msg, ordinality)
WHERE cs."messages" IS NOT NULL;

-- Add deletedAt to ChatSession
ALTER TABLE "ChatSession" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "ChatSession_deletedAt_idx" ON "ChatSession"("deletedAt");

-- Drop old columns
ALTER TABLE "ChatSession" DROP COLUMN IF EXISTS "messages";
ALTER TABLE "ChatSession" DROP COLUMN IF EXISTS "context";

-- Update the underlying Prisma-generated SQL for the generated column (safety)
-- Reset the ChatSession updatedAt to now for affected rows
UPDATE "ChatSession" SET "updatedAt" = NOW() WHERE "deletedAt" IS NULL;
