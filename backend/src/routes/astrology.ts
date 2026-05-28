import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { optionalAuth } from '../middleware/auth.js';
import { RASHI_DATA, RASHI_KEYS, NAKSHATRAS, NAKSHATRA_LORDS } from '../services/astrology/constants.js';
import { calculateBirthDetails, getMoonPhase } from '../services/astrology/calculator.js';
import { generateStructuredJSON, generateAIResponse } from '../lib/ai.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import type { VedicProfile, DailyHoroscope, CompatibilityResult, MoonPhaseInfo } from '../../../shared/types/api.js';

export const astrologyRouter = Router();

const tithiSignificanceMap: Record<string, string> = {
  'Prathama (Pratipat)': 'Auspicious for fresh ventures, clearing old debts, and initiating creative cycles.',
  'Dwitiya': 'Favorable for laying foundations, financial investments, and peaceful ceremonies.',
  'Tritiya': 'Blessed of Goddess Gauri. Highly auspicious for relationship bonding and learning arts.',
  'Chaturthi': 'Ganesha energies. Perfect for clearing obstacles, deep spiritual purges, and fasting.',
  'Panchami': 'Dedicated to Saraswati. Favorable for intellectual learning and seeking career guidance.',
  'Shashti': 'Kartikeya energies. Excellent for strategy and physically protecting boundaries.',
  'Saptami': 'Sun god Surya phase. Favorable for purchasing vehicles and starting long journeys.',
  'Ashtami': 'Durga Ashtami energies. Excellent for self-discipline, fasting, and deep meditation.',
  'Navami': 'Ram Navami alignments. Suitable for competitive endeavors and seeking truth.',
  'Dashami': 'Excellent for buying land, taking leadership, and conducting charities.',
  'Ekadashi': 'Sacred Vishnu Day. Recommended for complete fasting and spiritual contemplation.',
  'Dwadashi': 'Favorable for charitable acts, ending fasts, and ancestor blessings.',
  'Trayodashi': 'Pradosham energies. Powerful for evening meditation and releasing heavy karma.',
  'Chaturdashi': 'Shiva energies. Power times for emotional release and meditation.',
  'Purnima': 'Peak lunar energy. Auspicious for spiritual elevation and manifesting intentions.',
  'Amavasya': 'Void moon. Perfect for ancestral veneration, shadow work, and grounding.',
};

function buildFallbackProfile(name: string, birthDate: string, birthTime: string, birthPlace: string): VedicProfile {
  const { dateObj, rashiIndex, rashiKey, nakshatraIndex, nakshatraName, lagnaIndex, lagnaKey } = calculateBirthDetails(birthDate, birthTime);
  const rashiDetails = RASHI_DATA[rashiKey] || RASHI_DATA.Mesh;
  const lagnaDetails = RASHI_DATA[lagnaKey] || RASHI_DATA.Mesh;

  return {
    name, birthDate, birthTime, birthPlace,
    rashi: `${rashiKey} (${rashiDetails.translation})`,
    westernSign: rashiDetails.translation,
    nakshatra: nakshatraName,
    nakshatraLord: NAKSHATRA_LORDS[nakshatraIndex % 9],
    lagna: `${lagnaKey} (${lagnaDetails.translation})`,
    element: rashiDetails.element,
    rashiLord: rashiDetails.lord,
    doshaDominance: rashiDetails.dosha,
    generalReading: `You possess a powerful Vedic placement dominated by the ${nakshatraName} Nakshatra. Your Moon sign ${rashiKey} (${rashiDetails.translation}) represents alignment with the ${rashiDetails.element} element, infused by ${rashiDetails.lord}. Your Lagna in ${lagnaKey} gives a practical, structured personality.`,
    strengths: [
      `Strong intuitive guidance from ${rashiDetails.lord}`,
      'Emotional resilience with high willpower',
      `Natural charisma from ${nakshatraName} alignment`,
    ],
    weaknesses: [
      'Tendency toward restlessness during astrological shifts',
      `Susceptibility to ${rashiDetails.dosha} imbalances under stress`,
      'Periodic emotional sensitivity during key transits',
    ],
    luckyNumber: (nakshatraIndex % 9) + 1,
    luckyColor: rashiDetails.element === 'Fire' ? 'Golden / Crimson' : rashiDetails.element === 'Water' ? 'Royal Blue / Teal' : rashiDetails.element === 'Air' ? 'Emerald Green / Silver' : 'Earthy Yellow / Gold',
    gemstone: rashiDetails.element === 'Fire' ? 'Ruby (Manik)' : rashiDetails.element === 'Water' ? 'Pearl (Moti)' : rashiDetails.element === 'Air' ? 'Emerald (Panna)' : 'Yellow Sapphire (Pukhraj)',
    planetaryPlacements: [
      { planet: 'Lagna (Ascendant)', sign: lagnaKey, house: 1, description: 'Represents your selfhood and life direction.' },
      { planet: 'Moon (Chandra)', sign: rashiKey, house: 10, description: 'Your emotional filter and intuitive core.' },
      { planet: 'Sun (Surya)', sign: RASHI_KEYS[(rashiIndex + 4) % 12], house: 2, description: 'Career foundation and core ego.' },
      { planet: 'Jupiter (Guru)', sign: RASHI_KEYS[(rashiIndex + 11) % 12], house: 11, description: 'Bestows wisdom and spiritual growth.' },
      { planet: 'Saturn (Shani)', sign: RASHI_KEYS[(rashiIndex + 6) % 12], house: 4, description: 'Teaches discipline through hard work.' },
    ],
  };
}

