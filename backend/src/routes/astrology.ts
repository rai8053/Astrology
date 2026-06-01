import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { optionalAuth, authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { RASHI_DATA, RASHI_KEYS, NAKSHATRA_LORDS, NAKSHATRAS } from '../services/astrology/constants.js';
import { calculateBirthDetails, getMoonPhase } from '../services/astrology/calculator.js';
import { generateStructuredJSON } from '../lib/ai.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import type { VedicProfile, DailyHoroscope, CompatibilityResult, MoonPhaseInfo, AstroInsight, Remedy, TransitEvent, PersonalDashboardData } from '@shared/types/api.js';

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

const ELEMENT_TRAITS: Record<string, { personality: string; career: string; relationship: string; finance: string; health: string; spiritual: string }> = {
  Fire: {
    personality: 'Bold, courageous, and natural leadership qualities. You possess an innate drive that inspires others.',
    career: 'Thrives in leadership, entrepreneurship, sports, and creative direction. Natural trailblazer.',
    relationship: 'Passionate and intense. Needs a partner who matches your energy and independence.',
    finance: 'Bold investor with high confidence. Best results with diverse portfolio and guided risk-taking.',
    health: 'Prone to inflammatory conditions. Benefit from cooling foods, meditation, and moderate exercise.',
    spiritual: 'Natural spiritual warrior. Bhakti yoga and fire ceremonies (homa) resonate deeply.'
  },
  Earth: {
    personality: 'Grounded, practical, and dependable. Your stability creates a foundation for others to build upon.',
    career: 'Excel in finance, agriculture, real estate, and management. Patient builders of lasting value.',
    relationship: 'Loyal and devoted. Seeks long-term security and emotional stability in partnerships.',
    finance: 'Natural wealth accumulator. Conservative investments yield steady growth over time.',
    health: 'Focus on digestion and elimination. Benefit from warm, cooked foods and regular routine.',
    spiritual: 'Grounded practices like hatha yoga and mantra meditation build spiritual resilience.'
  },
  Air: {
    personality: 'Intellectual, communicative, and adaptable. Your mind is your greatest asset.',
    career: 'Excellent in writing, teaching, technology, and consulting. Ideas drive your success.',
    relationship: 'Needs mental stimulation and intellectual connection. Communication is the foundation.',
    finance: 'Innovative income streams. Multiple revenue sources suit your versatile nature.',
    health: 'Vata-sensitive. Benefit from warm, oily foods, regular sleep schedule, and gentle exercise.',
    spiritual: 'Jnana yoga and study of scriptures. Pranayama balances the active mind.'
  },
  Water: {
    personality: 'Emotional, intuitive, and deeply compassionate. Your empathy connects you to all beings.',
    career: 'Natural in healing arts, counseling, creative arts, and spiritual guidance.',
    relationship: 'Deeply emotional and nurturing. Needs emotional security and authentic connection.',
    finance: 'Fluctuating income but long-term security through intuition-driven decisions.',
    health: 'Focus on emotional health. Benefit from warm spices, regular detox, and water therapies.',
    spiritual: 'Bhakti yoga and devotional practices. Natural connection to the divine feminine.'
  }
};

const NAKSHATRA_MEANINGS: Record<string, { deity: string; symbol: string; meaning: string }> = {
  Ashwini: { deity: 'Ashwini Kumaras', symbol: 'Horse\'s head', meaning: 'Swiftness, healing, and new beginnings.' },
  Bharani: { deity: 'Yama', symbol: 'Yoni', meaning: 'Transformation, discipline, and endurance.' },
  Krittika: { deity: 'Agni', symbol: 'Razor / Flame', meaning: 'Purification, courage, and sharp intellect.' },
  Rohini: { deity: 'Brahma / Prajapati', symbol: 'Chariot', meaning: 'Creativity, beauty, and nourishment.' },
  Mrigashira: { deity: 'Soma / Chandra', symbol: 'Deer head', meaning: 'Curiosity, exploration, and gentle search.' },
  Ardra: { deity: 'Rudra', symbol: 'Teardrop / Diamond', meaning: 'Storm, transformation, and emotional release.' },
  Punarvasu: { deity: 'Aditi', symbol: 'Quiver of arrows', meaning: 'Renewal, return, and abundance.' },
  Pushya: { deity: 'Brihaspati', symbol: 'Cow\'s udder / Flower', meaning: 'Nourishment, wisdom, and spiritual growth.' },
  Ashlesha: { deity: 'Shesha / Naga', symbol: 'Serpent', meaning: 'Mystery, intensity, and healing power.' },
  Magha: { deity: 'Pitris', symbol: 'Royal throne', meaning: 'Ancestry, authority, and noble lineage.' },
  'Purva Phalguni': { deity: 'Bhaga', symbol: 'Front legs of bed / Fig tree', meaning: 'Pleasure, romance, and creative joy.' },
  'Uttara Phalguni': { deity: 'Aryaman', symbol: 'Back legs of bed', meaning: 'Marriage, patronage, and stable growth.' },
  Hasta: { deity: 'Savitr', symbol: 'Hand / Fist', meaning: 'Skill, craftsmanship, and manual dexterity.' },
  Chitra: { deity: 'Tvashtar / Vishvakarma', symbol: 'Pearl / Bright jewel', meaning: 'Beauty, art, and architectural vision.' },
  Swati: { deity: 'Vayu', symbol: 'Coral / Swords', meaning: 'Independence, flexibility, and entrepreneurial spirit.' },
  Vishakha: { deity: 'Indra-Agni', symbol: 'Potter\'s wheel / Archway', meaning: 'Determination, focus, and achievement.' },
  Anuradha: { deity: 'Mitra', symbol: 'Lotus / Temple', meaning: 'Devotion, friendship, and spiritual alignment.' },
  Jyeshtha: { deity: 'Indra', symbol: 'Umbrella / Earring', meaning: 'Protection, authority, and seniority.' },
  Mula: { deity: 'Nirriti / Alaksmi', symbol: 'Tied roots', meaning: 'Root transformation, deep investigation.' },
  'Purva Ashadha': { deity: 'Apah', symbol: 'Elephant tusk / Fan', meaning: 'Victory, purification, and cleansing.' },
  'Uttara Ashadha': { deity: 'Vishvadevas', symbol: 'Elephant tusk / Platform', meaning: 'Enduring victory and universal wisdom.' },
  Shravana: { deity: 'Vishnu', symbol: 'Ear / Three footprints', meaning: 'Listening, learning, and divine communication.' },
  Dhanishta: { deity: 'Vasus / Ashta Vasus', symbol: 'Drum / Flute', meaning: 'Rhythm, music, and material prosperity.' },
  Shatabhisha: { deity: 'Varuna', symbol: 'Empty circle / 100 physicians', meaning: 'Healing, secrecy, and scientific mind.' },
  'Purva Bhadrapada': { deity: 'Aja Ekapada', symbol: 'Sword / Front of funeral cot', meaning: 'Spiritual intensity, transformation, and asceticism.' },
  'Uttara Bhadrapada': { deity: 'Ahir Budhyana', symbol: 'Back of funeral cot / Twin', meaning: 'Depth, psychic ability, and ritual purity.' },
  Revati: { deity: 'Pushan', symbol: 'Fish / Drum', meaning: 'Nourishment, safe journey, and gentle completion.' }
};

function getNakshatraInfo(name: string) {
  return NAKSHATRA_MEANINGS[name] || { deity: 'Unknown', symbol: 'Mystical', meaning: 'Deep spiritual significance.' };
}

const INSIGHT_PERSONALITY_TEMPLATES: Record<string, string> = {
  Fire: 'You are a natural-born leader with an indomitable spirit. Your fire element gives you courage, charisma, and the ability to inspire others. You thrive on challenges and transform obstacles into opportunities.',
  Earth: 'Your earthy nature makes you the pillar of stability for everyone around you. Practical, reliable, and deeply patient, you build success methodically and create lasting value.',
  Air: 'Your intellect is your superpower. You think quickly, communicate brilliantly, and adapt to any situation. Your ideas have the power to shape the world around you.',
  Water: 'Your emotional depth and intuition are extraordinary gifts. You feel everything profoundly and your compassion heals those around you. Your creativity flows endlessly.'
};

function buildInsights(rashiKey: string, element: string, nakshatra: string, nakshatraLord: string): AstroInsight[] {
  const et = ELEMENT_TRAITS[element] || ELEMENT_TRAITS.Fire;
  const ni = getNakshatraInfo(nakshatra);
  return [
    { title: 'Personality', content: `${ELEMENT_TRAITS[element]?.personality || et.personality} Your nakshatra, ${nakshatra}, is ruled by ${ni.deity} and symbolized by ${ni.symbol}, indicating ${ni.meaning.toLowerCase()}`, score: 88, color: 'from-amber-400 to-orange-500' },
    { title: 'Career', content: et.career, score: 82, color: 'from-blue-400 to-indigo-500' },
    { title: 'Relationships', content: et.relationship, score: 76, color: 'from-pink-400 to-rose-500' },
    { title: 'Finance', content: et.finance, score: 79, color: 'from-emerald-400 to-teal-500' },
    { title: 'Health', content: et.health, score: 84, color: 'from-green-400 to-emerald-500' },
    { title: 'Spiritual Path', content: et.spiritual, score: 91, color: 'from-purple-400 to-violet-500' },
  ];
}

function buildRemedies(element: string, rashiLord: string, rashiKey: string): Remedy[] {
  const gemMap: Record<string, { stone: string; meaning: string }> = {
    Fire: { stone: 'Ruby (Manik)', meaning: 'Amplifies solar energy, boosts confidence and leadership.' },
    Earth: { stone: 'Yellow Sapphire (Pukhraj)', meaning: 'Enhances wisdom, prosperity, and marital harmony.' },
    Air: { stone: 'Emerald (Panna)', meaning: 'Sharpens intellect, improves communication and career prospects.' },
    Water: { stone: 'Pearl (Moti)', meaning: 'Calms emotions, strengthens intuition and lunar energy.' }
  };
  const gm = gemMap[element] || gemMap.Fire;
  return [
    { type: 'gemstone', title: `Wear ${gm.stone}`, description: `${gm.meaning} Best worn on the appropriate day after purification.`, icon: 'gem' },
    { type: 'mantra', title: `Chant for ${rashiLord}`, description: `Chant "Om ${rashiLord.split('/')[0].trim().toUpperCase()}YA NAMAH" 108 times daily during the morning hours for planetary peace.`, icon: 'om' },
    { type: 'color', title: 'Auspicious Colors', description: `Wear ${element === 'Fire' ? 'red, gold, and saffron' : element === 'Earth' ? 'yellow, cream, and earthy tones' : element === 'Air' ? 'green, silver, and pastels' : 'white, blue, and sea-green'} on important days for harmonious energy alignment.`, icon: 'palette' },
    { type: 'day', title: 'Lucky Days', description: `${rashiKey === 'Mesh' || rashiKey === 'Simha' || rashiKey === 'Dhanu' ? 'Tuesday and Sunday' : rashiKey === 'Vrishabh' || rashiKey === 'Kanya' || rashiKey === 'Makar' ? 'Friday and Saturday' : rashiKey === 'Mithun' || rashiKey === 'Tula' || rashiKey === 'Kumbha' ? 'Wednesday and Saturday' : 'Monday and Thursday'} are most favorable for new beginnings and important decisions.`, icon: 'calendar' },
    { type: 'remedy', title: 'Dosha Balance', description: `Practice ${element === 'Fire' ? 'cooling pranayama (Sheetali) and moonlight meditation' : element === 'Earth' ? 'grounding yoga and earthing walks in nature' : element === 'Air' ? 'warm oil massage (Abhyanga) and regular meal times' : 'gentle flowing movements and journaling'} to balance your ${element.toLowerCase()} energy daily.`, icon: 'sparkles' },
    { type: 'donation', title: 'Recommended Charity', description: `Donate ${element === 'Fire' ? 'red lentils, ghee, or blankets on Sundays' : element === 'Earth' ? 'yellow clothes, wheat, or gold on Thursdays' : element === 'Air' ? 'green vegetables, sesame seeds, or pulses on Wednesdays' : 'white rice, milk, or silver on Mondays'} to strengthen planetary beneficence.`, icon: 'heart' },
  ];
}

function buildTransitTimeline(rashiKey: string, nakshatra: string): TransitEvent[] {
  const now = new Date();
  const days = (n: number) => new Date(now.getTime() + n * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return [
    { date: days(3), title: 'Moon Transit', description: `Moon enters ${rashiKey}, enhancing emotional sensitivity and intuition.`, impact: 'neutral' },
    { date: days(7), title: 'Mercury Aspect', description: 'Mental clarity improves. Excellent for communication and negotiations.', impact: 'positive' },
    { date: days(14), title: 'Venus Alignment', description: 'Relationships and creative pursuits receive a harmonious boost.', impact: 'positive' },
    { date: days(21), title: 'Saturn Influence', description: 'A period of reflection and disciplined effort. Avoid impulsive decisions.', impact: 'challenging' },
    { date: days(30), title: 'Jupiter Blessing', description: 'Expansive energy brings opportunities for growth and learning.', impact: 'positive' },
  ];
}

function buildFallbackProfile(name: string, birthDate: string, birthTime: string, birthPlace: string): VedicProfile {
  const { rashiIndex, rashiKey, nakshatraIndex, nakshatraName, lagnaKey } = calculateBirthDetails(birthDate, birthTime);
  const rd = RASHI_DATA[rashiKey] || RASHI_DATA.Mesh;
  const ld = RASHI_DATA[lagnaKey] || RASHI_DATA.Mesh;
  const ni = getNakshatraInfo(nakshatraName);
  const element = rd.element;
  const rashiLord = rd.lord;
  return {
    name, birthDate, birthTime, birthPlace,
    rashi: `${rashiKey} (${rd.translation})`,
    westernSign: rd.translation,
    nakshatra: nakshatraName,
    nakshatraLord: NAKSHATRA_LORDS[nakshatraIndex % 9],
    lagna: `${lagnaKey} (${ld.translation})`,
    element,
    rashiLord,
    doshaDominance: rd.dosha,
    generalReading: `Your celestial blueprint is anchored by the ${nakshatraName} Nakshatra, ruled by ${ni.deity} and symbolized by ${ni.symbol}. This indicates ${ni.meaning.toLowerCase()} As a ${rashiKey} (${rd.translation}) Moon sign ruled by ${rashiLord}, your ${element.toLowerCase()} element infuses you with ${element === 'Fire' ? 'passion and courage' : element === 'Earth' ? 'stability and patience' : element === 'Air' ? 'intellect and adaptability' : 'intuition and compassion'}. Your Lagna (Ascendant) in ${lagnaKey} (${ld.translation}) shapes your outward personality with ${ld.element.toLowerCase()} qualities. This unique combination creates a soul with deep cosmic purpose.`,
    strengths: [
      `Guided by ${rashiLord} — ${element === 'Fire' ? 'courage and determination' : element === 'Earth' ? 'reliability and persistence' : element === 'Air' ? 'brilliant intellect and communication' : 'deep intuition and empathy'}`,
      `${nakshatraName} Nakshatra influence — ${ni.meaning}`,
      `${element} element strength — ${ELEMENT_TRAITS[element]?.personality?.split('.')[0] || 'innate power'}`,
      `${ld.translation} Ascendant — ${ld.element.toLowerCase()} grounded personality`,
      `Natural alignment with ${ni.deity} energy`
    ],
    weaknesses: [
      `${rd.dosha} dosha susceptibility during stressful periods`,
      `${element === 'Fire' ? 'Impatience and impulsiveness under pressure' : element === 'Earth' ? 'Stubbornness and resistance to change' : element === 'Air' ? 'Overthinking and indecisiveness' : 'Emotional overwhelm and boundary issues'}`,
      'Occasional restlessness during major transits',
    ],
    luckyNumber: (nakshatraIndex % 9) + 1,
    luckyColor: element === 'Fire' ? 'Crimson Red / Gold' : element === 'Water' ? 'Royal Blue / Sea Green' : element === 'Air' ? 'Emerald Green / Silver' : 'Saffron / Earthy Yellow',
    gemstone: element === 'Fire' ? 'Ruby (Manik)' : element === 'Water' ? 'Pearl (Moti)' : element === 'Air' ? 'Emerald (Panna)' : 'Yellow Sapphire (Pukhraj)',
    planetaryPlacements: [
      { planet: 'Lagna (Ascendant)', sign: lagnaKey, house: 1, description: `${ld.translation} rising — shapes your outward personality and life approach with ${ld.element.toLowerCase()} energy.` },
      { planet: 'Moon (Chandra)', sign: rashiKey, house: 10, description: `Moon in ${rashiKey} governs emotions, intuition, and your inner world. Ruled by ${rashiLord}.` },
      { planet: 'Sun (Surya)', sign: RASHI_KEYS[(rashiIndex + 4) % 12], house: 2, description: 'Represents your core identity, vitality, and life purpose in the house of values and family.' },
      { planet: 'Mercury (Budha)', sign: RASHI_KEYS[(rashiIndex + 2) % 12], house: 3, description: 'Governs communication, intellect, and analytical abilities in the house of courage.' },
      { planet: 'Venus (Shukra)', sign: RASHI_KEYS[(rashiIndex + 7) % 12], house: 5, description: 'Blesses creativity, romance, and artistic expression in the house of intelligence.' },
      { planet: 'Jupiter (Guru)', sign: RASHI_KEYS[(rashiIndex + 11) % 12], house: 9, description: 'Expands wisdom, fortune, and spiritual growth in the house of higher knowledge.' },
      { planet: 'Saturn (Shani)', sign: RASHI_KEYS[(rashiIndex + 6) % 12], house: 4, description: 'Brings discipline, life lessons, and karmic responsibility in the house of home.' },
      { planet: 'Mars (Mangal)', sign: RASHI_KEYS[(rashiIndex + 9) % 12], house: 6, description: 'Drives ambition, energy, and assertiveness in the house of service and overcoming obstacles.' },
    ],
    insights: buildInsights(rashiKey, element, nakshatraName, NAKSHATRA_LORDS[nakshatraIndex % 9]),
    remedies: buildRemedies(element, rashiLord, rashiKey),
    transitTimeline: buildTransitTimeline(rashiKey, nakshatraName),
  };
}

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format').refine((d) => {
  const date = new Date(d);
  const min = new Date('1900-01-01');
  const max = new Date();
  return date >= min && date <= max;
}, 'Birth date must be between 1900-01-01 and today');

