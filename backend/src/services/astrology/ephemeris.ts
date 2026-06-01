// Pure JavaScript Vedic Ephemeris Engine
// All calculations are deterministic — same input always produces identical results
// Based on astronomical algorithms (Jean Meeus, VSOP87 simplified)

export interface PlanetaryPosition {
  longitude: number;
  signIndex: number;
  signName: string;
  nakshatraIndex: number;
  nakshatraName: string;
  house: number;
  degrees: number;
  minutes: number;
}

export interface EphemerisResult {
  sun: PlanetaryPosition;
  moon: PlanetaryPosition;
  mercury: PlanetaryPosition;
  venus: PlanetaryPosition;
  mars: PlanetaryPosition;
  jupiter: PlanetaryPosition;
  saturn: PlanetaryPosition;
  ascendant: PlanetaryPosition;
  lagnaLord: string;
  moonNakshatraLord: string;
  tithi: { index: number; name: string; paksha: string };
  yoga: { index: number; name: string };
  karana: { index: number; name: string };
}

const RASHI_NAMES = [
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)',
  'Karka (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)',
  'Tula (Libra)', 'Vrishchika (Scorpio)', 'Dhanus (Sagittarius)',
  'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)',
];

const RASHI_KEYS = ['Mesh', 'Vrishabh', 'Mithun', 'Kark', 'Simha', 'Kanya', 'Tula', 'Vrishchik', 'Dhanu', 'Makar', 'Kumbha', 'Meen'];

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

const NAKSHATRA_LORDS = [
  'Ketu', 'Venus / Shukra', 'Sun / Surya', 'Moon / Chandra', 'Mars / Mangal', 'Rahu',
  'Jupiter / Guru', 'Saturn / Shani', 'Mercury / Budha',
];

const TITHI_NAMES = [
  'Prathama (Pratipat)', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashti', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Prathama (Pratipat)', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashti', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
];

const YOGA_NAMES = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
  'Sukarman', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva',
  'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
  'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
  'Brahma', 'Indra', 'Vaidhriti',
];

const KARANA_NAMES = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garija', 'Vanija',
  'Vishti (Bhadra)', 'Shakuni', 'Chatushpada', 'Naga',
  'Kimstughna',
];

const PLANET_LORDS: Record<string, string> = {
  Mesh: 'Mars / Mangal', Vrishabh: 'Venus / Shukra', Mithun: 'Mercury / Budha',
  Kark: 'Moon / Chandra', Simha: 'Sun / Surya', Kanya: 'Mercury / Budha',
  Tula: 'Venus / Shukra', Vrishchik: 'Mars / Mangal', Dhanu: 'Jupiter / Guru',
  Makar: 'Saturn / Shani', Kumbha: 'Saturn / Shani', Meen: 'Jupiter / Guru',
};

const ELEMENTS: Record<string, string> = {
  Mesh: 'Fire', Simha: 'Fire', Dhanu: 'Fire',
  Vrishabh: 'Earth', Kanya: 'Earth', Makar: 'Earth',
  Mithun: 'Air', Tula: 'Air', Kumbha: 'Air',
  Kark: 'Water', Vrishchik: 'Water', Meen: 'Water',
};

const DOSHAS: Record<string, string> = {
  Mesh: 'Pitta', Vrishabh: 'Kapha', Mithun: 'Vata',
  Kark: 'Kapha', Simha: 'Pitta', Kanya: 'Vata',
  Tula: 'Vata', Vrishchik: 'Kapha', Dhanu: 'Pitta',
  Makar: 'Vata', Kumbha: 'Vata', Meen: 'Kapha',
};

// Julian Day Number
function julianDay(year: number, month: number, day: number): number {
  if (month <= 2) { year -= 1; month += 12; }
  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
}

function toJD(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
  return julianDay(y, m, d);
}

function normalizeAngle(angle: number): number {
  angle = angle % 360;
  return angle < 0 ? angle + 360 : angle;
}

