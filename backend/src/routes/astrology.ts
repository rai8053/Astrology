import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { validate } from '../middleware/validate.js';
import { optionalAuth, authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { sanitizePrompt } from '../lib/sanitize.js';
import { RASHI_DATA, RASHI_KEYS, NAKSHATRA_LORDS } from '../services/astrology/constants.js';
import { calculateBirthDetails, getMoonPhase } from '../services/astrology/calculator.js';
import { TITHI_SIGNIFICANCE, ELEMENT_TRAITS, NAKSHATRA_MEANINGS, getNakshatraInfo, buildInsights, buildRemedies, buildTransitTimeline, buildFallbackProfile, buildDetailedHtml } from '../services/astrology/report-template.js';
import { generateStructuredJSON } from '../lib/ai.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { cacheGet, cacheSet } from '../lib/cache.js';
import type { DailyHoroscope, CompatibilityResult, MoonPhaseInfo, PersonalDashboardData } from '@shared/types/api.js';

export const astrologyRouter = Router();

const timeStr = z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format').refine((t) => {
  const [h, m] = t.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}, 'Invalid time: hours must be 0-23, minutes 0-59');

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format').refine((d) => {
  const date = new Date(d);
  const min = new Date('1900-01-01');
  const max = new Date();
  return date >= min && date <= max;
}, 'Birth date must be between 1900-01-01 and today');

const birthChartSchema = z.object({
  name: z.string().min(1).max(100),
  birthDate: dateStr,
  birthTime: timeStr,
  birthPlace: z.string().min(1).max(200),
  language: z.string().min(2).max(10).optional().default('en'),
  timezoneOffsetMinutes: z.number().int().min(-720).max(840).optional().default(0),
});

astrologyRouter.post('/vedic-profile', optionalAuth, validate(birthChartSchema), asyncHandler(async (req, res) => {
  const { name, birthDate, birthTime, birthPlace, timezoneOffsetMinutes } = req.body as z.infer<typeof birthChartSchema>;
  const fallback = buildFallbackProfile(name, birthDate, birthTime, birthPlace, timezoneOffsetMinutes);

  if (req.user) {
    prisma.astrologyReport.create({
      data: { userId: req.user.userId, type: 'vedic_profile', input: { name, birthDate, birthTime, birthPlace }, result: JSON.parse(JSON.stringify(fallback)) },
    }).catch((e: unknown) => { logger.error({ err: e }, 'Failed to save vedic_profile report'); });
  }
  res.json({ success: true, data: fallback });
}));

const aiDetailedCache = new Map<string, { done: boolean; html?: string }>();

const detailedReportSchema = z.object({
  name: z.string().min(1).max(100),
  birthDate: dateStr,
  birthTime: timeStr,
  birthPlace: z.string().min(1).max(200),
  language: z.string().min(2).max(10).optional().default('en'),
  timezoneOffsetMinutes: z.number().int().min(-720).max(840).optional().default(0),
});

function hashKey(name: string, date: string, time: string, place: string): string {
  return crypto.createHash('sha256').update(`${name}|${date}|${time}|${place}`).digest('hex');
}

astrologyRouter.post('/vedic-profile/detailed', optionalAuth, validate(detailedReportSchema), asyncHandler(async (req, res) => {
  const { name: rawName, birthDate, birthTime, birthPlace: rawBirthPlace, language, timezoneOffsetMinutes } = req.body as z.infer<typeof detailedReportSchema>;
  const name = sanitizePrompt(rawName);
  const birthPlace = sanitizePrompt(rawBirthPlace);
  const key = hashKey(rawName, birthDate, birthTime, rawBirthPlace);

  const cached = aiDetailedCache.get(key);
  if (cached?.done && cached.html) {
    res.json({ success: true, data: { detailedReport: cached.html } });
    return;
  }

  const { rashiKey, nakshatraIndex, nakshatraName, lagnaKey } = calculateBirthDetails(birthDate, birthTime, timezoneOffsetMinutes);
  const rd = RASHI_DATA[rashiKey] || RASHI_DATA.Mesh;
  const ld = RASHI_DATA[lagnaKey] || RASHI_DATA.Mesh;
  const nakshatraLord = NAKSHATRA_LORDS[nakshatraIndex % 9];
  const rashiLord = rd.lord;
  const luckyColor = rd.element === 'Fire' ? 'Crimson Red / Gold' : rd.element === 'Water' ? 'Royal Blue / Sea Green' : rd.element === 'Air' ? 'Emerald Green / Silver' : 'Saffron / Earthy Yellow';
  const gemstone = rd.element === 'Fire' ? 'Ruby (Manik)' : rd.element === 'Water' ? 'Pearl (Moti)' : rd.element === 'Air' ? 'Emerald (Panna)' : 'Yellow Sapphire (Pukhraj)';
  const luckyNum = (nakshatraIndex % 9) + 1;
  const ni = getNakshatraInfo(nakshatraName);
  const et = ELEMENT_TRAITS[rd.element] || ELEMENT_TRAITS.Fire;
  const rashiLordName = rashiLord.split('/')[0].trim();

  const fallbackDetailed = buildDetailedHtml({ rashiKey, rd, ld, lagnaKey, nakshatraName, nakshatraLord, rashiLord, luckyColor, gemstone, luckyNum, ni, et, rashiLordName });

  res.json({ success: true, data: { detailedReport: fallbackDetailed, requestKey: key } });

  if (cached?.done) return;

  aiDetailedCache.set(key, { done: false });

  generateStructuredJSON<{ detailedReport: string }>(
    `Generate an extremely detailed, comprehensive Vedic astrology reading in the language code: ${language}.

PERSON DETAILS:
Name: ${name}
Birth Date: ${birthDate}
Birth Time: ${birthTime}
Birth Place: ${birthPlace}

COMPUTED CHART DATA (already calculated — do not change):
- Moon Sign (Rashi): ${rashiKey} (${rd.translation}), ruled by ${rd.lord}, Element: ${rd.element}, Dosha: ${rd.dosha}
- Ascendant (Lagna): ${lagnaKey} (${ld.translation}), Element: ${ld.element}
- Nakshatra (Birth Star): ${nakshatraName}, ruled by ${nakshatraLord}
- Lucky Number: ${(nakshatraIndex % 9) + 1}
- Lucky Color: ${rd.element === 'Fire' ? 'Crimson Red / Gold' : rd.element === 'Water' ? 'Royal Blue / Sea Green' : rd.element === 'Air' ? 'Emerald Green / Silver' : 'Saffron / Earthy Yellow'}
- Gemstone: ${rd.element === 'Fire' ? 'Ruby (Manik)' : rd.element === 'Water' ? 'Pearl (Moti)' : rd.element === 'Air' ? 'Emerald (Panna)' : 'Yellow Sapphire (Pukhraj)'}

Return a flat JSON object with ONE field:
"detailedReport" — a string containing the COMPLETE reading as clean HTML (NO markdown, NO code fences). Use ONLY these HTML tags: <h3>, <h4>, <p>, <ul>, <li>, <strong>, <em>, <br>. No <script>, <style>, <div>, <span>, or custom attributes.

The reading MUST cover ALL of these sections with substantial, personalized content for EACH:

1. <h3>Birth Chart Overview</h3> — Deep analysis of how the Moon sign (${rashiKey}), Ascendant (${lagnaKey}), and Nakshatra (${nakshatraName}) work together. Minimum 4 paragraphs.

2. <h3>Planetary Analysis</h3> — For each planet (Lagna, Moon, Sun, Mercury, Venus, Jupiter, Saturn, Mars), explain its significance, the sign it occupies, what house it rules, and its overall impact. Each planet gets its own <h4> heading and at least 2-3 sentences.

3. <h3>House-by-House Analysis</h3> — For all 12 houses, explain what each house represents and how the planetary placements affect each area of life. Each house gets its own <h4> heading.

4. <h3>Career & Finance</h3> — Detailed career path, suitable professions, financial strengths and challenges, ideal timing for major decisions. Multiple paragraphs.

5. <h3>Relationships & Love</h3> — Relationship patterns, compatibility with different signs, communication style in partnerships, ideal partner qualities. Multiple paragraphs.

6. <h3>Health & Wellness</h3> — Health predispositions based on the chart, dosha analysis, recommended lifestyle practices, yoga and dietary suggestions. Multiple paragraphs.

7. <h3>Spiritual Path</h3> — Spiritual inclinations, meditation practices that resonate, past life indications, karmic lessons. Multiple paragraphs.

8. <h3>Remedies & Recommendations</h3> — Detailed remedial measures: gemstone therapy (with specific instructions), mantra chanting (with exact mantras), colors to wear, days to observe, charities to perform, dosha-balancing practices. Each remedy with full explanation.

9. <h3>Current Transits & Upcoming Periods</h3> — Current planetary transits affecting the chart, what to expect in the next 3 months, opportunities and challenges ahead.

Write in the language corresponding to code: "${language}". For "hi" write in Hindi (Devanagari script), for "bn" in Bengali, for "en" in English, for "es" in Spanish, etc.`,
    `You are an expert Vedic astrologer providing an exhaustive, deeply personalized birth chart reading. The astrological data has already been computed — never recalculate or change it. Return ONLY flat JSON with a single "detailedReport" field containing the full HTML reading. Use only <h3>, <h4>, <p>, <ul>, <li>, <strong>, <em>, <br> tags. All content must be in the language specified in the prompt (code: ${language}).`
  ).then((aiResult) => {
    const html = aiResult.detailedReport || fallbackDetailed;
    aiDetailedCache.set(key, { done: true, html });
    if (req.user) {
      prisma.astrologyReport.create({
        data: { userId: req.user.userId, type: 'vedic_profile_detailed', input: { name, birthDate, birthTime, birthPlace }, result: { detailedReport: html } },
      }).catch((e: unknown) => { logger.error({ err: e }, 'Failed to save detailed report'); });
    }
  }).catch((error: unknown) => {
    logger.warn({ error }, 'AI detailed report failed');
    aiDetailedCache.set(key, { done: true, html: fallbackDetailed });
  });
}));

