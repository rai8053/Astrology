import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { requirePremium } from '../middleware/subscription.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { generateAIResponse } from '../lib/ai.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export const chatRouter = Router();

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(5000, 'Message too long (max 5000 chars)'),
  sessionId: z.string().optional(),
  language: z.string().optional(),
});

chatRouter.post('/', authenticate, requirePremium, validate(chatSchema), asyncHandler(async (req, res) => {
  const { message, sessionId, language } = req.body as z.infer<typeof chatSchema>;
  const userId = req.user!.userId;

  let session = sessionId
    ? await prisma.chatSession.findFirst({ where: { id: sessionId, userId } })
    : null;

  if (!session) {
    session = await prisma.chatSession.create({
      data: { userId, title: message.slice(0, 60), messages: [] },
    });
  }

  const messages = (session.messages as Array<{ role: string; content: string }>) || [];
  const context = messages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n').slice(-3000);
  const prompt = `Previous conversation:\n${context}\n\nUser: ${message}`;

  try {
    const aiResponse = await generateAIResponse(
      prompt,
      `You are a wise Vedic astrologer and spiritual guide. Provide compassionate, insightful answers about astrology, numerology, and spiritual matters. Keep responses helpful, grounded, and respectful.${language ? ` Respond in the user's selected language: ${language}.` : ''}`,
    );

    const updatedMessages = [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse.text },
    ];

    await prisma.chatSession.update({
      where: { id: session.id },
      data: { messages: JSON.parse(JSON.stringify(updatedMessages)) },
    });

    await prisma.usageRecord.create({
      data: { userId, feature: 'chat', tokensIn: message.length, tokensOut: aiResponse.text.length },
    }).catch(() => {});

    res.json({ success: true, data: { reply: aiResponse.text, sessionId: session.id, provider: aiResponse.provider } });
  } catch (error) {
    logger.error({ error }, 'Chat AI failed');
    const fallbackMsg = 'The cosmic energies are shifting. Please try again in a moment.';
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { messages: JSON.parse(JSON.stringify([...messages, { role: 'user', content: message }, { role: 'assistant', content: fallbackMsg }])) },
    }).catch(() => {});
    res.json({ success: true, data: { reply: fallbackMsg, sessionId: session.id } });
  }
}));

chatRouter.get('/sessions', authenticate, asyncHandler(async (req, res) => {
  const sessions = await prisma.chatSession.findMany({
    where: { userId: req.user!.userId },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, updatedAt: true, createdAt: true },
    take: 50,
  });
  res.json({ success: true, data: sessions });
}));

chatRouter.get('/sessions/:id', authenticate, asyncHandler(async (req, res) => {
  const session = await prisma.chatSession.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
  res.json({ success: true, data: session });
}));

chatRouter.delete('/sessions/:id', authenticate, asyncHandler(async (req, res) => {
  await prisma.chatSession.deleteMany({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  res.json({ success: true, message: 'Session deleted' });
}));