// Mean longitude of the Moon (simplified VSOP87)
function moonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const Lp = normalizeAngle(218.3165 + 481267.8813 * T
    - 0.0017 * T * T
    + 0.000015 * T * T * T);
  const D = normalizeAngle(297.8502 + 445267.1114 * T - 0.0019 * T * T + 0.000002 * T * T * T);
  const M = normalizeAngle(357.5291 + 35999.0503 * T - 0.0002 * T * T);
  const Mp = normalizeAngle(134.9634 + 477198.8676 * T + 0.0084 * T * T + 0.000003 * T * T * T);
  const F = normalizeAngle(93.2720 + 483202.0175 * T - 0.0028 * T * T - 0.000002 * T * T * T);
  const A1 = normalizeAngle(119.75 + 131.849 * T);
  const A2 = normalizeAngle(53.09 + 479264.29 * T);
  const A3 = normalizeAngle(313.45 + 481266.484 * T);

  let lon = Lp
    + 6.2887 * Math.sin(Mp * Math.PI / 180)
    + 1.2740 * Math.sin((2 * D - Mp) * Math.PI / 180)
    + 0.6583 * Math.sin(2 * D * Math.PI / 180)
    + 0.2136 * Math.sin(2 * Mp * Math.PI / 180)
    - 0.1856 * Math.sin(M * Math.PI / 180) * 0.999
    - 0.1143 * Math.sin(2 * F * Math.PI / 180)
    + 0.0588 * Math.sin(2 * (D - Mp) * Math.PI / 180)
    + 0.0572 * Math.sin((2 * D - 2 * Mp) * Math.PI / 180)
    + 0.0533 * Math.sin((2 * D + Mp) * Math.PI / 180)
    + 0.0459 * Math.sin((2 * D - M - Mp) * Math.PI / 180)
    + 0.0410 * Math.sin((Mp - M) * Math.PI / 180)
    - 0.0348 * Math.sin(D * Math.PI / 180)
    - 0.0305 * Math.sin((Mp + M) * Math.PI / 180)
    + 0.0153 * Math.sin((2 * D - M - 2 * Mp) * Math.PI / 180)
    - 0.0125 * Math.sin(F * Math.PI / 180)
    + 0.0100 * Math.sin((2 * D - 2 * Mp - A1) * Math.PI / 180)
    + 0.0093 * Math.sin((2 * D + Mp - A1) * Math.PI / 180)
    + 0.0086 * Math.sin((2 * Mp + D) * Math.PI / 180)
    - 0.0079 * Math.sin((D - Mp) * Math.PI / 180)
    - 0.0068 * Math.sin((M - Mp) * Math.PI / 180)
    - 0.0054 * Math.sin((D + M) * Math.PI / 180)
    + 0.0048 * Math.sin(A2 * Math.PI / 180)
    - 0.0039 * Math.sin((2 * F + 2 * D) * Math.PI / 180)
    - 0.0037 * Math.sin((Mp - M + A3) * Math.PI / 180)
    + 0.0035 * Math.sin((D + 2 * Mp) * Math.PI / 180);
  return normalizeAngle(lon);
}

function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = normalizeAngle(280.4665 + 36000.7698 * T);
  const M = normalizeAngle(357.5291 + 35999.0503 * T - 0.0002 * T * T);
  const C = (1.9146 - 0.0048 * T) * Math.sin(M * Math.PI / 180)
    + 0.0200 * Math.sin(2 * M * Math.PI / 180)
    + 0.0003 * Math.sin(3 * M * Math.PI / 180);
  return normalizeAngle(L0 + C);
}

// Get position in zodiac (0-360 degrees) for simplified planetary positions
function getPlanetLongitude(jd: number, planet: 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn'): number {
  const T = (jd - 2451545.0) / 36525;
  let L: number;
  switch (planet) {
    case 'mercury':
      L = normalizeAngle(252.2509 + 149472.6746 * T);
      L += 7.0 * Math.sin((L - normalizeAngle(102.3 + 149472.7 * T)) * Math.PI / 180);
      break;
    case 'venus':
      L = normalizeAngle(181.9798 + 58517.8157 * T);
      L += 3.4 * Math.sin((L - normalizeAngle(87.5 + 58517.8 * T)) * Math.PI / 180);
      break;
    case 'mars':
      L = normalizeAngle(355.4530 + 19140.3027 * T);
      L += 10.7 * Math.sin((L - normalizeAngle(93.8 + 19140.3 * T)) * Math.PI / 180);
      break;
    case 'jupiter':
      L = normalizeAngle(34.3515 + 3034.9057 * T);
      L += 29.6 * Math.sin((L - normalizeAngle(124.8 + 3034.9 * T)) * Math.PI / 180);
      break;
    case 'saturn':
      L = normalizeAngle(50.0774 + 1222.1138 * T);
      L += 29.4 * Math.sin((L - normalizeAngle(166.5 + 1222.1 * T)) * Math.PI / 180);
      break;
  }
  return normalizeAngle(L);
}

function toRashiIndex(longitude: number): number {
  return Math.floor(longitude / 30) % 12;
}

function degreesInSign(longitude: number): number {
  return longitude % 30;
}

function toNakshatraIndex(longitude: number): number {
  return Math.floor(longitude / 13.3333333333) % 27;
}

function toNakshatraLordIndex(nakshatraIndex: number): number {
  return nakshatraIndex % 9;
}

function toPlanetaryPosition(longitude: number, house: number): PlanetaryPosition {
  const signIdx = toRashiIndex(longitude);
  const nakIdx = toNakshatraIndex(longitude);
  const deg = degreesInSign(longitude);
  const degWhole = Math.floor(deg);
  const min = Math.round((deg - degWhole) * 60);
  return {
    longitude,
    signIndex: signIdx,
    signName: RASHI_NAMES[signIdx],
    nakshatraIndex: nakIdx,
    nakshatraName: NAKSHATRA_NAMES[nakIdx],
    house,
    degrees: degWhole,
    minutes: min,
  };
}