astrologyRouter.get('/vedic-profile/detailed/status/:key', authenticate, (req, res) => {
  const entry = aiDetailedCache.get(req.params.key);
  if (!entry) return res.json({ success: true, data: { done: false } });
  if (entry.done) return res.json({ success: true, data: { done: true, detailedReport: entry.html } });
  res.json({ success: true, data: { done: false } });
});

const horoscopeSchema = z.object({ rashi: z.string().min(1).max(50) });

astrologyRouter.post('/daily-horoscope', optionalAuth, validate(horoscopeSchema), asyncHandler(async (req, res) => {
  const { rashi } = req.body as z.infer<typeof horoscopeSchema>;
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `horoscope:${rashi}:${today}`;
  const cached = await cacheGet<DailyHoroscope>(cacheKey);
  if (cached) {
    res.json({ success: true, data: cached });
    return;
  }
  const rd = RASHI_DATA[rashi] || RASHI_DATA.Mesh;
  const fallback: DailyHoroscope = {
    rashi, englishName: rd.translation,
    general: `Today holds promise under ${rd.lord}. Focus on structure and wellness.`,
    career: 'A collaborative aspect helps resolve conflicts. Creative ideas flourish.',
    finance: 'Avoid speculative spending. Maintain classic budget models.',
    love: 'Soft communication enhances relationships. Singles may find wise advisors.',
    health: `Focus on calming ${rd.dosha} energy with pranayama and grounding foods.`,
    luckyNumber: (new Date().getDate() % 9) + 1,
    luckyColor: rd.element === 'Fire' ? 'Burgundy / Gold' : 'Cyan / Moonstone',
    luckyTime: '10:30 AM to 12:00 PM',
    energyLevel: 82,
    remedy: `Chant 'Om Somaya Namaha' 9 times to harmonize with today's lunar rhythm.`,
  };

  try {
    const prompt = `Write a Vedic daily horoscope for someone with Moon Sign ${rashi} (${rd.translation}), ruled by ${rd.lord}. Do NOT calculate any astrology — ${rashi} and its lord ${rd.lord} are already correct. Return flat JSON with: general (string), career (string), finance (string), love (string), health (string), luckyNumber (number 1-9), luckyColor (string), luckyTime (string), energyLevel (number 1-100), remedy (string).`;
    const aiResult = await generateStructuredJSON<DailyHoroscope>(prompt, 'You are a Vedic horoscope writer. The astrological data is already calculated. Only write the horoscope text. Return flat JSON only.');
    const merged = { ...fallback, ...aiResult, rashi };
    if (req.user) {
      await prisma.astrologyReport.create({
        data: { userId: req.user.userId, type: 'daily_horoscope', input: { rashi }, result: JSON.parse(JSON.stringify(merged)) },
      }).catch((e: unknown) => { logger.error({ err: e }, 'Failed to save daily_horoscope report'); });
    }
    cacheSet(cacheKey, merged, 21600).catch(() => {});
    res.json({ success: true, data: merged });
  } catch (error: unknown) {
    logger.warn({ error }, 'AI horoscope fallback');
    res.json({ success: true, data: fallback });
  }
}));

