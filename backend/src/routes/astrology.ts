import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { RASHI_DATA, RASHI_KEYS, NAKSHATRA_LORDS } from '../services/astrology/constants.js';
import { calculateBirthDetails, getMoonPhase } from '../services/astrology/calculator.js';
import { generateStructuredJSON } from '../lib/ai.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import type { VedicProfile, DailyHoroscope, CompatibilityResult, MoonPhaseInfo } from '@shared/types/api.js';

export const astrologyRouter = Router();

const TITHI_SIGNIFICANCE: Record<string, string> = {
  'Prathama (Pratipat)': 'Auspicious for fresh ventures, clearing old debts, and initiating creative cycles under cosmic guidance.',
  'Dwitiya': 'Favorable for laying foundations, financial investments, and peaceful ceremonies.',
  'Tritiya': 'Blessed by Goddess Gauri. Highly auspicious for relationship bonding and learning arts.',
  'Chaturthi': 'Ganesha energies prevail. Perfect for clearing obstacles, spiritual purges, and fasting.',
  'Panchami': 'Dedicated to Goddess Saraswati. Favorable for intellectual pursuits and career guidance.',
  'Shashti': 'Kartikeya energies. Excellent for strategy and protecting boundaries.',
  'Saptami': 'Sun god Surya\'s phase. Favorable for travel and new beginnings.',
  'Ashtami': 'Durga Ashtami. Excellent for self-discipline and deep meditation.',
  'Navami': 'Ram Navami alignments. Suitable for competitive endeavors.',
  'Dashami': 'Excellent for leadership, purchases, and charitable acts.',
  'Ekadashi': 'Sacred Vishnu Day. Recommended for fasting and spiritual contemplation.',
  'Dwadashi': 'Favorable for charity and ancestor blessings.',
  'Trayodashi': 'Pradosham energies. Powerful for meditation and karma release.',
  'Chaturdashi': 'Shiva energies. Ideal for emotional release and meditation.',
  'Purnima': 'Peak lunar energy. Auspicious for spiritual elevation and manifestation.',
  'Amavasya': 'Void moon. Perfect for ancestral veneration and grounding.',
};

function buildFallbackProfile(name: string, birthDate: string, birthTime: string, birthPlace: string): VedicProfile {
  const { rashiIndex, rashiKey, nakshatraIndex, nakshatraName, lagnaKey } = calculateBirthDetails(birthDate, birthTime);
  const rd = RASHI_DATA[rashiKey] || RASHI_DATA.Mesh;
  const ld = RASHI_DATA[lagnaKey] || RASHI_DATA.Mesh;
  return {
    name, birthDate, birthTime, birthPlace,
    rashi: `${rashiKey} (${rd.translation})`,
    westernSign: rd.translation,
    nakshatra: nakshatraName,
    nakshatraLord: NAKSHATRA_LORDS[nakshatraIndex % 9],
    lagna: `${lagnaKey} (${ld.translation})`,
    element: rd.element,
    rashiLord: rd.lord,
    doshaDominance: rd.dosha,
    generalReading: `Your Vedic chart is dominated by the ${nakshatraName} Nakshatra. Your Moon sign ${rashiKey} (${rd.translation}) represents alignment with the ${rd.element} element, infused by ${rd.lord}. Your Lagna in ${lagnaKey} gives a structured personality.`,
    strengths: [`Strong guidance from ${rd.lord}`, 'Emotional resilience', 'Natural charisma'],
    weaknesses: ['Restlessness during shifts', `${rd.dosha} susceptibility under stress`, 'Emotional sensitivity during transits'],
    luckyNumber: (nakshatraIndex % 9) + 1,
    luckyColor: rd.element === 'Fire' ? 'Golden / Crimson' : rd.element === 'Water' ? 'Royal Blue / Teal' : rd.element === 'Air' ? 'Emerald Green / Silver' : 'Earthy Yellow / Gold',
    gemstone: rd.element === 'Fire' ? 'Ruby (Manik)' : rd.element === 'Water' ? 'Pearl (Moti)' : rd.element === 'Air' ? 'Emerald (Panna)' : 'Yellow Sapphire (Pukhraj)',
    planetaryPlacements: [
      { planet: 'Lagna (Ascendant)', sign: lagnaKey, house: 1, description: 'Your selfhood and life direction.' },
      { planet: 'Moon (Chandra)', sign: rashiKey, house: 10, description: 'Your emotional filter and intuitive core.' },
      { planet: 'Sun (Surya)', sign: RASHI_KEYS[(rashiIndex + 4) % 12], house: 2, description: 'Career foundation and core ego.' },
      { planet: 'Jupiter (Guru)', sign: RASHI_KEYS[(rashiIndex + 11) % 12], house: 11, description: 'Wisdom and spiritual growth.' },
      { planet: 'Saturn (Shani)', sign: RASHI_KEYS[(rashiIndex + 6) % 12], house: 4, description: 'Discipline through hard work.' },
    ],
  };
}

