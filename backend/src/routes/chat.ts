import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { generateAIResponse, streamAIResponse } from '../lib/ai.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

const isDev = process.env.NODE_ENV !== 'production';

export const chatRouter = Router();

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(5000, 'Message too long (max 5000 chars)'),
  sessionId: z.string().nullish(),
  language: z.string().optional(),
});

const DAILY_FREE_LIMIT = 10;

async function checkDailyLimit(userId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const count = await prisma.usageRecord.count({
    where: { userId, feature: 'chat', createdAt: { gte: today } },
  });

  const sub = await prisma.subscription.findUnique({ where: { userId } });
  const isPremium = sub && (sub.plan !== 'FREE' || (sub.status === 'TRIALING' && sub.trialEnd && sub.trialEnd > new Date()));
  if (isPremium) return { allowed: true, used: count, limit: Infinity };

  return { allowed: count < DAILY_FREE_LIMIT, used: count, limit: DAILY_FREE_LIMIT };
}

async function buildPersonalizedPrompt(userId: string): Promise<string> {
  const [user, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, birthDate: true, birthTime: true, birthPlace: true },
    }),
    prisma.astrologyProfile.findUnique({ where: { userId } }),
  ]);

  const parts: string[] = [];
  if (user?.name) parts.push(`User's Name: ${user.name}`);
  if (user?.birthDate) parts.push(`Date of Birth: ${user.birthDate}`);
  if (user?.birthTime) parts.push(`Time of Birth: ${user.birthTime}`);
  if (user?.birthPlace) parts.push(`Place of Birth: ${user.birthPlace}`);

  if (profile) {
    if (profile.rashi) parts.push(`Moon Sign (Rashi): ${profile.rashi}`);
    if (profile.lagna) parts.push(`Ascendant (Lagna): ${profile.lagna}`);
    if (profile.nakshatra) parts.push(`Birth Star (Nakshatra): ${profile.nakshatra}`);
    if (profile.nakshatraLord) parts.push(`Nakshatra Lord: ${profile.nakshatraLord}`);
    if (profile.rashiLord) parts.push(`Rashi Lord: ${profile.rashiLord}`);
    if (profile.element) parts.push(`Element: ${profile.element}`);
    if (profile.doshaDominance) parts.push(`Dosha Dominance: ${profile.doshaDominance}`);
  }

  if (parts.length === 0) return '';
  return `USER'S ASTROLOGICAL DATA (use this to personalize your response):\n${parts.join('\n')}`;
}

function buildSystemInstruction(birthData: string, language?: string): string {
  let instruction = `You are Soma & Surya, an expert Vedic astrologer with 30+ years of experience. You provide profound, personalized, and practical astrological guidance.

RESPONSE STRUCTURE — Format every answer with these four sections using markdown:
1. **Direct Answer** — Address the question directly with clarity.
2. **Astrological Reasoning** — Explain the planetary or chart-based reasoning. Reference specific houses, planets, nakshatras, or signs.
3. **Personalized Insight** — Connect the answer to the user's specific situation using their birth data when available.
4. **Practical Recommendation** — Give actionable, grounded advice the user can apply.

LANGUAGE & TONE:
- Use professional yet warm language. Write as a wise guru speaking to a sincere seeker.
- Be specific, not vague: mention actual planets, houses, nakshatras, and dashas.
- If birth data is incomplete, acknowledge what is missing and explain that a full reading requires the complete birth chart.
- For gemstone recommendations: ALWAYS explain that the ideal gemstone depends on a full birth chart analysis (planetary positions, strengths, houses). Never reduce a recommendation to just Sun sign or Moon sign. Provide general guidance but strongly recommend a complete chart analysis.
- Never claim to predict exact future events. Frame insights as "tendencies", "influences", and "favorable periods".
- Target 150-400 words depending on question complexity. Do not truncate — write complete sentences.
- Use proper markdown formatting throughout: headings (###), **bold** for key astrological terms, bullet points for lists, and line breaks between sections.
- The user sees rendered markdown, so format deliberately.

BOUNDARIES:
- Do NOT provide medical advice. Suggest consulting a doctor for health concerns.
- Do NOT promise guaranteed financial or relationship outcomes.
- Do NOT claim to remove curses or black magic.
- If the question is outside astrology, gently guide the conversation back to astrological topics.`;

  if (birthData) {
    instruction += `\n\n${birthData}\n\nUse the above data to personalize every response. Reference the user's chart elements directly when relevant.`;
  }

  if (language) {
    instruction += `\n\nIMPORTANT: Respond in the user's selected language: ${language}. Maintain the same depth, structure, and format regardless of language.`;
  }

  return instruction;
}

