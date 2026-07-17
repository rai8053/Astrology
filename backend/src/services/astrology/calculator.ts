import { calculateEphemeris, getRashiKey, getElement, getDosha, getLord, getTranslation } from './ephemeris.js';
import { RASHI_DATA as CONST_RASHI_DATA, NAKSHATRA_LORDS as CONST_NAKSHATRA_LORDS } from './constants.js';

interface DashaPeriod {
  planet: string;
  startDate: Date;
  endDate: Date;
  years: number;
}

const DASHA_SEQUENCE = ['Ketu', 'Venus/Shukra', 'Sun/Surya', 'Moon/Chandra', 'Mars/Mangal', 'Rahu', 'Jupiter/Guru', 'Saturn/Shani', 'Mercury/Budha'];
const DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];

// Nakshatra index → Dasha lord index (0=Ketu, 1=Venus, 2=Sun, 3=Moon, 4=Mars, 5=Rahu, 6=Jupiter, 7=Saturn, 8=Mercury)
// 27 Nakshatras cycle through 9 lords in order
function nakshatraToDashaLordIndex(nakshatraIndex: number): number {
  return nakshatraIndex % 9;
}

export function calculateVimshottariDasha(moonNakshatraIndex: number, moonLongitude: number, birthDate: Date): DashaPeriod[] {
  const NAKSHATRA_DEG = 13.3333333333; // 13°20' per Nakshatra
  const nakshatraLordIdx = nakshatraToDashaLordIndex(moonNakshatraIndex);
  const degreesInNakshatra = moonLongitude % NAKSHATRA_DEG;
  const portionRemaining = (NAKSHATRA_DEG - degreesInNakshatra) / NAKSHATRA_DEG;

  const result: DashaPeriod[] = [];
  let currentDate = new Date(birthDate);
  const lordYears = DASHA_YEARS[nakshatraLordIdx];
  const firstDashaYears = lordYears * portionRemaining;
  const firstDashaEnd = new Date(currentDate.getTime() + firstDashaYears * 365.25 * 24 * 60 * 60 * 1000);

  // If first Dasha is very short (< 1 month), it may have already ended
  if (firstDashaYears > 0.08) {
    result.push({
      planet: DASHA_SEQUENCE[nakshatraLordIdx],
      startDate: new Date(currentDate),
      endDate: firstDashaEnd,
      years: Math.round(firstDashaYears * 100) / 100,
    });
    currentDate = firstDashaEnd;
  }

  // Subsequent Dashas (remaining 8 of 9 lords)
  for (let i = 1; i < 9; i++) {
    const idx = (nakshatraLordIdx + i) % 9;
    const years = DASHA_YEARS[idx];
    const endDate = new Date(currentDate.getTime() + years * 365.25 * 24 * 60 * 60 * 1000);
    result.push({
      planet: DASHA_SEQUENCE[idx],
      startDate: new Date(currentDate),
      endDate,
      years,
    });
    currentDate = endDate;
  }

  return result;
}

export function getCurrentDasha(dashas: DashaPeriod[], now: Date = new Date()): { dasha: DashaPeriod; antardasha: DashaPeriod } | null {
  const current = dashas.find(d => now >= d.startDate && now < d.endDate);
  if (!current) return null;

  // Calculate Antardasha within the current Mahadasha
  const totalDays = (current.endDate.getTime() - current.startDate.getTime()) / (24 * 60 * 60 * 1000);
  const elapsedDays = (now.getTime() - current.startDate.getTime()) / (24 * 60 * 60 * 1000);
  const elapsedFraction = elapsedDays / totalDays;

  // Antardasha sequence follows same order as Dasha, within the Mahadasha
  const mahadashaLordIdx = DASHA_SEQUENCE.indexOf(current.planet);
  let accumulated = 0;
  for (let i = 0; i < 9; i++) {
    const adIdx = (mahadashaLordIdx + i) % 9;
    const adFraction = DASHA_YEARS[adIdx] / 120;
    accumulated += adFraction;
    if (elapsedFraction < accumulated) {
      const adStartFraction = accumulated - adFraction;
      const adStartDate = new Date(current.startDate.getTime() + adStartFraction * totalDays * 24 * 60 * 60 * 1000);
      const adEndDate = new Date(current.startDate.getTime() + accumulated * totalDays * 24 * 60 * 60 * 1000);
      return {
        dasha: current,
        antardasha: { planet: DASHA_SEQUENCE[adIdx], startDate: adStartDate, endDate: adEndDate, years: DASHA_YEARS[adIdx] },
      };
    }
  }

  return { dasha: current, antardasha: current };
}

function getUtcDate(dateStr: string, timeStr: string, timezoneOffsetMinutes = 0): Date {
  const local = new Date(`${dateStr}T${timeStr}:00`);
  return new Date(local.getTime() - timezoneOffsetMinutes * 60 * 1000);
}