function calculateAscendant(jd: number, latitude: number, longitude: number): number {
  const T = (jd - 2451545.0) / 36525;
  const lst = normalizeAngle(280.46061837 + 360.985647366 * (jd - 2451545.0) + longitude);
  const obliquity = normalizeAngle(23.439291 - 0.0130042 * T);
  const ramc = lst;
  const latRad = latitude * Math.PI / 180;
  const oblRad = obliquity * Math.PI / 180;
  const ramcRad = ramc * Math.PI / 180;

  const asc = Math.atan2(
    -Math.cos(ramcRad),
    Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(ramcRad)
  ) * 180 / Math.PI;

  return normalizeAngle(asc);
}

function calculateTithi(sunLon: number, moonLon: number): { index: number; name: string; paksha: string } {
  const diff = normalizeAngle(moonLon - sunLon);
  const index = Math.floor(diff / 12);
  const tithiIndex = Math.min(29, Math.max(0, index));
  const paksha = tithiIndex < 15 ? 'Shukla Paksha' : 'Krishna Paksha';
  return { index: tithiIndex + 1, name: TITHI_NAMES[tithiIndex], paksha };
}

function calculateYoga(sunLon: number, moonLon: number): { index: number; name: string } {
  const sum = normalizeAngle(sunLon + moonLon);
  const index = Math.floor(sum / 13.3333333333) % 27;
  return { index, name: YOGA_NAMES[index] || 'Unknown' };
}

function calculateKarana(sunLon: number, moonLon: number): { index: number; name: string } {
  const diff = normalizeAngle(moonLon - sunLon);
  const index = Math.round(diff / 6) % 11;
  return { index, name: KARANA_NAMES[index] || 'Unknown' };
}

export function calculateEphemeris(dateStr: string, timeStr: string, lat = 19.0760, lon = 72.8777): EphemerisResult {
  const dateObj = new Date(`${dateStr}T${timeStr}:00`);
  const jd = toJD(dateObj);

  const sunLon = sunLongitude(jd);
  const moonLon = moonLongitude(jd);
  const sunPos = toPlanetaryPosition(sunLon, 1);
  const moonPos = toPlanetaryPosition(moonLon, 7);

  const mercLon = getPlanetLongitude(jd, 'mercury');
  const venLon = getPlanetLongitude(jd, 'venus');
  const marsLon = getPlanetLongitude(jd, 'mars');
  const jupLon = getPlanetLongitude(jd, 'jupiter');
  const satLon = getPlanetLongitude(jd, 'saturn');

  // House assignment (simplified: 1=Ascendant sign, rest follow)
  const ascLon = calculateAscendant(jd, lat, lon);
  const ascSignIdx = toRashiIndex(ascLon);
  function getHouse(planetLon: number): number {
    const diff = normalizeAngle(planetLon - ascLon);
    return Math.floor(diff / 30) + 1;
  }

  const ascPos = toPlanetaryPosition(ascLon, 1);
  const mercPos = toPlanetaryPosition(mercLon, getHouse(mercLon));
  const venPos = toPlanetaryPosition(venLon, getHouse(venLon));
  const marsPos = toPlanetaryPosition(marsLon, getHouse(marsLon));
  const jupPos = toPlanetaryPosition(jupLon, getHouse(jupLon));
  const satPos = toPlanetaryPosition(satLon, getHouse(satLon));

  const moonRashiKey = RASHI_KEYS[moonPos.signIndex];
  const lagnaKey = RASHI_KEYS[ascPos.signIndex];

  const tithi = calculateTithi(sunLon, moonLon);
  const yoga = calculateYoga(sunLon, moonLon);
  const karana = calculateKarana(sunLon, moonLon);

  return {
    sun: sunPos, moon: moonPos,
    mercury: mercPos, venus: venPos, mars: marsPos,
    jupiter: jupPos, saturn: satPos,
    ascendant: ascPos,
    lagnaLord: PLANET_LORDS[lagnaKey] || 'Unknown',
    moonNakshatraLord: NAKSHATRA_LORDS[toNakshatraLordIndex(moonPos.nakshatraIndex)],
    tithi, yoga, karana,
  };
}

export { RASHI_NAMES, RASHI_KEYS, NAKSHATRA_NAMES, NAKSHATRA_LORDS, RASHI_KEYS as RASHI_KEYS_EPH };

export function getRashiKey(index: number): string { return RASHI_KEYS[index] || RASHI_KEYS[0]; }
export function getElement(rashiKey: string): string { return ELEMENTS[rashiKey] || 'Fire'; }
export function getDosha(rashiKey: string): string { return DOSHAS[rashiKey] || 'Pitta'; }
export function getLord(rashiKey: string): string { return PLANET_LORDS[rashiKey] || 'Unknown'; }
export function getTranslation(_rashiKey: string): string {
  const idx = RASHI_KEYS.indexOf(_rashiKey);
  return RASHI_NAMES[idx]?.split('(')[1]?.replace(')', '') || _rashiKey;
}
