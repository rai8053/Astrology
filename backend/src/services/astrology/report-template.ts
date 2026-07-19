import { RASHI_DATA, RASHI_KEYS, NAKSHATRA_LORDS } from './constants.js';
import { calculateBirthDetails } from './calculator.js';
import type { VedicProfile, AstroInsight, Remedy, TransitEvent } from '@shared/types/api.js';

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

function buildInsights(rashiKey: string, element: string, nakshatra: string, _nakshatraLord: string): AstroInsight[] {
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

function buildTransitTimeline(rashiKey: string, _nakshatra: string): TransitEvent[] {
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

export function buildFallbackProfile(name: string, birthDate: string, birthTime: string, birthPlace: string, timezoneOffsetMinutes = 0): VedicProfile {
  const details = calculateBirthDetails(birthDate, birthTime, timezoneOffsetMinutes);
  const { rashiKey, nakshatraIndex, nakshatraName, lagnaKey, ascendant, sun, moon, mercury, venus, mars, jupiter, saturn, rahu, ketu } = details;
  const rd = RASHI_DATA[rashiKey] || RASHI_DATA.Mesh;
  const ld = RASHI_DATA[lagnaKey] || RASHI_DATA.Mesh;
  const ni = getNakshatraInfo(nakshatraName);
  const element = rd.element;
  const rashiLord = rd.lord;
  const sunKey = RASHI_KEYS[sun.signIndex];
  const mercKey = RASHI_KEYS[mercury.signIndex];
  const venKey = RASHI_KEYS[venus.signIndex];
  const marsKey = RASHI_KEYS[mars.signIndex];
  const jupKey = RASHI_KEYS[jupiter.signIndex];
  const satKey = RASHI_KEYS[saturn.signIndex];
  const sunLd = RASHI_DATA[sunKey]?.lord || 'Sun';
  const mercLd = RASHI_DATA[mercKey]?.lord || 'Mercury';
  const venLd = RASHI_DATA[venKey]?.lord || 'Venus';
  const marsLd = RASHI_DATA[marsKey]?.lord || 'Mars';
  const jupLd = RASHI_DATA[jupKey]?.lord || 'Jupiter';
  const satLd = RASHI_DATA[satKey]?.lord || 'Saturn';
  const sns = (p: { navamsaSignIndex: number }) => RASHI_KEYS[p.navamsaSignIndex] || 'Unknown';
  function calcNavamsaHouse(ascNav: number, planetNav: number): number {
    const diff = (planetNav - ascNav + 12) % 12;
    return diff + 1;
  }
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
      { planet: 'Lagna (Ascendant)', sign: lagnaKey, house: 1, description: `${ld.translation} rising at ${ascendant.degrees}°${ascendant.minutes}' — shapes your outward personality and life approach with ${ld.element.toLowerCase()} energy.`, navamsaSign: sns(ascendant), navamsaHouse: 1 },
      { planet: 'Moon (Chandra)', sign: rashiKey, house: moon.house, description: `Moon in ${rashiKey} at ${moon.degrees}°${moon.minutes}' in house ${moon.house} — governs emotions, intuition, and your inner world. Ruled by ${rashiLord}.`, navamsaSign: sns(moon), navamsaHouse: calcNavamsaHouse(ascendant.navamsaSignIndex, moon.navamsaSignIndex) },
      { planet: 'Sun (Surya)', sign: sunKey, house: sun.house, description: `Sun in ${sunKey} at ${sun.degrees}°${sun.minutes}' in house ${sun.house} — represents your core identity, vitality, and life purpose. Ruled by ${sunLd}.`, navamsaSign: sns(sun), navamsaHouse: calcNavamsaHouse(ascendant.navamsaSignIndex, sun.navamsaSignIndex) },
      { planet: 'Mercury (Budha)', sign: mercKey, house: mercury.house, description: `Mercury in ${mercKey} at ${mercury.degrees}°${mercury.minutes}' in house ${mercury.house} — governs communication, intellect, and analytical abilities. Ruled by ${mercLd}.`, navamsaSign: sns(mercury), navamsaHouse: calcNavamsaHouse(ascendant.navamsaSignIndex, mercury.navamsaSignIndex) },
      { planet: 'Venus (Shukra)', sign: venKey, house: venus.house, description: `Venus in ${venKey} at ${venus.degrees}°${venus.minutes}' in house ${venus.house} — blesses creativity, romance, and artistic expression. Ruled by ${venLd}.`, navamsaSign: sns(venus), navamsaHouse: calcNavamsaHouse(ascendant.navamsaSignIndex, venus.navamsaSignIndex) },
      { planet: 'Jupiter (Guru)', sign: jupKey, house: jupiter.house, description: `Jupiter in ${jupKey} at ${jupiter.degrees}°${jupiter.minutes}' in house ${jupiter.house} — expands wisdom, fortune, and spiritual growth. Ruled by ${jupLd}.`, navamsaSign: sns(jupiter), navamsaHouse: calcNavamsaHouse(ascendant.navamsaSignIndex, jupiter.navamsaSignIndex) },
      { planet: 'Saturn (Shani)', sign: satKey, house: saturn.house, description: `Saturn in ${satKey} at ${saturn.degrees}°${saturn.minutes}' in house ${saturn.house} — brings discipline, life lessons, and karmic responsibility. Ruled by ${satLd}.`, navamsaSign: sns(saturn), navamsaHouse: calcNavamsaHouse(ascendant.navamsaSignIndex, saturn.navamsaSignIndex) },
      { planet: 'Mars (Mangal)', sign: marsKey, house: mars.house, description: `Mars in ${marsKey} at ${mars.degrees}°${mars.minutes}' in house ${mars.house} — drives ambition, energy, and assertiveness. Ruled by ${marsLd}.`, navamsaSign: sns(mars), navamsaHouse: calcNavamsaHouse(ascendant.navamsaSignIndex, mars.navamsaSignIndex) },
    ],
    insights: buildInsights(rashiKey, element, nakshatraName, NAKSHATRA_LORDS[nakshatraIndex % 9]),
    remedies: buildRemedies(element, rashiLord, rashiKey),
    transitTimeline: buildTransitTimeline(rashiKey, nakshatraName),
  };
}