export function calculateRashiIndex(dateStr: string, timeStr: string, timezoneOffsetMinutes = 0): number {
  const eph = calculateEphemeris(dateStr, timeStr, 19.0760, 72.8777, timezoneOffsetMinutes);
  return eph.moon.signIndex;
}

export function calculateNakshatraIndex(dateStr: string, timeStr: string, timezoneOffsetMinutes = 0): number {
  const eph = calculateEphemeris(dateStr, timeStr, 19.0760, 72.8777, timezoneOffsetMinutes);
  return eph.moon.nakshatraIndex;
}

export function calculateLagnaIndex(dateStr: string, timeStr: string, timezoneOffsetMinutes = 0): number {
  const eph = calculateEphemeris(dateStr, timeStr, 19.0760, 72.8777, timezoneOffsetMinutes);
  return eph.ascendant.signIndex;
}

export function calculateBirthDetails(dateStr: string, timeStr: string, timezoneOffsetMinutes = 0, lat = 19.0760, lon = 72.8777) {
  const eph = calculateEphemeris(dateStr, timeStr, lat, lon, timezoneOffsetMinutes);
  const rashiIndex = eph.moon.signIndex;
  const nakshatraIndex = eph.moon.nakshatraIndex;
  const lagnaIndex = eph.ascendant.signIndex;

  const rashiKey = getRashiKey(rashiIndex);
  const lagnaKey = getRashiKey(lagnaIndex);

  const birthDate = getUtcDate(dateStr, timeStr, timezoneOffsetMinutes);
  const dashas = calculateVimshottariDasha(nakshatraIndex, eph.moon.longitude, birthDate);
  const currentDasha = getCurrentDasha(dashas);

  return {
    dateObj: birthDate,
    rashiIndex,
    rashiKey,
    nakshatraIndex,
    nakshatraName: eph.moon.nakshatraName,
    lagnaIndex,
    lagnaKey,
    tithi: eph.tithi,
    yoga: eph.yoga,
    karana: eph.karana,
    ascendant: eph.ascendant,
    moonNakshatraLord: eph.moonNakshatraLord,
    lagnaLord: eph.lagnaLord,
    sun: eph.sun,
    moon: eph.moon,
    mercury: eph.mercury,
    venus: eph.venus,
    mars: eph.mars,
    jupiter: eph.jupiter,
    saturn: eph.saturn,
    rahu: eph.rahu,
    ketu: eph.ketu,
    dashas,
    currentDasha,
  };
}

export function getMoonPhase(targetDate: Date) {
  const dateStr = targetDate.toISOString().split('T')[0];
  const timeStr = '12:00';
  const eph = calculateEphemeris(dateStr, timeStr, 19.0760, 72.8777, 0);
  const age = eph.tithi.index * 0.965; // approximate days into lunar cycle
  const illumination = 50 * (1 - Math.cos(2 * Math.PI * (eph.tithi.index / 30)));

  let phaseName = '';
  const phaseValue = eph.tithi.index / 30;
  if (phaseValue < 0.03 || phaseValue > 0.97) phaseName = 'New Moon (Amavasya)';
  else if (phaseValue >= 0.03 && phaseValue < 0.22) phaseName = 'Waxing Crescent';
  else if (phaseValue >= 0.22 && phaseValue < 0.28) phaseName = 'First Quarter';
  else if (phaseValue >= 0.28 && phaseValue < 0.47) phaseName = 'Waxing Gibbous';
  else if (phaseValue >= 0.47 && phaseValue < 0.53) phaseName = 'Full Moon (Purnima)';
  else if (phaseValue >= 0.53 && phaseValue < 0.72) phaseName = 'Waning Gibbous';
  else if (phaseValue >= 0.72 && phaseValue < 0.78) phaseName = 'Third Quarter';
  else phaseName = 'Waning Crescent';

  const tithiNum = eph.tithi.index;
  const daysToPurnima = (15 - tithiNum) * 0.965;
  const daysToAmavasya = tithiNum <= 15
    ? (30 - tithiNum) * 0.965
    : (30 - tithiNum + 15) * 0.965;
  const purnimaDate = new Date(targetDate.getTime() + daysToPurnima * 24 * 60 * 60 * 1000);
  const amavasyaDate = new Date(targetDate.getTime() + daysToAmavasya * 24 * 60 * 60 * 1000);

  return {
    age: Math.round(age * 10) / 10,
    illumination: Math.round(illumination),
    phaseName,
    phaseValue,
    tithiNum,
    tithiName: eph.tithi.name,
    tithiType: eph.tithi.paksha as 'Shukla Paksha' | 'Krishna Paksha',
    distance: Math.round(356400 + (1 - Math.sin(phaseValue * Math.PI * 2)) * 50000),
    nextPurnima: purnimaDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
    nextAmavasya: amavasyaDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
  };
}

export { CONST_RASHI_DATA as RASHI_DATA, CONST_NAKSHATRA_LORDS as NAKSHATRA_LORDS };
export { getElement, getDosha, getLord, getTranslation, getRashiKey };