const compatibilitySchema = z.object({
  partnerA: z.object({ name: z.string().min(1), birthDate: dateStr, birthTime: timeStr, birthPlace: z.string().min(1).max(200), timezoneOffsetMinutes: z.number().int().min(-720).max(840).optional().default(0) }),
  partnerB: z.object({ name: z.string().min(1), birthDate: dateStr, birthTime: timeStr, birthPlace: z.string().min(1).max(200), timezoneOffsetMinutes: z.number().int().min(-720).max(840).optional().default(0) }),
});

// ─── Real Ashta Koota (Gun Milan) Calculation ──────────────────────────────
const NAKSHATRA_GANA: Record<string, number> = {
  Ashwini: 0, Bharani: 2, Krittika: 1, Rohini: 0, Mrigashira: 1, Ardra: 2,
  Punarvasu: 0, Pushya: 0, Ashlesha: 2, Magha: 2, 'Purva Phalguni': 1, 'Uttara Phalguni': 1,
  Hasta: 0, Chitra: 1, Swati: 0, Vishakha: 2, Anuradha: 0, Jyeshtha: 2,
  Mula: 2, 'Purva Ashadha': 1, 'Uttara Ashadha': 1, Shravana: 0, Dhanishta: 2, Shatabhisha: 1,
  'Purva Bhadrapada': 1, 'Uttara Bhadrapada': 0, Revati: 0,
};
const NAKSHATRA_YONI: Record<string, string> = {
  Ashwini: 'Horse', Bharani: 'Elephant', Krittika: 'Sheep', Rohini: 'Serpent', Mrigashira: 'Serpent', Ardra: 'Dog',
  Punarvasu: 'Cat', Pushya: 'Sheep', Ashlesha: 'Cat', Magha: 'Rat', 'Purva Phalguni': 'Rat', 'Uttara Phalguni': 'Cow',
  Hasta: 'Buffalo', Chitra: 'Tiger', Swati: 'Buffalo', Vishakha: 'Tiger', Anuradha: 'Deer', Jyeshtha: 'Deer',
  Mula: 'Dog', 'Purva Ashadha': 'Monkey', 'Uttara Ashadha': 'Mongoose', Shravana: 'Monkey', Dhanishta: 'Lion', Shatabhisha: 'Horse',
  'Purva Bhadrapada': 'Lion', 'Uttara Bhadrapada': 'Cow', Revati: 'Elephant',
};
// Yoni compatibility: friend, enemy, neutral (1, 0, 0.5)
const YONI_COMPAT: Record<string, Record<string, number>> = {
  Horse: { Horse: 1, Elephant: 0.5, Sheep: 0, Serpent: 0.5, Dog: 1, Cat: 0, Rat: 0, Cow: 0, Buffalo: 0.5, Tiger: 0, Deer: 0, Monkey: 0.5, Mongoose: 0, Lion: 0 },
  Elephant: { Horse: 0.5, Elephant: 1, Sheep: 0.5, Serpent: 0, Dog: 0, Cat: 0.5, Rat: 1, Cow: 0, Buffalo: 0, Tiger: 0.5, Deer: 1, Monkey: 0, Mongoose: 0.5, Lion: 0 },
  Sheep: { Horse: 0, Elephant: 0.5, Sheep: 1, Serpent: 0.5, Dog: 0.5, Cat: 0, Rat: 0, Cow: 1, Buffalo: 0, Tiger: 0, Deer: 0, Monkey: 0.5, Mongoose: 0, Lion: 0.5 },
  Serpent: { Horse: 0.5, Elephant: 0, Serpent: 1, Sheep: 0, Dog: 0.5, Cat: 0, Rat: 0, Cow: 0.5, Buffalo: 0.5, Tiger: 0, Deer: 0, Monkey: 0, Mongoose: 1, Lion: 0 },
  Dog: { Horse: 1, Elephant: 0, Sheep: 0.5, Serpent: 0.5, Dog: 1, Cat: 0.5, Rat: 0.5, Cow: 0, Buffalo: 0, Tiger: 0, Deer: 1, Monkey: 0, Mongoose: 0, Lion: 0.5 },
  Cat: { Horse: 0, Elephant: 0.5, Sheep: 0, Serpent: 0, Dog: 0.5, Cat: 1, Rat: 0.5, Cow: 0, Buffalo: 1, Tiger: 0.5, Deer: 0, Monkey: 0.5, Mongoose: 0, Lion: 0 },
  Rat: { Horse: 0, Elephant: 1, Sheep: 0, Serpent: 0, Dog: 0.5, Cat: 0.5, Rat: 1, Cow: 0.5, Buffalo: 0, Tiger: 0, Deer: 0, Monkey: 0, Mongoose: 0.5, Lion: 0 },
  Cow: { Horse: 0, Elephant: 0, Sheep: 1, Serpent: 0.5, Dog: 0, Cat: 0, Rat: 0.5, Cow: 1, Buffalo: 0, Tiger: 0.5, Deer: 0.5, Monkey: 0, Mongoose: 0, Lion: 0.5 },
  Buffalo: { Horse: 0.5, Elephant: 0, Sheep: 0, Serpent: 0.5, Dog: 0, Cat: 1, Rat: 0, Buffalo: 0, Tiger: 0.5, Deer: 0, Monkey: 0, Mongoose: 0.5, Lion: 0 },
  Tiger: { Horse: 0, Elephant: 0.5, Sheep: 0, Serpent: 0, Dog: 0, Cat: 0.5, Rat: 0.5, Cow: 0.5, Buffalo: 0, Tiger: 1, Deer: 0, Monkey: 0.5, Mongoose: 0, Lion: 0.5 },
  Deer: { Horse: 0, Elephant: 1, Sheep: 0, Serpent: 0, Dog: 1, Cat: 0, Rat: 0, Cow: 0.5, Buffalo: 0, Tiger: 0, Deer: 1, Monkey: 0.5, Mongoose: 0, Lion: 0 },
  Monkey: { Horse: 0.5, Elephant: 0, Sheep: 0.5, Serpent: 0, Dog: 0, Cat: 0.5, Rat: 0, Cow: 0, Buffalo: 0, Tiger: 0.5, Deer: 0.5, Monkey: 1, Mongoose: 0.5, Lion: 0.5 },
  Mongoose: { Horse: 0, Elephant: 0.5, Sheep: 0, Serpent: 1, Dog: 0, Cat: 0, Rat: 0.5, Cow: 0, Buffalo: 0.5, Tiger: 0, Deer: 0, Monkey: 0.5, Mongoose: 1, Lion: 0 },
  Lion: { Horse: 0, Elephant: 0, Sheep: 0.5, Serpent: 0, Dog: 0.5, Cat: 0, Rat: 0, Cow: 0.5, Buffalo: 0, Tiger: 0.5, Deer: 0, Monkey: 0.5, Mongoose: 0, Lion: 1 },
};
const RASHI_ORDER = ['Mesh', 'Vrishabh', 'Mithun', 'Kark', 'Simha', 'Kanya', 'Tula', 'Vrishchik', 'Dhanu', 'Makar', 'Kumbha', 'Meen'];
// Planetary friendship: temporary (same/different element) + natural (by graha)
const PLANET_FRIENDS: Record<string, Record<string, 'friend' | 'enemy' | 'neutral'>> = {
  'Sun': { Sun: 'friend', Moon: 'friend', Mars: 'enemy', Mercury: 'friend', Jupiter: 'friend', Venus: 'enemy', Saturn: 'enemy' },
  'Moon': { Sun: 'friend', Moon: 'friend', Mars: 'neutral', Mercury: 'friend', Jupiter: 'friend', Venus: 'enemy', Saturn: 'enemy' },
  'Mars': { Sun: 'enemy', Moon: 'neutral', Mars: 'friend', Mercury: 'enemy', Jupiter: 'friend', Venus: 'neutral', Saturn: 'friend' },
  'Mercury': { Sun: 'enemy', Moon: 'friend', Mars: 'enemy', Mercury: 'friend', Jupiter: 'friend', Venus: 'friend', Saturn: 'neutral' },
  'Jupiter': { Sun: 'friend', Moon: 'friend', Mars: 'friend', Mercury: 'friend', Jupiter: 'friend', Venus: 'enemy', Saturn: 'enemy' },
  'Venus': { Sun: 'enemy', Moon: 'friend', Mars: 'neutral', Mercury: 'friend', Jupiter: 'enemy', Venus: 'friend', Saturn: 'neutral' },
  'Saturn': { Sun: 'enemy', Moon: 'enemy', Mars: 'friend', Mercury: 'neutral', Jupiter: 'enemy', Venus: 'neutral', Saturn: 'friend' },
};
const PLANET_TO_LORD: Record<string, string> = {
  'Mars / Mangal': 'Mars', 'Venus / Shukra': 'Venus', 'Mercury / Budha': 'Mercury',
  'Moon / Chandra': 'Moon', 'Sun / Surya': 'Sun', 'Jupiter / Guru': 'Jupiter', 'Saturn / Shani': 'Saturn',
};