const birthChartSchema = z.object({
  name: z.string().min(1).max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
  birthPlace: z.string().min(1).max(200),
});

astrologyRouter.post('/vedic-profile', optionalAuth, validate(birthChartSchema), asyncHandler(async (req, res) => {
  const { name, birthDate, birthTime, birthPlace } = req.body as z.infer<typeof birthChartSchema>;
  const fallback = buildFallbackProfile(name, birthDate, birthTime, birthPlace);

  try {
    const { rashiKey, nakshatraName, lagnaKey } = calculateBirthDetails(birthDate, birthTime);
    const rd = RASHI_DATA[rashiKey] || RASHI_DATA.Mesh;
    const prompt = `Generate a detailed Vedic astrology birth chart for ${name}, born ${birthDate} at ${birthTime} in ${birthPlace}. Moon Sign: ${rashiKey} (${rd.translation}), Nakshatra: ${nakshatraName}, Lagna: ${lagnaKey}. Return a personalized reading with strengths, weaknesses, lucky attributes, and planetary placements as JSON.`;
    const aiResult = await generateStructuredJSON<VedicProfile>(prompt, 'You are an expert Vedic astrologer. Return valid JSON.');
    const merged = { ...fallback, ...aiResult, name, birthDate, birthTime, birthPlace };

    if (req.user) {
      await prisma.astrologyReport.create({
        data: { userId: req.user.userId, type: 'vedic_profile', input: { name, birthDate, birthTime, birthPlace },         result: JSON.parse(JSON.stringify(merged)) },
      }).catch(() => {});
    }
    res.json({ success: true, data: merged });
  } catch (error) {
    logger.warn({ error }, 'AI profile fallback used');
    res.json({ success: true, data: fallback });
  }
}));

const horoscopeSchema = z.object({ rashi: z.string().min(1).max(50) });

astrologyRouter.post('/daily-horoscope', optionalAuth, validate(horoscopeSchema), asyncHandler(async (req, res) => {
  const { rashi } = req.body as z.infer<typeof horoscopeSchema>;
  const rd = RASHI_DATA[rashi] || RASHI_DATA.Mesh;
  const fallback: DailyHoroscope = {
    rashi, englishName: rd.translation,
    general: `Today holds promise under ${rd.lord}. Focus on structure and wellness.`,
    career: 'A collaborative aspect helps resolve conflicts. Creative ideas flourish.',
    finance: 'Avoid speculative spending. Maintain classic budget models.',
    love: 'Soft communication enhances relationships. Singles may find wise advisors.',
    health: `Focus on calming ${rd.dosha} energy with pranayama and grounding foods.`,
    luckyNumber: Math.floor(Math.random() * 9) + 1,
    luckyColor: rd.element === 'Fire' ? 'Burgundy / Gold' : 'Cyan / Moonstone',
    luckyTime: '10:30 AM to 12:00 PM',
    energyLevel: 82,
    remedy: `Chant 'Om Somaya Namaha' 9 times to harmonize with today's lunar rhythm.`,
  };

  try {
    const prompt = `Generate a Vedic daily horoscope for Moon Sign ${rashi} (${rd.translation}), ruled by ${rd.lord}. Include general, career, finance, love, health, lucky attributes, energyLevel (1-100), and a mantra remedy. Return JSON.`;
    const aiResult = await generateStructuredJSON<DailyHoroscope>(prompt, 'You are an expert Vedic astrologer providing daily horoscopes. Return JSON.');
    const merged = { ...fallback, ...aiResult, rashi };
    if (req.user) {
      await prisma.astrologyReport.create({
        data: { userId: req.user.userId, type: 'daily_horoscope', input: { rashi },         result: JSON.parse(JSON.stringify(merged)) },
      }).catch(() => {});
    }
    res.json({ success: true, data: merged });
  } catch {
    res.json({ success: true, data: fallback });
  }
}));

const compatibilitySchema = z.object({
  partnerA: z.object({ name: z.string().min(1), birthDate: z.string(), birthTime: z.string(), birthPlace: z.string() }),
  partnerB: z.object({ name: z.string().min(1), birthDate: z.string(), birthTime: z.string(), birthPlace: z.string() }),
});

