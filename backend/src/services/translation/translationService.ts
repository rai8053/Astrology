import { createHash } from 'node:crypto';
import { cacheGet, cacheSet } from '../../lib/cache.js';
import { logger } from '../../lib/logger.js';
import { prisma } from '../../lib/prisma.js';
import { generateAIResponse } from '../../lib/ai.js';

const DEFAULT_TTL_SECONDS = 30 * 24 * 60 * 60;
const MAX_TEXT_LENGTH = 10000;
const CACHE_PREFIX = 'translation:';

interface TranslationResult {
  translatedText: string;
  cached: boolean;
  model?: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
}

interface TranslationCacheEntry {
  id: string;
  translatedText: string;
  model: string | null;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
}

const NEVER_TRANSLATE = new Set([
  'Rahu', 'Ketu', 'Nakshatra', 'Dasha', 'Mahadasha', 'Antardasha',
  'Yoga', 'Kundli', 'Lagna', 'Rashi', 'Navamsa',
]);

function hashText(text: string): string {
  return createHash('sha256').update(text, 'utf-8').digest('hex');
}

function buildTranslationPrompt(text: string, targetLanguage: string): string {
  return `You are an expert multilingual translator.

Translate the provided text into ${targetLanguage}.

Requirements:
- Preserve meaning exactly.
- Preserve Markdown.
- Preserve HTML.
- Preserve formatting.
- Preserve URLs.
- Preserve dates.
- Preserve numbers.
- Preserve emojis.
- Preserve astrology terminology.

Never translate:
${Array.from(NEVER_TRANSLATE).join('\n')}

Translate zodiac signs using local language equivalents.

Return ONLY translated text.
Do not explain.

Text to translate:
${text}`;
}

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage = 'en',
): Promise<TranslationResult> {
  if (!text || text.length === 0) {
    return { translatedText: '', cached: false, model: undefined, tokensIn: 0, tokensOut: 0, latencyMs: 0 };
  }

  if (targetLanguage === sourceLanguage) {
    return { translatedText: text, cached: false, model: undefined, tokensIn: 0, tokensOut: 0, latencyMs: 0 };
  }

  if (text.length > MAX_TEXT_LENGTH) {
    throw new Error(`Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`);
  }

  const textHash = hashText(text);
  const cacheKey = `${CACHE_PREFIX}${targetLanguage}:${textHash}`;

  const cached = await cacheGet<TranslationCacheEntry>(cacheKey);
  if (cached) {
    return {
      translatedText: cached.translatedText,
      cached: true,
      model: cached.model ?? undefined,
      tokensIn: cached.tokensIn,
      tokensOut: cached.tokensOut,
      latencyMs: cached.latencyMs,
    };
  }

  const dbEntry = await prisma.translationCache.findUnique({
    where: {
      sourceTextHash_sourceLanguage_targetLanguage: {
        sourceTextHash: textHash,
        sourceLanguage,
        targetLanguage,
      },
    },
  });

  if (dbEntry) {
    await cacheSet(cacheKey, {
      id: dbEntry.id,
      translatedText: dbEntry.translatedText,
      model: dbEntry.model,
      tokensIn: dbEntry.tokensIn,
      tokensOut: dbEntry.tokensOut,
      latencyMs: dbEntry.latencyMs,
    }, DEFAULT_TTL_SECONDS);

    return {
      translatedText: dbEntry.translatedText,
      cached: true,
      model: dbEntry.model ?? undefined,
      tokensIn: dbEntry.tokensIn,
      tokensOut: dbEntry.tokensOut,
      latencyMs: dbEntry.latencyMs,
    };
  }

  const prompt = buildTranslationPrompt(text, targetLanguage);
  const start = Date.now();

  const result = await generateAIResponse(`Translate to ${targetLanguage}:\n\n${text}`, `You are an expert multilingual translator. Translate the following text into ${targetLanguage}. Preserve meaning, markdown, HTML, formatting, URLs, dates, numbers, emojis, and astrology terminology. Never translate: ${Array.from(NEVER_TRANSLATE).join(', ')}. Translate zodiac signs using local language equivalents. Return ONLY translated text. Do not explain.`);

  const latencyMs = Date.now() - start;
  const translatedText = result.text.trim();
  const tokensIn = Math.ceil(text.length / 4);
  const tokensOut = Math.ceil(translatedText.length / 4);

  await cacheSet(cacheKey, {
    id: '',
    translatedText,
    model: result.model,
    tokensIn,
    tokensOut,
    latencyMs,
  }, DEFAULT_TTL_SECONDS);

  await prisma.translationCache.create({
    data: {
      sourceTextHash: textHash,
      sourceLanguage,
      targetLanguage,
      translatedText,
      model: result.model,
      tokensIn,
      tokensOut,
      latencyMs,
    },
  }).catch((err: unknown) => {
    logger.warn({ err }, 'Failed to persist translation to DB (likely duplicate)');
  });

  return {
    translatedText,
    cached: false,
    model: result.model,
    tokensIn,
    tokensOut,
    latencyMs,
  };
}

export async function getTranslationMetrics(): Promise<{
  totalTranslations: number;
  uniqueLanguages: number;
  topLanguages: { language: string; count: number }[];
  totalCost: number;
}> {
  const [totalTranslations, languageStats] = await Promise.all([
    prisma.translationCache.count(),
    prisma.translationCache.groupBy({
      by: ['targetLanguage'],
      _count: { targetLanguage: true },
      orderBy: { _count: { targetLanguage: 'desc' } },
      take: 10,
    }),
  ]);

  return {
    totalTranslations,
    uniqueLanguages: languageStats.length,
    topLanguages: languageStats.map(s => ({
      language: s.targetLanguage,
      count: s._count.targetLanguage,
    })),
    totalCost: 0,
  };
}

export { MAX_TEXT_LENGTH, CACHE_PREFIX, hashText, buildTranslationPrompt };