function calculateAshtaKoota(nakIdxA: number, nakIdxB: number, rashiKeyA: string, rashiKeyB: string): { guns: number; kootas: { name: string; description: string; scored: number; max: number }[] } {
  const kootas: { name: string; description: string; scored: number; max: number }[] = [];
  let totalGuns = 0;

  // 1. Varna (1 pt) — Varna of the Rashi lord (Brahmin=0, Kshatriya=1, Vaishya=2, Shudra=3)
  const varnaMap: Record<string, number> = { Mars: 1, Venus: 0, Mercury: 2, Moon: 0, Sun: 1, Jupiter: 0, Saturn: 3 };
  const lordA = RASHI_DATA[rashiKeyA]?.lord || '';
  const lordB = RASHI_DATA[rashiKeyB]?.lord || '';
  const varnaA = varnaMap[PLANET_TO_LORD[lordA] || ''] ?? 0;
  const varnaB = varnaMap[PLANET_TO_LORD[lordB] || ''] ?? 0;
  const varnaDiff = Math.abs(varnaA - varnaB);
  const varnaScored = varnaDiff <= 1 ? 1 : 0;
  kootas.push({ name: 'Varna (1)', description: 'Spiritual compatibility', scored: varnaScored, max: 1 });
  totalGuns += varnaScored;

  // 2. Vashya (2 pts) — Controllability type
  const vashyaMap: Record<string, string> = {
    Mesh: 'Chatushpada', Vrishabh: 'Chatushpada', Mithun: 'DwiPada', Kark: 'Jalchara',
    Simha: 'Chatushpada', Kanya: 'DwiPada', Tula: 'DwiPada', Vrishchik: 'Kita',
    Dhanu: 'DwiPada', Makar: 'Jalchara', Kumbha: 'DwiPada', Meen: 'Jalchara',
  };
  const vashyaCompat: Record<string, Record<string, number>> = {
    Chatushpada: { Chatushpada: 2, DwiPada: 1, Jalchara: 0, Kita: 0 },
    DwiPada: { Chatushpada: 1, DwiPada: 2, Jalchara: 0, Kita: 0 },
    Jalchara: { Chatushpada: 0, DwiPada: 0, Jalchara: 2, Kita: 1 },
    Kita: { Chatushpada: 0, DwiPada: 0, Jalchara: 1, Kita: 2 },
  };
  const vA = vashyaMap[rashiKeyA] || 'DwiPada';
  const vB = vashyaMap[rashiKeyB] || 'DwiPada';
  const vashyaScored = vashyaCompat[vA]?.[vB] ?? 0;
  kootas.push({ name: 'Vashya (2)', description: 'Mutual attraction & influence', scored: vashyaScored, max: 2 });
  totalGuns += vashyaScored;

  // 3. Tara (3 pts) — Birth star compatibility
  const taraDiff = (nakIdxB - nakIdxA + 27) % 27;
  const taraRem = taraDiff % 9;
  const taraScored = (taraRem === 0 || taraRem === 3 || taraRem === 5) ? 3 : (taraRem === 2 || taraRem === 4 || taraRem === 7) ? 0 : 1.5;
  kootas.push({ name: 'Tara (3)', description: 'Health, longevity & fortune', scored: taraScored, max: 3 });
  totalGuns += taraScored;

  // 4. Yoni (4 pts) — Animal compatibility
  const yoniA = NAKSHATRA_YONI[NAKSHATRA_NAMES[nakIdxA]] || 'Horse';
  const yoniB = NAKSHATRA_YONI[NAKSHATRA_NAMES[nakIdxB]] || 'Horse';
  const yoniRaw = YONI_COMPAT[yoniA]?.[yoniB] ?? 0.5;
  const yoniScored = Math.round(yoniRaw * 4);
  kootas.push({ name: 'Yoni (4)', description: 'Physical & intimate compatibility', scored: yoniScored, max: 4 });
  totalGuns += yoniScored;

  // 5. Graha Maitri (5 pts) — Planetary friendship
  const grahaA = PLANET_TO_LORD[lordA] || 'Moon';
  const grahaB = PLANET_TO_LORD[lordB] || 'Moon';
  const friendship = PLANET_FRIENDS[grahaA]?.[grahaB] || 'neutral';
  const gunaScored = friendship === 'friend' ? 5 : friendship === 'neutral' ? 3 : 0;
  kootas.push({ name: 'Graha Maitri (5)', description: 'Intellectual & emotional alignment', scored: gunaScored, max: 5 });
  totalGuns += gunaScored;

  // 6. Gana (6 pts) — Temperament (Deva=0, Manushya=1, Rakshasa=2)
  const ganaA = NAKSHATRA_GANA[NAKSHATRA_NAMES[nakIdxA]] ?? 0;
  const ganaB = NAKSHATRA_GANA[NAKSHATRA_NAMES[nakIdxB]] ?? 0;
  const ganaDiff = Math.abs(ganaA - ganaB);
  const ganaScored = ganaDiff === 0 ? 6 : ganaDiff === 1 ? 3 : 0;
  kootas.push({ name: 'Gana (6)', description: 'Temperament & nature compatibility', scored: ganaScored, max: 6 });
  totalGuns += ganaScored;

  // 7. Bhakoot (7 pts) — Rashi compatibility
  const rashiIdxA = RASHI_ORDER.indexOf(rashiKeyA);
  const rashiIdxB = RASHI_ORDER.indexOf(rashiKeyB);
  const rashiDiff = (rashiIdxB - rashiIdxA + 12) % 12;
  // 2nd/12th = 0, 5th/9th = 5, 4th/8th = 5, 3rd/11th = 3, 6th/8th = 1, 7th = 5, 1st = 7
  const bhakootMap: Record<number, number> = { 0: 7, 1: 0, 2: 3, 3: 5, 4: 5, 5: 3, 6: 5, 7: 1, 8: 0, 9: 5, 10: 3, 11: 0 };
  const bhakootScored = bhakootMap[rashiDiff] ?? 0;
  kootas.push({ name: 'Bhakoot (7)', description: 'Family, wealth & emotional bond', scored: bhakootScored, max: 7 });
  totalGuns += bhakootScored;

  // 8. Nadi (8 pts) — Nakshatra pada dosha
  const nadiA = nakIdxA % 3;
  const nadiB = nakIdxB % 3;
  const nadiScored = nadiA !== nadiB ? 8 : 0;
  kootas.push({ name: 'Nadi (8)', description: 'Genetic health & progeny', scored: nadiScored, max: 8 });
  totalGuns += nadiScored;

  return { guns: Math.round(totalGuns), kootas };
}

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