interface DetailedTemplateInput {
  rashiKey: string;
  rd: { translation: string; element: string; lord: string; dosha: string };
  ld: { translation: string; element: string; lord: string };
  lagnaKey: string;
  nakshatraName: string;
  nakshatraLord: string;
  rashiLord: string;
  luckyColor: string;
  gemstone: string;
  luckyNum: number;
  ni: { deity: string; symbol: string; meaning: string };
  et: { career: string; relationship: string };
  rashiLordName: string;
}

export function buildDetailedHtml(input: DetailedTemplateInput): string {
  const { rashiKey, rd, ld, lagnaKey, nakshatraName, nakshatraLord, rashiLord, luckyColor, gemstone, luckyNum, ni, et, rashiLordName } = input;
  return `<div class="detailed-report">
  <h3>Birth Chart Overview</h3>
  <p>Your celestial blueprint reveals a profound connection between your Moon sign in <strong>${rashiKey} (${rd.translation})</strong>, your Ascendant in <strong>${lagnaKey} (${ld.translation})</strong>, and your birth star <strong>${nakshatraName}</strong> ruled by <strong>${nakshatraLord}</strong>. This sacred combination creates a unique soul signature that shapes your entire life journey.</p>
  <p>The ${rd.element.toLowerCase()} element of your Moon sign infuses you with ${rd.element === 'Fire' ? 'passion, courage, and an indomitable spirit' : rd.element === 'Earth' ? 'stability, patience, and practical wisdom' : rd.element === 'Air' ? 'intellect, adaptability, and brilliant communication' : 'intuition, compassion, and emotional depth'}. Your Ascendant in ${lagnaKey} adds ${ld.element.toLowerCase()} qualities to your outward personality, creating a dynamic interplay of energies.</p>
  <p>Your Nakshatra, ${nakshatraName}, is symbolized by ${ni.symbol} and dedicated to ${ni.deity}. This indicates ${ni.meaning.toLowerCase()} Those born under this star carry a special karmic mission and possess innate gifts that unfold over time.</p>
  <p>The ruling planet of your chart is <strong>${rashiLord}</strong>, which bestows upon you ${rd.element === 'Fire' ? 'leadership qualities and dynamic energy' : rd.element === 'Earth' ? 'groundedness and material stability' : rd.element === 'Air' ? 'sharp intellect and communication skills' : 'emotional intelligence and creative vision'}. Understanding these core placements is the first step toward aligning with your highest potential.</p>

  <h3>Planetary Analysis</h3>
  <h4>Ascendant (Lagna) — ${lagnaKey}</h4>
  <p>Your Ascendant in ${lagnaKey} (${ld.translation}) represents the mask you wear in the world and your natural approach to life. With ${ld.element.toLowerCase()} qualities, you project ${ld.element === 'Fire' ? 'confidence and enthusiasm' : ld.element === 'Earth' ? 'reliability and composure' : ld.element === 'Air' ? 'intellectual curiosity and charm' : 'sensitivity and nurturing warmth'}. This sign colors your first impressions and physical appearance.</p>
  <h4>Moon (Chandra) — ${rashiKey}</h4>
  <p>The Moon in ${rashiKey} (${rd.translation}) governs your emotional nature, intuition, and subconscious mind. Ruled by ${rashiLord}, your emotional responses are ${rd.element === 'Fire' ? 'passionate and immediate' : rd.element === 'Earth' ? 'steady and pragmatic' : rd.element === 'Air' ? 'intellectual and analytical' : 'deep and flowing'}. This placement reveals how you find emotional security and what nurtures your soul.</p>
  <h4>Sun (Surya)</h4>
  <p>The Sun represents your core identity, vitality, and life purpose. Its placement in your chart illuminates where you shine brightest and what gives you a sense of meaning. Your Sun's energy is filtered through the ${rd.element.toLowerCase()} element, encouraging you to express your authentic self ${rd.element === 'Fire' ? 'boldly and courageously' : rd.element === 'Earth' ? 'steadily and reliably' : rd.element === 'Air' ? 'intellectually and creatively' : 'empathetically and artistically'}.</p>
  <h4>Mercury (Budha)</h4>
  <p>Mercury governs your communication style, intellect, and analytical abilities. This placement influences how you process information, express ideas, and connect with others mentally. Your communication style is ${rd.element === 'Fire' ? 'direct and passionate' : rd.element === 'Earth' ? 'practical and methodical' : rd.element === 'Air' ? 'quick and versatile' : 'intuitive and diplomatic'}, allowing you to convey your thoughts with clarity and purpose.</p>
  <h4>Venus (Shukra)</h4>
  <p>Venus blesses your relationships, creative expression, and sense of beauty. This placement reveals what you value, how you love, and what brings you pleasure. In your chart, Venus encourages you to ${rd.element === 'Fire' ? 'pursue love with passion and creativity' : rd.element === 'Earth' ? 'build stable and lasting relationships' : rd.element === 'Air' ? 'seek intellectual and social connection' : 'express love through deep emotional bonding'}.</p>
  <h4>Jupiter (Guru)</h4>
  <p>Jupiter expands your wisdom, fortune, and spiritual growth. This benefic planet indicates where you experience luck, abundance, and higher learning. Jupiter's influence in your chart blesses you with ${rd.element === 'Fire' ? 'optimism and adventurous spirit' : rd.element === 'Earth' ? 'practical wisdom and financial growth' : rd.element === 'Air' ? 'philosophical insight and teaching ability' : 'spiritual depth and compassion'}.</p>
  <h4>Saturn (Shani)</h4>
  <p>Saturn brings discipline, life lessons, and karmic responsibility. This planet teaches through challenges and rewards patience and perseverance. Saturn's placement encourages you to ${rd.element === 'Fire' ? 'channel your energy with discipline and focus' : rd.element === 'Earth' ? 'build your foundations methodically and patiently' : rd.element === 'Air' ? 'develop mental discipline and structured thinking' : 'cultivate emotional maturity and boundaries'}.</p>
  <h4>Mars (Mangal)</h4>
  <p>Mars drives your ambition, energy, and assertiveness. This fiery planet shows how you pursue your goals and assert yourself. Mars in your chart gives you ${rd.element === 'Fire' ? 'tremendous drive and courageous action' : rd.element === 'Earth' ? 'determined persistence and practical ambition' : rd.element === 'Air' ? 'strategic thinking and decisive communication' : 'passionate conviction and protective instincts'}.</p>

  <h3>House-by-House Analysis</h3>
  <h4>First House — Self and Identity</h4>
  <p>The first house represents your self-image, physical appearance, and approach to life. With your Ascendant in ${lagnaKey}, you naturally project ${ld.element.toLowerCase()} energy. This house governs new beginnings and how you initiate experiences.</p>
  <h4>Second House — Wealth and Values</h4>
  <p>The second house governs finances, speech, and personal values. Your ${rd.element.toLowerCase()} element influences your approach to money and what you truly value in life. This house also rules family traditions and your sense of self-worth.</p>
  <h4>Third House — Communication and Courage</h4>
  <p>The third house represents communication, siblings, short journeys, and courage. Your Mercury placement influences how you express yourself and connect with your immediate environment. This house also rules your hands and artistic skills.</p>
  <h4>Fourth House — Home and Emotions</h4>
  <p>The fourth house governs home, mother, emotional foundations, and inner peace. Your Moon sign ${rashiKey} provides deep insight into where you feel most secure and nurtured. This house represents the roots from which you grow.</p>
  <h4>Fifth House — Creativity and Children</h4>
  <p>The fifth house rules creative expression, romance, children, and intellectual pursuits. Your Venus placement blesses this area with artistic talent and the capacity for joyful self-expression. This is the house of pure creative potential.</p>
  <h4>Sixth House — Service and Health</h4>
  <p>The sixth house governs daily work, health, service, and overcoming obstacles. Your Mars placement influences your approach to challenges and your vitality. This house teaches through discipline and service to others.</p>
  <h4>Seventh House — Partnerships</h4>
  <p>The seventh house rules marriage, business partnerships, and significant relationships. This house reveals what you seek in a partner and how you relate one-on-one. Balance and harmony are the key themes here.</p>
  <h4>Eighth House — Transformation</h4>
  <p>The eighth house governs transformation, shared resources, occult knowledge, and spiritual depth. This house holds the keys to profound personal change and metaphysical understanding. It represents the cycle of death and rebirth.</p>
  <h4>Ninth House — Higher Knowledge</h4>
  <p>The ninth house rules higher education, philosophy, spirituality, and long journeys. Your Jupiter placement expands this area, bringing opportunities for growth through learning and travel. This is the house of dharma and higher purpose.</p>
  <h4>Tenth House — Career and Reputation</h4>
  <p>The tenth house governs career, public standing, and life achievements. This house shows your professional path and how you contribute to society. Your ${rashiLord} influence suggests ${rd.element === 'Fire' ? 'leadership roles and creative entrepreneurship' : rd.element === 'Earth' ? 'stable careers in finance, management, or service' : rd.element === 'Air' ? 'careers in communication, technology, or teaching' : 'healing arts, creative fields, or spiritual guidance'}.</p>
  <h4>Eleventh House — Gains and Community</h4>
  <p>The eleventh house rules income, friendships, community involvement, and the fulfillment of desires. This house represents your social network and the support you receive from others.</p>
  <h4>Twelfth House — Spirituality and Liberation</h4>
  <p>The twelfth house governs solitude, spirituality, foreign lands, and liberation (moksha). This house represents the unseen realms and the completion of karmic cycles. It is the house of spiritual surrender and transcendence.</p>

  <h3>Career & Finance</h3>
  <p>Your ${rd.element.toLowerCase()} element strongly influences your professional path. ${et.career} The ${rashiLord} influence suggests that you will find success in careers that align with your natural ${rd.element.toLowerCase()} strengths.</p>
  <p>Financial growth comes steadily through ${rd.element === 'Fire' ? 'bold initiatives and leadership roles' : rd.element === 'Earth' ? 'patient accumulation and wise investments' : rd.element === 'Air' ? 'intellectual property and communication-based ventures' : 'intuitive decisions and creative enterprises'}. Your lucky number <strong>${luckyNum}</strong> and lucky color <strong>${luckyColor}</strong> can be incorporated into your professional life for enhanced success.</p>
  <p>The ideal time for major career decisions is when Jupiter transits favorable houses in your chart, typically bringing opportunities for advancement, recognition, and professional growth.</p>

  <h3>Relationships & Love</h3>
  <p>In relationships, your ${rashiKey} Moon sign makes you ${et.relationship.toLowerCase()} Your Venus placement influences how you express love and what you find attractive in a partner.</p>
  <p>Your ${rd.element.toLowerCase()} element suggests that you are most compatible with ${rd.element === 'Fire' ? 'Air and Fire signs that match your enthusiasm' : rd.element === 'Earth' ? 'Water and Earth signs that share your stability' : rd.element === 'Air' ? 'Air and Fire signs that stimulate your intellect' : 'Earth and Water signs that honor your depth'}. Communication is the foundation of lasting relationships, and your Mercury placement encourages ${rd.element === 'Fire' ? 'honest and direct expression' : rd.element === 'Earth' ? 'practical and meaningful conversations' : rd.element === 'Air' ? 'intellectual and stimulating dialogue' : 'heartfelt and empathetic communication'}.</p>
  <p>The Nakshatra ${nakshatraName}, governed by ${ni.deity}, adds a layer of depth to your relationship patterns, indicating ${ni.meaning.toLowerCase()} Understanding these celestial influences helps you navigate partnerships with greater awareness and compassion.</p>

  <h3>Health & Wellness</h3>
  <p>Your health is governed by the ${rd.dosha} dosha, which requires ${rd.dosha === 'Vata' ? 'warming, grounding, and nourishing practices' : rd.dosha === 'Pitta' ? 'cooling, calming, and moderation-focused routines' : 'warming, stimulating, and energizing activities'}. ${ELEMENT_TRAITS[rd.element]?.health || ''}</p>
  <p>Recommended practices for your ${rd.element.toLowerCase()} constitution include: ${rd.element === 'Fire' ? 'cooling pranayama (Sheetali), moonlight meditation, and moderate exercise' : rd.element === 'Earth' ? 'grounding yoga, nature walks, and digestive wellness' : rd.element === 'Air' ? 'warm oil massage (Abhyanga), regular meal times, and gentle movement' : 'emotional release practices, water therapies, and creative expression'}.</p>
  <p>Dietary recommendations focus on ${rd.dosha === 'Vata' ? 'warm, cooked, oily foods with sweet, sour, and salty tastes' : rd.dosha === 'Pitta' ? 'cool, fresh foods with sweet, bitter, and astringent tastes' : 'light, warm, dry foods with pungent, bitter, and astringent tastes'}. Regular sleep patterns and stress management are essential for maintaining optimal health.</p>

  <h3>Spiritual Path</h3>
  <p>Your spiritual journey is deeply influenced by your Moon sign in ${rashiKey} and your Nakshatra ${nakshatraName}. The ${ni.deity} energy guides your spiritual evolution, encouraging you to ${ni.meaning.toLowerCase()}</p>
  <p>${rd.element === 'Fire' ? 'Your spiritual path is one of active devotion (Bhakti Yoga), fire ceremonies (Homa), and service (Seva). You connect with the divine through passionate dedication and courageous action.' : rd.element === 'Earth' ? 'Your spiritual path is grounded in practice (Hatha Yoga), service (Karma Yoga), and devotion to tradition. You build your spiritual foundation steadily and reliably.' : rd.element === 'Air' ? 'Your spiritual path is intellectual (Jnana Yoga), centered on study, contemplation, and philosophical inquiry. You seek truth through knowledge and understanding.' : 'Your spiritual path is devotional (Bhakti Yoga), creative, and emotionally transformative. You connect with the divine through love, art, and compassionate service.'}</p>
  <p>Regular meditation, especially during the ${nakshatraName} Nakshatra days, amplifies your spiritual connection and supports your inner growth.</p>

  <h3>Remedies & Recommendations</h3>
  <h4>Gemstone Therapy</h4>
  <p>Wear <strong>${gemstone}</strong> set in a ring or pendant, preferably on a ${rd.element === 'Fire' ? 'Sunday' : rd.element === 'Earth' ? 'Thursday' : rd.element === 'Air' ? 'Wednesday' : 'Monday'} after performing the appropriate purification rituals. The gemstone amplifies your natural strengths and balances planetary energies.</p>
  <h4>Mantra Chanting</h4>
  <p>Chant <strong>"Om ${rashiLordName.toUpperCase()}YA NAMAH"</strong> 108 times daily, preferably during the morning hours (Brahma Muhurta). This mantra strengthens your ruling planet and brings peace and prosperity.</p>
  <h4>Lucky Colors</h4>
  <p>Incorporate <strong>${luckyColor}</strong> into your daily wardrobe and environment. These colors harmonize with your cosmic energy and enhance your luck in important endeavors.</p>
  <h4>Dosha-Balancing Practices</h4>
  <p>Practice ${rd.element === 'Fire' ? 'cooling pranayama (Sheetali) and moonlight meditation' : rd.element === 'Earth' ? 'grounding yoga (Tadasana, Vrikshasana) and earthing walks' : rd.element === 'Air' ? 'warm oil self-massage (Abhyanga) and regular daily routines' : 'gentle flowing movements (Yin Yoga) and emotional journaling'} to balance your ${rd.element.toLowerCase()} energy and maintain harmony.</p>
  <h4>Charity and Service</h4>
  <p>Donate ${rd.element === 'Fire' ? 'red lentils, ghee, or warm blankets on Sundays' : rd.element === 'Earth' ? 'yellow clothes, wheat, or gold on Thursdays' : rd.element === 'Air' ? 'green vegetables, sesame seeds, or pulses on Wednesdays' : 'white rice, milk, or silver on Mondays'} to strengthen benefic planetary influences and accumulate positive karma.</p>
  <h4>Planetary Peace</h4>
  <p>Observe fasts on ${rashiKey === 'Mesh' || rashiKey === 'Simha' || rashiKey === 'Dhanu' ? 'Tuesdays and Sundays' : rashiKey === 'Vrishabh' || rashiKey === 'Kanya' || rashiKey === 'Makar' ? 'Fridays and Saturdays' : rashiKey === 'Mithun' || rashiKey === 'Tula' || rashiKey === 'Kumbha' ? 'Wednesdays and Saturdays' : 'Mondays and Thursdays'} for planetary peace and spiritual purification. Light a ghee lamp daily in the morning and offer prayers to your Ishta Devata.</p>

  <h3>Current Transits & Upcoming Periods</h3>
  <p>The current celestial transits bring important opportunities for growth and transformation. The Moon transits ${rashiKey} every month, activating your emotional and intuitive centers. During these periods, pay attention to your dreams and gut feelings.</p>
  <p>Mercury's transits highlight periods of enhanced communication, learning, and mental clarity — ideal for important conversations, negotiations, and intellectual pursuits.</p>
  <p>Saturn's influence encourages patience, discipline, and long-term planning. While challenging, these periods build character and lasting success through persistent effort.</p>
  <p>Jupiter's transits bring expansion, optimism, and opportunities for growth. These are auspicious times for starting new ventures, pursuing education, and deepening spiritual practice.</p>
  <p>Overall, the next few months offer significant potential for ${rd.element === 'Fire' ? 'career advancement and creative projects' : rd.element === 'Earth' ? 'financial stability and relationship deepening' : rd.element === 'Air' ? 'intellectual growth and social connections' : 'emotional healing and spiritual development'}. Trust in the cosmic timing of your life journey.</p>
</div>`;
}

export { TITHI_SIGNIFICANCE, ELEMENT_TRAITS, NAKSHATRA_MEANINGS, getNakshatraInfo, buildInsights, buildRemedies, buildTransitTimeline };
