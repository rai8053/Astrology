import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import type { MessageRole } from '@shared/types/chat';
import type { ChatMessage, ChatSession } from '@prisma/client';

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

type PaginatedResult<T> = { data: T[]; meta: PaginationMeta };

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;
const CONTEXT_WINDOW = 10;
const CONTEXT_TRUNCATE = 3000;

type PrismaMsgRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

function toPrismaRole(role: MessageRole): PrismaMsgRole {
  if (role === 'user') return 'USER';
  if (role === 'assistant') return 'ASSISTANT';
  return 'SYSTEM';
}

function toAppRole(role: PrismaMsgRole): MessageRole {
  if (role === 'USER') return 'user';
  if (role === 'ASSISTANT') return 'assistant';
  return 'system';
}

function serializeMessage(msg: ChatMessage): {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  tokenCount: number;
  model: string | null;
  embeddingId: string | null;
  createdAt: string;
} {
  return {
    id: msg.id,
    sessionId: msg.sessionId,
    role: toAppRole(msg.role),
    content: msg.content,
    tokenCount: msg.tokenCount,
    model: msg.model ?? null,
    embeddingId: msg.embeddingId ?? null,
    createdAt: msg.createdAt.toISOString(),
  };
}

function buildMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
}

function clampPageSize(limit: number | undefined | null): number {
  if (!limit || limit < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(limit, MAX_PAGE_SIZE);
}

function clampPage(page: number | undefined | null): number {
  if (!page || page < 1) return 1;
  return page;
}

// ──────────────────────────────────────────
// Session methods
// ──────────────────────────────────────────

export async function findOrCreateSession(
  userId: string,
  sessionId?: string | null,
  title?: string,
): Promise<ChatSession> {
  if (sessionId) {
    const existing = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId, deletedAt: null },
    });
    if (existing) return existing;
  }

  return prisma.chatSession.create({
    data: {
      userId,
      title: title?.slice(0, 60) ?? null,
    },
  });
}

export async function getSession(
  sessionId: string,
  userId: string,
): Promise<ChatSession | null> {
  return prisma.chatSession.findFirst({
    where: { id: sessionId, userId, deletedAt: null },
  });
}

export async function listSessions(
  userId: string,
  page?: number,
  limit?: number,
): Promise<PaginatedResult<{
  id: string;
  title: string | null;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}>> {
  const p = clampPage(page);
  const l = clampPageSize(limit);

  const [total, sessions] = await Promise.all([
    prisma.chatSession.count({
      where: { userId, deletedAt: null },
    }),
    prisma.chatSession.findMany({
      where: { userId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      skip: (p - 1) * l,
      take: l,
      include: {
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true, content: true },
        },
        _count: {
          select: { messages: { where: { deletedAt: null } } },
        },
      },
    }),
  ]);

  const data = sessions.map((s) => ({
    id: s.id,
    title: s.title ?? null,
    messageCount: s._count.messages,
    lastMessageAt: s.messages[0]?.createdAt.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return { data, meta: buildMeta(total, p, l) };
}

export async function softDeleteSession(
  sessionId: string,
  userId: string,
): Promise<void> {
  const now = new Date();
  await prisma.chatSession.updateMany({
    where: { id: sessionId, userId, deletedAt: null },
    data: { deletedAt: now },
  });
  await prisma.chatMessage.updateMany({
    where: { sessionId, deletedAt: null },
    data: { deletedAt: now },
  });
}

// ──────────────────────────────────────────
// Message methods
// ──────────────────────────────────────────

export async function addMessage(
  sessionId: string,
  role: MessageRole,
  content: string,
  options?: {
    tokenCount?: number;
    model?: string;
    embeddingId?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<ChatMessage> {
  return prisma.chatMessage.create({
    data: {
      sessionId,
      role: toPrismaRole(role),
      content,
      tokenCount: options?.tokenCount ?? estimateTokenCount(content),
      model: options?.model ?? null,
      embeddingId: options?.embeddingId ?? null,
      metadata: (options?.metadata ?? null) as any,
    },
  });
}

export async function addMessages(
  sessionId: string,
  messages: Array<{
    role: MessageRole;
    content: string;
    tokenCount?: number;
    model?: string;
    embeddingId?: string;
    metadata?: Record<string, unknown>;
  }>,
): Promise<number> {
  const created = await prisma.chatMessage.createMany({
    data: messages.map((m) => ({
      sessionId,
      role: toPrismaRole(m.role),
      content: m.content,
      tokenCount: m.tokenCount ?? estimateTokenCount(m.content),
      model: m.model ?? null,
      embeddingId: m.embeddingId ?? null,
      metadata: (m.metadata ?? null) as any,
    })),
  });
  return created.count;
}

export async function getMessages(
  sessionId: string,
  userId: string,
  options?: {
    page?: number;
    limit?: number;
    order?: 'newest' | 'oldest';
  },
): Promise<PaginatedResult<ReturnType<typeof serializeMessage>>> {
  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId, deletedAt: null },
  });
  if (!session) {
    return { data: [], meta: buildMeta(0, 1, DEFAULT_PAGE_SIZE) };
  }

  const p = clampPage(options?.page);
  const l = clampPageSize(options?.limit);
  const order = options?.order ?? 'oldest';
  const sortDir = order === 'newest' ? 'desc' : 'asc';

  const [total, messages] = await Promise.all([
    prisma.chatMessage.count({
      where: { sessionId, deletedAt: null },
    }),
    prisma.chatMessage.findMany({
      where: { sessionId, deletedAt: null },
      orderBy: { createdAt: sortDir },
      skip: (p - 1) * l,
      take: l,
    }),
  ]);

  const data = messages.map(serializeMessage);

  // When returning newest-first, reverse so caller still gets ascending chronological order internally
  if (order === 'newest') {
    data.reverse();
  }

  return {
    data,
    meta: {
      ...buildMeta(total, p, l),
      page: p,
      limit: l,
    },
  };
}

export async function getMessageHistory(
  sessionId: string,
  userId: string,
  lastN: number = CONTEXT_WINDOW,
): Promise<Array<{ role: string; content: string }>> {
  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId, deletedAt: null },
  });
  if (!session) return [];

  const messages = await prisma.chatMessage.findMany({
    where: { sessionId, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    take: lastN,
    skip: Math.max(0, await prisma.chatMessage.count({
      where: { sessionId, deletedAt: null },
    }) - lastN),
  });

  return messages.map((m) => ({
    role: toAppRole(m.role),
    content: m.content,
  }));
}