astrologyRouter.post('/compatibility', optionalAuth, validate(compatibilitySchema), asyncHandler(async (req, res) => {
  const { partnerA, partnerB } = req.body as z.infer<typeof compatibilitySchema>;
  const compatKey = `compat:${partnerA.name}|${partnerA.birthDate}|${partnerA.birthTime}|${partnerA.birthPlace}|${partnerB.name}|${partnerB.birthDate}|${partnerB.birthTime}|${partnerB.birthPlace}`;
  const compatHash = crypto.createHash('sha256').update(compatKey).digest('hex');
  const cached = await cacheGet<CompatibilityResult>(compatHash);
  if (cached) {
    res.json({ success: true, data: cached });
    return;
  }
  const detA = calculateBirthDetails(partnerA.birthDate, partnerA.birthTime, partnerA.timezoneOffsetMinutes);
  const detB = calculateBirthDetails(partnerB.birthDate, partnerB.birthTime, partnerB.timezoneOffsetMinutes);
  const { rashiKey: rashiA, nakshatraName: nakshatraA, nakshatraIndex: nakIdxA } = detA;
  const { rashiKey: rashiB, nakshatraName: nakshatraB, nakshatraIndex: nakIdxB } = detB;

  const { guns: gunsMatched, kootas } = calculateAshtaKoota(nakIdxA, nakIdxB, rashiA, rashiB);
  const compatibilityScore = Math.round((gunsMatched / 36) * 100);
  let verdict = 'Medium Alignment (Moderate Compatibility)';
  if (gunsMatched >= 25) verdict = 'Auspicious Union (High Celestial Harmony)';
  else if (gunsMatched < 18) verdict = 'Challenging Match (Remedial Effort Recommended)';

  const fallback: CompatibilityResult = {
    partnerA_Rashi: `${rashiA} (${RASHI_DATA[rashiA].translation})`,
    partnerB_Rashi: `${rashiB} (${RASHI_DATA[rashiB].translation})`,
    partnerA_Nakshatra: nakshatraA,
    partnerB_Nakshatra: nakshatraB,
    compatibilityScore, gunsMatched, verdict,
    gunAnalysis: kootas.map(k => ({
      kootaName: k.name, description: k.description, pointsScored: k.scored, maxPoints: k.max,
    })),
    strengths: `${partnerA.name}'s element (${RASHI_DATA[rashiA].element}) blends with ${partnerB.name}'s (${RASHI_DATA[rashiB].element}).`,
    challenges: `Communication differences when Ayurvedic ${RASHI_DATA[rashiA].dosha} clashes with ${RASHI_DATA[rashiB].dosha}.`,
    remedy: 'Chant Gayatri Mantra 11 times on Sundays for harmony.',
    detailedAnalysis: `This Ashta Koota assessment scores ${gunsMatched}/36 Gunas. Solid foundations in Graha Maitri and Yoni.`,
  };

  try {
    const prompt = `Vedic compatibility (Gun Milan) for:\nPartner A: ${partnerA.name}, born ${partnerA.birthDate} ${partnerA.birthTime} (Rashi: ${rashiA}, Nakshatra: ${nakshatraA})\nPartner B: ${partnerB.name}, born ${partnerB.birthDate} ${partnerB.birthTime} (Rashi: ${rashiB}, Nakshatra: ${nakshatraB})\nReturn a flat JSON object with fields: partnerA_Rashi, partnerB_Rashi, partnerA_Nakshatra, partnerB_Nakshatra, compatibilityScore (number 0-100), gunsMatched (number 0-36), verdict (string), gunAnalysis (array of {kootaName, description, pointsScored, maxPoints}), strengths (string), challenges (string), remedy (string), detailedAnalysis (string).`;
    const aiResult = await generateStructuredJSON<CompatibilityResult>(prompt, 'You are a Vedic matchmaker. Return ONLY a flat JSON object. No nested wrappers, no markdown.');
    const merged = { ...fallback, ...aiResult };
    if (req.user) {
      await prisma.astrologyReport.create({
        data: { userId: req.user.userId, type: 'compatibility', input: { partnerA, partnerB }, result: JSON.parse(JSON.stringify(merged)) },
      }).catch((e: unknown) => { logger.error({ err: e }, 'Failed to save compatibility report'); });
    }
    cacheSet(compatHash, merged, 86400).catch(() => {});
    res.json({ success: true, data: merged });
  } catch (error: unknown) {
    logger.warn({ error }, 'AI compatibility fallback');
    res.json({ success: true, data: fallback });
  }
}));