astrologyRouter.post('/compatibility', optionalAuth, validate(compatibilitySchema), asyncHandler(async (req, res) => {
  const { partnerA, partnerB } = req.body as z.infer<typeof compatibilitySchema>;
  const { rashiKey: rashiA, nakshatraName: nakshatraA } = calculateBirthDetails(partnerA.birthDate, partnerA.birthTime);
  const { rashiKey: rashiB, nakshatraName: nakshatraB } = calculateBirthDetails(partnerB.birthDate, partnerB.birthTime);

  const rawSum = new Date(partnerA.birthDate).getDate() + new Date(partnerB.birthDate).getDate();
  const gunsMatched = 12 + (rawSum % 21);
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
    gunAnalysis: [
      { kootaName: 'Varna (1)', description: 'Spiritual compatibility', pointsScored: rawSum % 2 ? 1 : 0, maxPoints: 1 },
      { kootaName: 'Vashya (2)', description: 'Mutual attraction', pointsScored: rawSum % 3 === 0 ? 2 : rawSum % 3 === 1 ? 1 : 0, maxPoints: 2 },
      { kootaName: 'Tara (3)', description: 'Health & longevity', pointsScored: (rawSum % 3) + 1, maxPoints: 3 },
      { kootaName: 'Yoni (4)', description: 'Physical compatibility', pointsScored: (rawSum % 4) + 1, maxPoints: 4 },
      { kootaName: 'Graha Maitri (5)', description: 'Intellectual alignment', pointsScored: (rawSum % 5) + 1, maxPoints: 5 },
      { kootaName: 'Gana (6)', description: 'Temperament matching', pointsScored: rawSum % 2 === 0 ? 6 : 0, maxPoints: 6 },
      { kootaName: 'Bhakoot (7)', description: 'Family & wealth', pointsScored: rawSum % 3 === 1 ? 7 : 0, maxPoints: 7 },
      { kootaName: 'Nadi (8)', description: 'Genetic health', pointsScored: rawSum % 2 === 1 ? 8 : 0, maxPoints: 8 },
    ],
    strengths: `${partnerA.name}'s element (${RASHI_DATA[rashiA].element}) blends with ${partnerB.name}'s (${RASHI_DATA[rashiB].element}).`,
    challenges: `Communication differences when Ayurvedic ${RASHI_DATA[rashiA].dosha} clashes with ${RASHI_DATA[rashiB].dosha}.`,
    remedy: 'Chant Gayatri Mantra 11 times on Sundays for harmony.',
    detailedAnalysis: `This Ashta Koota assessment scores ${gunsMatched}/36 Gunas. Solid foundations in Graha Maitri and Yoni.`,
  };

  try {
    const prompt = `Vedic compatibility (Gun Milan) for:\nPartner A: ${partnerA.name}, born ${partnerA.birthDate} ${partnerA.birthTime} (Rashi: ${rashiA}, Nakshatra: ${nakshatraA})\nPartner B: ${partnerB.name}, born ${partnerB.birthDate} ${partnerB.birthTime} (Rashi: ${rashiB}, Nakshatra: ${nakshatraB})\nProvide Ashta Koota breakdown, strengths, challenges, remedy, and detailed analysis. Return JSON.`;
    const aiResult = await generateStructuredJSON<CompatibilityResult>(prompt, 'You are an expert Vedic matchmaker specializing in Ashta Koota Gun Milan.');
    const merged = { ...fallback, ...aiResult };
    if (req.user) {
      await prisma.astrologyReport.create({
        data: { userId: req.user.userId, type: 'compatibility', input: { partnerA, partnerB },         result: JSON.parse(JSON.stringify(merged)) },
      }).catch(() => {});
    }
    res.json({ success: true, data: merged });
  } catch {
    res.json({ success: true, data: fallback });
  }
}));

const moonPhaseSchema = z.object({ date: z.string().optional() });

astrologyRouter.post('/moon-phase', optionalAuth, validate(moonPhaseSchema), asyncHandler(async (req, res) => {
  const { date } = req.body as z.infer<typeof moonPhaseSchema>;
  const targetDate = date ? new Date(date) : new Date();
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
    const prompt = `Enrich moon details for ${fallback.date}: Phase: ${moon.phaseName}, Illumination: ${moon.illumination}%, Tithi: ${moon.tithiName}. Provide spiritual significance. Return JSON.`;
    const aiResult = await generateStructuredJSON<{ tithiSignificance: string }>(prompt, 'You are a Vedic lunar sage.');
    const merged = { ...fallback, ...aiResult };
    if (req.user) {
      await prisma.astrologyReport.create({
        data: { userId: req.user.userId, type: 'moon_phase', input: { date },         result: JSON.parse(JSON.stringify(merged)) },
      }).catch(() => {});
    }
    res.json({ success: true, data: merged });
  } catch {
    res.json({ success: true, data: fallback });
  }
}));