astrologyRouter.post('/vedic-profile', optionalAuth, async (req, res) => {
  const { name, birthDate, birthTime, birthPlace } = req.body;
  if (!name || !birthDate || !birthTime || !birthPlace) {
    return res.status(400).json({ success: false, error: 'Missing required birth details' });
  }

  const fallback = buildFallbackProfile(name, birthDate, birthTime, birthPlace);

  try {
    const { rashiIndex, rashiKey, nakshatraName, lagnaIndex, lagnaKey } = calculateBirthDetails(birthDate, birthTime);
    const rashiDetails = RASHI_DATA[rashiKey] || RASHI_DATA.Mesh;

    const prompt = `Generate a Vedic astrology profile for ${name}, born ${birthDate} at ${birthTime} in ${birthPlace}.
Moon Sign: ${rashiKey} (${rashiDetails.translation}), ruled by ${rashiDetails.lord}.
Nakshatra: ${nakshatraName}. Lagna: ${lagnaKey}.
Return a rich, personalized reading with strengths, weaknesses, lucky attributes, and planetary placements.`;

    const systemInstruction = 'You are an expert Vedic astrologer. Return JSON with all required fields.';

    const aiResult = await generateStructuredJSON<VedicProfile>(prompt, systemInstruction);
    const merged = { ...fallback, ...aiResult, name, birthDate, birthTime, birthPlace };

    if (req.user) {
      await prisma.astrologyReport.create({
        data: {
          userId: req.user.userId,
          type: 'vedic_profile',
          input: { name, birthDate, birthTime, birthPlace },
          result: merged as unknown as Record<string, unknown>,
        },
      });
    }

    res.json({ success: true, data: merged });
  } catch (error) {
    logger.warn({ error }, 'AI profile failed, using fallback');
    res.json({ success: true, data: fallback });
  }
});

astrologyRouter.post('/daily-horoscope', optionalAuth, async (req, res) => {
  const { rashi } = req.body;
  if (!rashi) return res.status(400).json({ success: false, error: 'Rashi is required' });

  const rashiDetails = RASHI_DATA[rashi] || RASHI_DATA.Mesh;

  const fallback: DailyHoroscope = {
    rashi,
    englishName: rashiDetails.translation,
    general: `Today holds promise under ${rashiDetails.lord}. Focus on structure and wellness.`,
    career: 'A collaborative aspect helps resolve conflicts. Creative ideas flourish.',
    finance: 'Avoid speculative spending. Maintain classic budget models.',
    love: 'Soft communication enhances relationships. Singles may find wise advisors.',
    health: `Focus on calming ${rashiDetails.dosha} energy with pranayama and grounding foods.`,
    luckyNumber: Math.floor(Math.random() * 9) + 1,
    luckyColor: rashiDetails.element === 'Fire' ? 'Burgundy / Gold' : 'Cyan / Moonstone',
    luckyTime: '10:30 AM to 12:00 PM',
    energyLevel: 82,
    remedy: `Chant 'Om Somaya Namaha' 9 times to harmonize with today's lunar rhythm.`,
  };

  try {
    const prompt = `Generate a Vedic daily horoscope for Moon Sign ${rashi} (${rashiDetails.translation}), ruled by ${rashiDetails.lord}. Include general, career, finance, love, health, lucky attributes, and a mantra remedy. Return JSON.`;
    const systemInstruction = 'You are an expert Vedic astrologer providing daily horoscopes.';
    const aiResult = await generateStructuredJSON<DailyHoroscope>(prompt, systemInstruction);
    const merged = { ...fallback, ...aiResult, rashi };

    if (req.user) {
      await prisma.astrologyReport.create({
        data: { userId: req.user.userId, type: 'daily_horoscope', input: { rashi }, result: merged as unknown as Record<string, unknown> },
      });
    }

    res.json({ success: true, data: merged });
  } catch {
    res.json({ success: true, data: fallback });
  }
});