const moonPhaseSchema = z.object({ date: z.string().optional() });

astrologyRouter.post('/moon-phase', optionalAuth, validate(moonPhaseSchema), asyncHandler(async (req, res) => {
  const { date } = req.body as z.infer<typeof moonPhaseSchema>;
  const targetDate = date ? new Date(date) : new Date();
  const cacheKey = `moon:${targetDate.toISOString().split('T')[0]}`;
  const cached = await cacheGet<MoonPhaseInfo>(cacheKey);
  if (cached) {
    res.json({ success: true, data: cached });
    return;
  }
  const moon = getMoonPhase(targetDate);
  const root = moon.tithiName.split(' ')[0];
  const significance = TITHI_SIGNIFICANCE[root] || TITHI_SIGNIFICANCE[moon.tithiName] || 'An auspicious day for meditation and spiritual hygiene.';

  const fallback: MoonPhaseInfo = {
    date: targetDate.toISOString().split('T')[0],
    phaseName: moon.phaseName,
    illumination: moon.illumination,
    age: moon.age,
    distance: moon.distance,
    tithiNum: moon.tithiNum,
    tithiName: moon.tithiName,
    tithiType: moon.tithiType,
    tithiSignificance: significance,
    nextPurnima: moon.nextPurnima,
    nextAmavasya: moon.nextAmavasya,
  };

  try {
    const prompt = `Enrich moon details for ${fallback.date}: Phase: ${moon.phaseName}, Illumination: ${moon.illumination}%, Tithi: ${moon.tithiName}. Return a flat JSON object with a single field: tithiSignificance (string).`;
    const aiResult = await generateStructuredJSON<{ tithiSignificance: string }>(prompt, 'You are a Vedic lunar sage. Return ONLY {"tithiSignificance": "..."} with no nesting or markdown.');
    const merged = { ...fallback, ...aiResult };
    if (req.user) {
      await prisma.astrologyReport.create({
        data: { userId: req.user.userId, type: 'moon_phase', input: { date }, result: JSON.parse(JSON.stringify(merged)) },
      }).catch((e: unknown) => { logger.error({ err: e }, 'Failed to save moon_phase report'); });
    }
    cacheSet(cacheKey, merged, 3600).catch(() => {});
    res.json({ success: true, data: merged });
  } catch (error: unknown) {
    logger.warn({ error }, 'AI moon phase fallback');
    res.json({ success: true, data: fallback });
  }
}));

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function buildDailyScore(seed: number): number {
  return Math.round(seededRandom(seed) * 40 + 60);
}

function buildHoroscope(rashiKey: string, element: string, seed: number): PersonalDashboardData['horoscope'] {
  const love = buildDailyScore(seed + 1);
  const career = buildDailyScore(seed + 2);
  const health = buildDailyScore(seed + 3);
  const finance = buildDailyScore(seed + 4);
  const luckyNum = Math.floor(seededRandom(seed + 5) * 8) + 1;
  const elementData: Record<string, { color: string; direction: string; day: string; activity: string; avoid: string }> = {
    Fire: { color: 'Crimson Red / Gold', direction: 'South', day: 'Tuesday', activity: 'Creative projects, leading teams, physical exercise', avoid: 'Rash decisions, overexertion, ignoring advice' },
    Earth: { color: 'Forest Green / Saffron', direction: 'North', day: 'Friday', activity: 'Financial planning, gardening, building routines', avoid: 'Stubbornness, procrastination, overworking' },
    Air: { color: 'Sky Blue / Silver', direction: 'East', day: 'Wednesday', activity: 'Networking, writing, intellectual discussions', avoid: 'Overthinking, gossip, scattered focus' },
    Water: { color: 'Royal Blue / White', direction: 'West', day: 'Monday', activity: 'Journaling, meditation, creative expression', avoid: 'Emotional overwhelm, isolation, avoiding feelings' },
  };
  const ef = elementData[element] || elementData.Fire;
  const luckyColor = ef.color;
  const luckyDirection = ef.direction;
  const luckyDay = ef.day;
  const favorableActivity = ef.activity;
  const avoidToday = ef.avoid;
  const perTemplates: Record<string, string[]> = {
    Fire: ['Your fiery energy is at its peak today. Channel this powerful force into creative projects and leadership opportunities. The cosmos supports bold moves and courageous decisions.', 'Mars infuses your spirit with dynamism and drive. Take the lead in group activities and don\'t shy from challenges — your natural authority shines today.', 'A surge of creative fire propels you forward. Express yourself boldly in all endeavors — the universe rewards those who dare to shine brightly.'],
    Earth: ['Grounded and steady, today favors practical achievements and long-term planning. Your patience is your superpower — use it to build something lasting.', 'Saturn\'s disciplined energy supports methodical progress. Focus on foundation work and financial planning. Slow and steady wins today\'s race.', 'Your earthy stability creates a safe harbor for others. Nurture your resources and relationships with the same care you give to your ambitions.'],
    Air: ['Your mind is exceptionally sharp today. Communication flows easily — perfect for negotiations, writing, and intellectual pursuits. Share your ideas freely.', 'Mercury blesses your speech and intellect. Network, pitch, and connect — your words carry weight and wisdom today.', 'Curiosity leads to discovery. Follow your mental threads wherever they go — today\'s insights become tomorrow\'s breakthroughs.'],
    Water: ['Your intuition is heightened today. Trust your gut feelings in all matters — your emotional radar is picking up signals your conscious mind hasn\'t registered yet.', 'The moon\'s influence amplifies your empathic gifts. Nurture yourself and others with compassion, but remember to protect your own energy.', 'Deep emotions surface for healing today. Allow yourself to feel fully — release what no longer serves you through creative expression.'],
  };
  const prediction = (perTemplates[element] || perTemplates.Fire)[Math.floor(seededRandom(seed + 6) * 3)];
  const adviceTemplates: Record<string, string[]> = {
    Fire: ['Practice patience today.', 'Lead with your heart.', 'Channel energy into creative work.'],
    Earth: ['Take one small step toward a big goal.', 'Ground yourself before decisions.', 'Review and celebrate progress.'],
    Air: ['Write down three exciting ideas.', 'Pause before speaking.', 'Learn something new today.'],
    Water: ['Set a gentle boundary.', 'Journal your feelings before bed.', 'Trust your first impression today.'],
  };
  const dailyAdvice = (adviceTemplates[element] || adviceTemplates.Fire)[Math.floor(seededRandom(seed + 7) * 3)];
  return { moonRashi: rashiKey, prediction, love, career, health, finance, luckyNumber: luckyNum, luckyColor, luckyDirection, luckyDay, favorableActivity, avoidToday, dailyAdvice };
}