const birthChartSchema = z.object({
  name: z.string().min(1).max(100),
  birthDate: dateStr,
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
  birthPlace: z.string().min(1).max(200),
});

astrologyRouter.post('/vedic-profile', optionalAuth, validate(birthChartSchema), asyncHandler(async (req, res) => {
  const { name, birthDate, birthTime, birthPlace } = req.body as z.infer<typeof birthChartSchema>;
  const fallback = buildFallbackProfile(name, birthDate, birthTime, birthPlace);

  try {
    const { rashiKey, nakshatraName, lagnaKey } = calculateBirthDetails(birthDate, birthTime);
    const rd = RASHI_DATA[rashiKey] || RASHI_DATA.Mesh;
    const prompt = `Write a personalized Vedic astrology reading for ${name}, born ${birthDate} at ${birthTime} in ${birthPlace}. Their chart has Moon in ${rashiKey} (${rd.translation}), Nakshatra ${nakshatraName}, and Lagna ${lagnaKey}. Return a flat JSON object with: generalReading (3-4 sentence personalized spiritual reading interpreting their chart), strengths (array of 5 personality/life strengths as full sentences), weaknesses (array of 3 areas for growth as full sentences), planetaryPlacements (array of 8 objects each with planet name, sign name, house number 1-12, and a brief interpretation of that placement). Do NOT calculate or change any astrology — only interpret and enrich the given data.`;
    const aiResult = await generateStructuredJSON<VedicProfile>(prompt, 'You are a Vedic astrology interpreter. The birth chart data has already been calculated. Your role is ONLY to write insightful interpretations and readings. Never change or recalculate any astrological facts. Return ONLY flat JSON.');
    const merged: VedicProfile = {
      ...fallback,
      generalReading: aiResult.generalReading ?? fallback.generalReading,
      strengths: aiResult.strengths ?? fallback.strengths,
      weaknesses: aiResult.weaknesses ?? fallback.weaknesses,
      planetaryPlacements: aiResult.planetaryPlacements ?? fallback.planetaryPlacements,
      name, birthDate, birthTime, birthPlace,
    };

    if (req.user) {
      await prisma.astrologyReport.create({
        data: { userId: req.user.userId, type: 'vedic_profile', input: { name, birthDate, birthTime, birthPlace }, result: JSON.parse(JSON.stringify(merged)) },
      }).catch((e) => { logger.error({ err: e }, 'Failed to save vedic_profile report'); });
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
      }).catch((e) => { logger.error({ err: e }, 'Failed to save daily_horoscope report'); });
    }
    res.json({ success: true, data: merged });
  } catch (error) {
    logger.warn({ error }, 'AI horoscope fallback');
    res.json({ success: true, data: fallback });
  }
}));