export async function buildContextString(
  sessionId: string,
  userId: string,
  lastN: number = CONTEXT_WINDOW,
): Promise<string> {
  const history = await getMessageHistory(sessionId, userId, lastN);
  return history
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n')
    .slice(-CONTEXT_TRUNCATE);
}

export async function softDeleteMessage(
  messageId: string,
  userId: string,
): Promise<boolean> {
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: { session: { select: { userId: true } } },
  });
  if (!message || message.session.userId !== userId) return false;

  await prisma.chatMessage.update({
    where: { id: messageId },
    data: { deletedAt: new Date() },
  });
  return true;
}

export async function countSessionMessages(sessionId: string): Promise<number> {
  return prisma.chatMessage.count({
    where: { sessionId, deletedAt: null },
  });
}

export async function updateSessionTimestamp(sessionId: string): Promise<void> {
  await prisma.chatSession.update({
    where: { id: sessionId },
    data: { updatedAt: new Date() },
  });
}

// ──────────────────────────────────────────
// Token estimation (character-based fallback)
// ──────────────────────────────────────────

export function estimateTokenCount(text: string): number {
  // Rough estimate: ~4 characters per token for most languages
  return Math.ceil(text.length / 4);
}

// ──────────────────────────────────────────
// Usage tracking
// ──────────────────────────────────────────

export async function trackUsage(
  userId: string,
  feature: string,
  tokensIn: number,
  tokensOut: number,
): Promise<void> {
  await prisma.usageRecord.create({
    data: { userId, feature, tokensIn, tokensOut },
  }).catch((err) => {
    logger.warn({ err, userId, feature }, 'Failed to track usage');
  });
}

export const DAILY_FREE_LIMIT = 10;

export async function checkDailyLimit(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [count, sub] = await Promise.all([
    prisma.usageRecord.count({
      where: { userId, feature: 'chat', createdAt: { gte: today } },
    }),
    prisma.subscription.findUnique({ where: { userId } }),
  ]);

  const isPremium =
    sub &&
    (sub.plan !== 'FREE' ||
      (sub.status === 'TRIALING' && sub.trialEnd && sub.trialEnd > new Date()));

  if (isPremium) return { allowed: true, used: count, limit: Infinity };

  return { allowed: count < DAILY_FREE_LIMIT, used: count, limit: DAILY_FREE_LIMIT };
}