function buildCosmicEnergy(element: string, seed: number): PersonalDashboardData['cosmicEnergy'] {
  const baseScore = buildDailyScore(seed + 10);
  const score = Math.min(100, baseScore + (element === 'Fire' ? 5 : element === 'Water' ? 3 : 0));
  let level: string;
  if (score >= 85) level = 'Excellent';
  else if (score >= 70) level = 'High';
  else if (score >= 55) level = 'Moderate';
  else level = 'Low';
  const descs: Record<string, string> = {
    Excellent: 'The celestial energies are perfectly aligned in your favor.',
    High: 'Strong cosmic support flows through your chart.',
    Moderate: 'Average cosmic alignment today. Focus on routine tasks.',
    Low: 'Energies are scattered. Rest and reflect.',
  };
  return { score, level, description: descs[level] || descs.Moderate };
}

function buildTransitAlerts(rashiKey: string, seed: number): PersonalDashboardData['transitAlerts'] {
  const now = new Date();
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const days = (n: number) => { const d = new Date(now); d.setDate(d.getDate() + n); return fmt(d); };
  const lord = RASHI_DATA[rashiKey]?.lord || 'the cosmic forces';
  return [
    { date: days(1), event: 'Moon in Your Rashi', description: `The Moon transits ${rashiKey}, amplifying your emotional depth and intuitive powers.`, impact: 'positive' as const },
    { date: days(3), event: 'Mercury-Mars Aspect', description: 'A dynamic aspect sharpens your mind and fuels your drive. Excellent for negotiating.', impact: 'positive' as const },
    { date: days(5), event: 'Venus Square Saturn', description: 'Relationships may feel heavy. Practice patience — this is a temporary test.', impact: 'challenging' as const },
    { date: days(8), event: `${lord} Blessing`, description: `Your ruling lord ${lord} forms a benefic aspect. Expect career and growth opportunities.`, impact: 'positive' as const },
    { date: days(12), event: 'Full Moon Influence', description: 'Emotions peak. Release what no longer serves you.', impact: 'neutral' as const },
    { date: days(16), event: 'Jupiter Expansion', description: 'Jupiter\'s generous ray opens doors. Say yes to new horizons.', impact: 'positive' as const },
    { date: days(21), event: 'Retrograde Shadow', description: 'A retrograde shadow period begins. Review and revisit past projects.', impact: 'challenging' as const },
    { date: days(28), event: 'New Moon Portal', description: 'A fresh lunar cycle begins. Set intentions for the month ahead.', impact: 'positive' as const },
  ];
}

