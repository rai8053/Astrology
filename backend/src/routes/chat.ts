import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { generateAIResponse, streamAIResponse } from '../lib/ai.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { calculateBirthDetails } from '../services/astrology/calculator.js';
import { RASHI_DATA, RASHI_KEYS } from '../services/astrology/constants.js';

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
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, birthDate: true, birthTime: true, birthPlace: true },
  });

  if (!user?.birthDate || !user?.birthTime) return '';

  const parts: string[] = [];
  if (user.name) parts.push(`Name: ${user.name}`);
  parts.push(`Date of Birth: ${user.birthDate}`);
  parts.push(`Time of Birth: ${user.birthTime}`);
  if (user.birthPlace) parts.push(`Place of Birth: ${user.birthPlace}`);

  // Calculate full birth chart on the fly
  const details = calculateBirthDetails(user.birthDate, user.birthTime);
  const rd = RASHI_DATA[details.rashiKey] || RASHI_DATA.Mesh;
  const ld = RASHI_DATA[details.lagnaKey] || RASHI_DATA.Mesh;

  parts.push('');
  parts.push('--- HOUSES & PLANETARY POSITIONS ---');
  parts.push(`Ascendant (Lagna): ${details.lagnaKey} (${ld.translation}) at ${details.ascendant.degrees}°${details.ascendant.minutes}' — House 1`);
  const planets = [
    { name: 'Sun (Surya)', pos: details.sun },
    { name: 'Moon (Chandra)', pos: details.moon },
    { name: 'Mercury (Budha)', pos: details.mercury },
    { name: 'Venus (Shukra)', pos: details.venus },
    { name: 'Mars (Mangal)', pos: details.mars },
    { name: 'Jupiter (Guru)', pos: details.jupiter },
    { name: 'Saturn (Shani)', pos: details.saturn },
    { name: 'Rahu (North Node)', pos: details.rahu },
    { name: 'Ketu (South Node)', pos: details.ketu },
  ];
  for (const p of planets) {
    const signKey = RASHI_KEYS[p.pos.signIndex];
    const signLord = (RASHI_DATA[signKey]?.lord || 'Unknown').split('/')[0].trim();
    parts.push(`${p.name}: ${p.pos.signName} at ${p.pos.degrees}°${p.pos.minutes}' — House ${p.pos.house}, ruled by ${signLord}`);
  }

  parts.push('');
  parts.push('--- CHART SUMMARY ---');
  parts.push(`Moon Sign (Rashi): ${details.rashiKey} (${rd.translation})`);
  parts.push(`Ascendant (Lagna): ${details.lagnaKey} (${ld.translation})`);
  parts.push(`Birth Star (Nakshatra): ${details.nakshatraName}, ruled by ${details.moonNakshatraLord}`);
  parts.push(`Rashi Lord: ${rd.lord}`);
  parts.push(`Element: ${rd.element}`);
  parts.push(`Dosha Dominance: ${rd.dosha}`);

  parts.push('');
  parts.push('--- 7TH HOUSE (MARRIAGE) ---');
  // 7th house = (Ascendant sign index + 6) % 12
  const seventhHouseSignIdx = (details.lagnaIndex + 6) % 12;
  const seventhHouseKey = RASHI_KEYS[seventhHouseSignIdx];
  const seventhLord = RASHI_DATA[seventhHouseKey]?.lord?.split('/')[0].trim() || 'Unknown';
  // Find planets in 7th house
  const planetsIn7th = planets.filter(p => p.pos.house === 7).map(p => p.name.split('(')[0].trim());
  // Find 7th lord position
  const lordPlanet = planets.find(p => p.name.includes(seventhLord));
  parts.push(`7th House Sign: ${seventhHouseKey} (${RASHI_DATA[seventhHouseKey]?.translation || ''})`);
  parts.push(`7th Lord: ${seventhLord}`);
  if (lordPlanet) parts.push(`7th Lord placed in: ${lordPlanet.pos.signName}, House ${lordPlanet.pos.house}`);
  if (planetsIn7th.length > 0) parts.push(`Planets in 7th House: ${planetsIn7th.join(', ')}`);
  else parts.push('No planets in 7th House');

  // Venus position for marriage analysis
  const venusLord = RASHI_DATA[RASHI_KEYS[details.venus.signIndex]]?.lord?.split('/')[0].trim() || 'Unknown';
  parts.push(`Venus (karaka of marriage) in: ${details.venus.signName}, House ${details.venus.house}, ruled by ${venusLord}`);

  parts.push('');
  parts.push('--- VIMSHOTTARI DASHAS (timing periods) ---');
  if (details.dashas && details.dashas.length > 0) {
    for (const d of details.dashas.slice(0, 5)) {
      parts.push(`${d.planet}: ${d.startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} — ${d.endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} (${d.years} years)`);
    }
    if (details.currentDasha) {
      parts.push(`CURRENT PERIOD: ${details.currentDasha.dasha.planet} Mahadasha`);
      parts.push(`CURRENT SUB-PERIOD: ${details.currentDasha.antardasha.planet} Antardasha (${details.currentDasha.antardasha.startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} — ${details.currentDasha.antardasha.endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })})`);
    }
  }

  parts.push('');
  parts.push('--- TITHI / YOGA / KARANA ---');
  parts.push(`Tithi (Lunar Day): ${details.tithi.name} (${details.tithi.paksha})`);
  parts.push(`Yoga: ${details.yoga.name}`);
  parts.push(`Karana: ${details.karana.name}`);

  return `USER'S COMPLETE VEDIC BIRTH CHART (use this data to personalize every response — all positions are sidereal Vedic):\n${parts.join('\n')}`;
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
      ? 'Astrology AI unavailable (credits exhausted — add credits or switch OpenRouter models)'
      : `Chat error: ${errMsg}`;

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
    const errStack = error instanceof Error ? error.stack : '';
    const isCreditError = errMsg.toLowerCase().includes('credit') || errMsg.includes('402') || errMsg.toLowerCase().includes('payment') || errMsg.toLowerCase().includes('insufficient_quota');
    logger.error({ errMsg, errStack, sessionId: session.id, isCreditError }, 'Chat stream failed');

    const userMessage = isCreditError
      ? 'Astrology AI unavailable (credits exhausted — add credits or switch OpenRouter models)'
      : `Chat error: ${errMsg}`;

    res.write(`data: ${JSON.stringify({ error: true, text: userMessage })}\n\n`);
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