chatRouter.post('/', authenticate, validate(chatSchema), asyncHandler(async (req, res) => {
  const { message, sessionId, language } = req.body as z.infer<typeof chatSchema>;
  const userId = req.user!.userId;

  const limit = await checkDailyLimit(userId);
  if (!limit.allowed) {
    res.json({
      success: true,
      data: {
        reply: `You've used ${limit.used}/${limit.limit} free questions today. Upgrade to Premium for unlimited chat, detailed chart analysis, and more.`,
        sessionId: null,
        limitExceeded: true,
      },
    });
    return;
  }

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
  const birthData = await buildPersonalizedPrompt(userId);
  const systemInstruction = buildSystemInstruction(birthData, language);

  try {
    logger.info({ sessionId: session.id, messageLength: message.length, hasBirthData: !!birthData, hasLanguage: !!language, dailyUsed: limit.used }, 'Chat request starting');

    const aiResponse = await generateAIResponse(prompt, systemInstruction);

    logger.info({ provider: aiResponse.provider, model: aiResponse.model, textLength: aiResponse.text.length }, 'Chat AI response succeeded');

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

    res.json({
      success: true,
      data: {
        reply: aiResponse.text,
        sessionId: session.id,
        provider: aiResponse.provider,
        dailyUsed: limit.used + 1,
        dailyLimit: limit.limit,
      },
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : '';
    const isCreditError = errMsg.toLowerCase().includes('credit') || errMsg.includes('402') || errMsg.toLowerCase().includes('payment');
    logger.error({ errMsg, errStack, sessionId: session.id, isCreditError }, 'Chat AI failed');

    const userMessage = isCreditError
      ? 'The astrology AI is temporarily unavailable. Please try again shortly.'
      : isDev
        ? `[DEV ERROR] ${errMsg}`
        : 'The cosmic energies are shifting. Please try again in a moment.';

    await prisma.chatSession.update({
      where: { id: session.id },
      data: { messages: JSON.parse(JSON.stringify([...messages, { role: 'user', content: message }, { role: 'assistant', content: userMessage }])) },
    }).catch(() => {});

    res.json({
      success: true,
      data: { reply: userMessage, sessionId: session.id, dailyUsed: limit.used + 1, dailyLimit: limit.limit },
    });
  }
}));

chatRouter.post('/stream', authenticate, validate(chatSchema), asyncHandler(async (req, res) => {
  const { message, sessionId, language } = req.body as z.infer<typeof chatSchema>;
  const userId = req.user!.userId;

  const limit = await checkDailyLimit(userId);
  if (!limit.allowed) {
    res.json({
      success: true,
      data: {
        reply: `You've used ${limit.used}/${limit.limit} free questions today. Upgrade to Premium for unlimited access.`,
        sessionId: null,
        limitExceeded: true,
      },
    });
    return;
  }

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
  const birthData = await buildPersonalizedPrompt(userId);
  const systemInstruction = buildSystemInstruction(birthData, language);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let fullText = '';
  const controller = new AbortController();

  req.on('close', () => controller.abort());

  try {
    const stream = streamAIResponse(prompt, systemInstruction, controller.signal);
    for await (const chunk of stream) {
      fullText += chunk;
      res.write(`data: ${JSON.stringify({ text: fullText })}\n\n`);
    }

    const updatedMessages = [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: fullText },
    ];

    await prisma.chatSession.update({
      where: { id: session.id },
      data: { messages: JSON.parse(JSON.stringify(updatedMessages)) },
    });

    await prisma.usageRecord.create({
      data: { userId, feature: 'chat', tokensIn: message.length, tokensOut: fullText.length },
    }).catch(() => {});

    res.write(`data: ${JSON.stringify({ done: true, sessionId: session.id, dailyUsed: limit.used + 1, dailyLimit: limit.limit })}\n\n`);
    res.end();
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error({ errMsg, sessionId: session.id }, 'Chat stream failed');
    res.write(`data: ${JSON.stringify({ error: true, text: fullText || 'The cosmic energies are shifting. Please try again in a moment.' })}\n\n`);
    res.end();
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