function formatDurationMs(ms: number): string {
  if (ms < 0) return 'Ending soon';
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const years = Math.floor(days / 365);
  const remainingDays = days % 365;
  const months = Math.floor(remainingDays / 30);
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ${remainingDays % 30 > 0 ? `${remainingDays % 30} day${remainingDays % 30 > 1 ? 's' : ''}` : ''}`;
  return `${days} day${days !== 1 ? 's' : ''}`;
}

function getDashboardMoonPhase(tithiIndex: number, _tithiName: string, _paksha: string): { phaseName: string; illumination: number; age: number } {
  const age = Math.round(tithiIndex * 0.965 * 10) / 10;
  const illumination = Math.round(50 * (1 - Math.cos(2 * Math.PI * (tithiIndex / 30))));
  const phaseValue = tithiIndex / 30;
  let phaseName: string;
  if (phaseValue < 0.03 || phaseValue > 0.97) phaseName = 'New Moon (Amavasya)';
  else if (phaseValue < 0.22) phaseName = 'Waxing Crescent';
  else if (phaseValue < 0.28) phaseName = 'First Quarter';
  else if (phaseValue < 0.47) phaseName = 'Waxing Gibbous';
  else if (phaseValue < 0.53) phaseName = 'Full Moon (Purnima)';
  else if (phaseValue < 0.72) phaseName = 'Waning Gibbous';
  else if (phaseValue < 0.78) phaseName = 'Third Quarter';
  else phaseName = 'Waning Crescent';
  return { phaseName, illumination, age };
}

const dashboardPeriodSchema = z.object({
  period: z.enum(['today', 'tomorrow', 'week', 'month']).optional().default('today'),
});

astrologyRouter.get('/personal-dashboard', authenticate, validate(dashboardPeriodSchema, 'query'), asyncHandler(async (req, res) => {
  const { period } = req.query as unknown as z.infer<typeof dashboardPeriodSchema>;
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { birthDate: true, birthTime: true, birthPlace: true, timezone: true },
  });
  if (!user?.birthDate || !user?.birthTime) {
    res.status(400).json({ success: false, error: 'Birth details required. Please update your profile settings.' });
    return;
  }
  const tzParts = user.timezone ? user.timezone.match(/UTC([+-]\d{1,2}):?(\d{2})?/) : null;
  const tzOffsetMinutes = tzParts ? parseInt(tzParts[1]) * 60 + (tzParts[2] ? parseInt(tzParts[2]) : 0) : 0;
  const details = calculateBirthDetails(user.birthDate, user.birthTime, tzOffsetMinutes);
  const { rashiKey, nakshatraName, nakshatraIndex, lagnaKey, rashiIndex } = details;
  const rd = RASHI_DATA[rashiKey] || RASHI_DATA.Mesh;
  const ld = RASHI_DATA[lagnaKey] || RASHI_DATA.Mesh;
  const now = new Date();
  let daySeed: number;
  let dateLabel: string;
  switch (period) {
    case 'tomorrow': { const d = new Date(now); d.setDate(d.getDate() + 1); daySeed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); dateLabel = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); break; }
    case 'week': { daySeed = Math.floor(now.getTime() / (7 * 86400000)); dateLabel = 'This Week'; break; }
    case 'month': { daySeed = now.getFullYear() * 100 + (now.getMonth() + 1); dateLabel = 'This Month'; break; }
    default: { daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate(); dateLabel = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); break; }
  }
  const baseSeed = daySeed + rashiIndex * 1000;
  const snapshot: PersonalDashboardData['snapshot'] = {
    ascendant: `${lagnaKey} (${ld.translation})`, moonRashi: `${rashiKey} (${rd.translation})`, nakshatra: nakshatraName,
    nakshatraLord: NAKSHATRA_LORDS[nakshatraIndex % 9], rashiLord: rd.lord, lagnaLord: details.lagnaLord || ld.lord,
    element: rd.element, doshaDominance: rd.dosha,
  };

  // Planet positions for dashboard
  const planetList = [
    { name: 'Sun (Surya)', pos: details.sun },
    { name: 'Moon (Chandra)', pos: details.moon },
    { name: 'Mercury (Budha)', pos: details.mercury },
    { name: 'Venus (Shukra)', pos: details.venus },
    { name: 'Mars (Mangal)', pos: details.mars },
    { name: 'Jupiter (Guru)', pos: details.jupiter },
    { name: 'Saturn (Shani)', pos: details.saturn },
    { name: 'Rahu', pos: details.rahu },
    { name: 'Ketu', pos: details.ketu },
  ];
  const PLANET_INTERPRETATIONS: Record<string, string[]> = {
    'Sun (Surya)': ['Brings confidence and leadership to this area.', 'Illuminates your path forward.', 'Energizes your self-expression.', 'Strengthens your willpower and authority.'],
    'Moon (Chandra)': ['Heightens emotional intelligence and intuition.', 'Nurtures your inner world.', 'Amplifies receptivity and empathy.', 'Deepens your connection to your feelings.'],
    'Mercury (Budha)': ['Sharpens intellect and communication skills.', 'Supports analytical thinking.', 'Enhances learning and adaptability.', 'Blesses your speech and writing.'],
    'Venus (Shukra)': ['Awakens love, beauty, and creative expression.', 'Attracts harmony and pleasure.', 'Deepens your appreciation for art.', 'Blesses relationships and finances.'],
    'Mars (Mangal)': ['Ignites courage, ambition, and dynamic energy.', 'Drives you toward your goals.', 'Fuels passion and determination.', 'Strengthens your competitive spirit.'],
    'Jupiter (Guru)': ['Expands wisdom, luck, and spiritual growth.', 'Opens doors to new opportunities.', 'Blesses higher learning.', 'Brings prosperity and optimism.'],
    'Saturn (Shani)': ['Teaches discipline, patience, and karmic lessons.', 'Builds long-term structure.', 'Tests your resilience.', 'Rewards consistent effort.'],
    'Rahu': ['Amplifies ambition and worldly desires.', 'Creates sudden transformations.', 'Pushes you beyond comfort zones.', 'Reveals hidden talents.'],
    'Ketu': ['Deepens spiritual awareness.', 'Releases karmic attachments.', 'Brings detachment and clarity.', 'Opens intuitive channels.'],
  };
  const planets = planetList.map(p => {
    const interps = PLANET_INTERPRETATIONS[p.name] || ['Influences your chart from this position.'];
    return {
      name: p.name, sign: RASHI_KEYS[p.pos.signIndex], signFull: p.pos.signName,
      degrees: p.pos.degrees, minutes: p.pos.minutes, house: p.pos.house,
      interpretation: interps[p.pos.house ? Math.min(p.pos.house - 1, interps.length - 1) : 0],
    };
  });

  // Dasha info
  const DASHA_MEANINGS: Record<string, string> = {
    'Ketu': 'A period of spiritual evolution, detachment, and karmic clearing. Focus on inner growth.',
    'Venus/Shukra': 'A time of love, luxury, creativity, and relationship building. Enjoy life\'s pleasures.',
    'Sun/Surya': 'A period of leadership, confidence, and personal authority. Step into the spotlight.',
    'Moon/Chandra': 'An emotional, nurturing phase. Home, family, and intuition take center stage.',
    'Mars/Mangal': 'A dynamic, action-oriented period. Courage, ambition, and drive are amplified.',
    'Rahu': 'A transformative, ambition-fueled phase. Unexpected changes and material growth.',
    'Jupiter/Guru': 'A blessed period of expansion, wisdom, good fortune, and spiritual growth.',
    'Saturn/Shani': 'A karmic period of discipline, hard work, and lasting achievement. Patience is key.',
    'Mercury/Budha': 'An intellectual, communicative phase. Learning, writing, and networking flourish.',
  };
  const dashaInfo = details.currentDasha ? {
    mahadasha: details.currentDasha.dasha.planet,
    mahadashaStart: details.currentDasha.dasha.startDate.toISOString(),
    mahadashaEnd: details.currentDasha.dasha.endDate.toISOString(),
    antardasha: details.currentDasha.antardasha.planet,
    antardashaStart: details.currentDasha.antardasha.startDate.toISOString(),
    antardashaEnd: details.currentDasha.antardasha.endDate.toISOString(),
    meaning: DASHA_MEANINGS[details.currentDasha.dasha.planet] || 'A significant karmic period in your life journey.',
    remainingDuration: formatDurationMs(details.currentDasha.dasha.endDate.getTime() - Date.now()),
  } : null;

  const horoscope = buildHoroscope(rashiKey, rd.element, baseSeed);
  const cosmicEnergy = buildCosmicEnergy(rd.element, baseSeed + 100);
  const transitAlerts = buildTransitAlerts(rashiKey, baseSeed + 200);
  try {
    const prompt = `Write a personalized Vedic horoscope for someone with Moon in ${rashiKey} (${rd.translation}), Nakshatra ${nakshatraName}, ${rd.element} element, ruled by ${rd.lord}. Period: ${dateLabel}. Return flat JSON with fields: prediction (2-3 sentence personalized reading for ${dateLabel}), love (0-100), career (0-100), health (0-100), finance (0-100), luckyNumber (1-9), luckyColor, dailyAdvice. Do NOT change the rashi or nakshatra.`;
    const aiResult = await generateStructuredJSON<PersonalDashboardData['horoscope']>(prompt, 'You are a Vedic astrologer. Return flat JSON only. No nesting, no markdown.', 3000);
    const cleanResult = Object.fromEntries(Object.entries(aiResult ?? {}).filter(([, v]) => v != null));
    const mergedHoroscope = { ...horoscope, ...cleanResult, moonRashi: rashiKey };
    const moonPhase = getDashboardMoonPhase(details.tithi.index, details.tithi.name, details.tithi.paksha);
    res.json({ success: true, data: { snapshot, horoscope: mergedHoroscope, cosmicEnergy, transitAlerts, planets, dasha: dashaInfo, tithi: details.tithi, yoga: details.yoga, moonPhase } });
  } catch (error: unknown) {
    logger.warn({ error }, 'AI dashboard horoscope fallback');
    const moonPhase = getDashboardMoonPhase(details.tithi.index, details.tithi.name, details.tithi.paksha);
    res.json({ success: true, data: { snapshot, horoscope, cosmicEnergy, transitAlerts, planets, dasha: dashaInfo, tithi: details.tithi, yoga: details.yoga, moonPhase } });
  }
}));