const compatibilitySchema = z.object({
  partnerA: z.object({ name: z.string().min(1), birthDate: dateStr, birthTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'), birthPlace: z.string().min(1).max(200) }),
  partnerB: z.object({ name: z.string().min(1), birthDate: dateStr, birthTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'), birthPlace: z.string().min(1).max(200) }),
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
    const prompt = `Vedic compatibility (Gun Milan) for:\nPartner A: ${partnerA.name}, born ${partnerA.birthDate} ${partnerA.birthTime} (Rashi: ${rashiA}, Nakshatra: ${nakshatraA})\nPartner B: ${partnerB.name}, born ${partnerB.birthDate} ${partnerB.birthTime} (Rashi: ${rashiB}, Nakshatra: ${nakshatraB})\nReturn a flat JSON object with fields: partnerA_Rashi, partnerB_Rashi, partnerA_Nakshatra, partnerB_Nakshatra, compatibilityScore (number 0-100), gunsMatched (number 0-36), verdict (string), gunAnalysis (array of {kootaName, description, pointsScored, maxPoints}), strengths (string), challenges (string), remedy (string), detailedAnalysis (string).`;
    const aiResult = await generateStructuredJSON<CompatibilityResult>(prompt, 'You are a Vedic matchmaker. Return ONLY a flat JSON object. No nested wrappers, no markdown.');
    const merged = { ...fallback, ...aiResult };
    if (req.user) {
      await prisma.astrologyReport.create({
        data: { userId: req.user.userId, type: 'compatibility', input: { partnerA, partnerB }, result: JSON.parse(JSON.stringify(merged)) },
      }).catch((e) => { logger.error({ err: e }, 'Failed to save compatibility report'); });
    }
    res.json({ success: true, data: merged });
  } catch (error) {
    logger.warn({ error }, 'AI compatibility fallback');
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
    const prompt = `Enrich moon details for ${fallback.date}: Phase: ${moon.phaseName}, Illumination: ${moon.illumination}%, Tithi: ${moon.tithiName}. Return a flat JSON object with a single field: tithiSignificance (string).`;
    const aiResult = await generateStructuredJSON<{ tithiSignificance: string }>(prompt, 'You are a Vedic lunar sage. Return ONLY {"tithiSignificance": "..."} with no nesting or markdown.');
    const merged = { ...fallback, ...aiResult };
    if (req.user) {
      await prisma.astrologyReport.create({
        data: { userId: req.user.userId, type: 'moon_phase', input: { date }, result: JSON.parse(JSON.stringify(merged)) },
      }).catch((e) => { logger.error({ err: e }, 'Failed to save moon_phase report'); });
    }
    res.json({ success: true, data: merged });
  } catch (error) {
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
  const colors: Record<string, string> = { Fire: 'Crimson Red / Gold', Earth: 'Forest Green / Saffron', Air: 'Sky Blue / Silver' };
  const luckyColor = colors[element] || 'Royal Blue / White';
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
  return { moonRashi: rashiKey, prediction, love, career, health, finance, luckyNumber: luckyNum, luckyColor, dailyAdvice };
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

const dashboardPeriodSchema = z.object({
  period: z.enum(['today', 'tomorrow', 'week', 'month']).optional().default('today'),
});

astrologyRouter.get('/personal-dashboard', authenticate, validate(dashboardPeriodSchema, 'query'), asyncHandler(async (req, res) => {
  const { period } = req.query as unknown as z.infer<typeof dashboardPeriodSchema>;
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { birthDate: true, birthTime: true, birthPlace: true },
  });
  if (!user?.birthDate || !user?.birthTime) {
    res.status(400).json({ success: false, error: 'Birth details required. Please update your profile settings.' });
    return;
  }
  const details = calculateBirthDetails(user.birthDate, user.birthTime);
  const { rashiKey, nakshatraName, lagnaKey } = details;
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
  const baseSeed = daySeed + details.rashiIndex * 1000;
  const snapshot: PersonalDashboardData['snapshot'] = {
    ascendant: `${lagnaKey} (${ld.translation})`, moonRashi: `${rashiKey} (${rd.translation})`, nakshatra: nakshatraName,
    nakshatraLord: NAKSHATRA_LORDS[details.nakshatraIndex % 9], rashiLord: rd.lord, element: rd.element, doshaDominance: rd.dosha,
  };
  const horoscope = buildHoroscope(rashiKey, rd.element, baseSeed);
  const cosmicEnergy = buildCosmicEnergy(rd.element, baseSeed + 100);
  const transitAlerts = buildTransitAlerts(rashiKey, baseSeed + 200);
  try {
    const prompt = `Write a personalized Vedic horoscope for someone with Moon in ${rashiKey} (${rd.translation}), Nakshatra ${nakshatraName}, ${rd.element} element, ruled by ${rd.lord}. Period: ${dateLabel}. Return flat JSON with fields: prediction (2-3 sentence personalized reading for ${dateLabel}), love (0-100), career (0-100), health (0-100), finance (0-100), luckyNumber (1-9), luckyColor, dailyAdvice. Do NOT change the rashi or nakshatra.`;
    const aiResult = await generateStructuredJSON<PersonalDashboardData['horoscope']>(prompt, 'You are a Vedic astrologer. Return flat JSON only. No nesting, no markdown.');
    const mergedHoroscope = { ...horoscope, ...aiResult, moonRashi: rashiKey };
    res.json({ success: true, data: { snapshot, horoscope: mergedHoroscope, cosmicEnergy, transitAlerts } });
  } catch (error) {
    logger.warn({ error }, 'AI dashboard horoscope fallback');
    res.json({ success: true, data: { snapshot, horoscope, cosmicEnergy, transitAlerts } });
  }
}));