astrologyRouter.post('/compatibility', optionalAuth, async (req, res) => {
  const { partnerA, partnerB } = req.body;
  if (!partnerA?.name || !partnerB?.name) {
    return res.status(400).json({ success: false, error: 'Both partner details required' });
  }

  const { rashiKey: rashiA, nakshatraName: nakshatraA } = calculateBirthDetails(partnerA.birthDate, partnerA.birthTime);
  const { rashiKey: rashiB, nakshatraName: nakshatraB } = calculateBirthDetails(partnerB.birthDate, partnerB.birthTime);

  const rawSum = new Date(partnerA.birthDate).getDate() + new Date(partnerB.birthDate).getDate();
  const gunsMatched = 12 + (rawSum % 21);
  const compatibilityScore = Math.round((gunsMatched / 36) * 100);
  let verdict = 'Medium Alignment';
  if (gunsMatched >= 25) verdict = 'Auspicious Union (High Harmony)';
  else if (gunsMatched < 18) verdict = 'Challenging Match (Remedial Effort Recommended)';

  const fallback: CompatibilityResult = {
    partnerA_Rashi: `${rashiA} (${RASHI_DATA[rashiA].translation})`,
    partnerB_Rashi: `${rashiB} (${RASHI_DATA[rashiB].translation})`,
    partnerA_Nakshatra: nakshatraA,
    partnerB_Nakshatra: nakshatraB,
    compatibilityScore,
    gunsMatched,
    verdict,
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
    detailedAnalysis: `This Ashta Koota assessment scores ${gunsMatched}/36 Gunas. You have solid celestial foundations in Graha Maitri and Yoni.`,
  };

  try {
    const prompt = `Vedic compatibility (Gun Milan) for:
Partner A: ${partnerA.name}, born ${partnerA.birthDate} ${partnerA.birthTime} (Rashi: ${rashiA}, Nakshatra: ${nakshatraA})
Partner B: ${partnerB.name}, born ${partnerB.birthDate} ${partnerB.birthTime} (Rashi: ${rashiB}, Nakshatra: ${nakshatraB})
Provide Ashta Koota breakdown, strengths, challenges, remedy, and detailed analysis. Return JSON.`;
    const systemInstruction = 'You are an expert Vedic matchmaker specializing in Ashta Koota Gun Milan.';
    const aiResult = await generateStructuredJSON<CompatibilityResult>(prompt, systemInstruction);
    const merged = { ...fallback, ...aiResult };

    if (req.user) {
      await prisma.astrologyReport.create({
        data: { userId: req.user.userId, type: 'compatibility', input: { partnerA, partnerB }, result: merged as unknown as Record<string, unknown> },
      });
    }

    res.json({ success: true, data: merged });
  } catch {
    res.json({ success: true, data: fallback });
  }
});

astrologyRouter.post('/moon-phase', optionalAuth, async (req, res) => {
  const { date } = req.body;
  const targetDate = date ? new Date(date) : new Date();
  const moon = getMoonPhase(targetDate);

  const cleanTithiRoot = moon.tithiName.split(' ')[0];
  const tithiMeaning = tithiSignificanceMap[cleanTithiRoot] || tithiSignificanceMap[moon.tithiName] || 'An auspicious day for meditation and spiritual hygiene.';

  const fallback: MoonPhaseInfo = {
    date: targetDate.toISOString().split('T')[0],
    phaseName: moon.phaseName,
    illumination: moon.illumination,
    age: moon.age,
    distance: moon.distance,
    tithiNum: moon.tithiNum,
    tithiName: moon.tithiName,
    tithiType: moon.tithiType,
    tithiSignificance: tithiMeaning,
    nextPurnima: moon.nextPurnima,
    nextAmavasya: moon.nextAmavasya,
  };

  try {
    const prompt = `Enrich these moon details for ${fallback.date}: Phase: ${moon.phaseName}, Illumination: ${moon.illumination}%, Tithi: ${moon.tithiName}. Provide spiritual significance and confirm next Purnima/Amavasya. Return JSON.`;
    const systemInstruction = 'You are a Vedic lunar sage.';
    const aiResult = await generateStructuredJSON<{ tithiSignificance: string }>(prompt, systemInstruction);
    const merged = { ...fallback, ...aiResult };

    if (req.user) {
      await prisma.astrologyReport.create({
        data: { userId: req.user.userId, type: 'moon_phase', input: { date }, result: merged as unknown as Record<string, unknown> },
      });
    }

    res.json({ success: true, data: merged });
  } catch {
    res.json({ success: true, data: fallback });
  }
});
