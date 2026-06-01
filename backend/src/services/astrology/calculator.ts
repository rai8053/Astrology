import { calculateEphemeris, getRashiKey, getElement, getDosha, getLord, getTranslation } from './ephemeris.js';
import { RASHI_DATA as CONST_RASHI_DATA, NAKSHATRA_LORDS as CONST_NAKSHATRA_LORDS } from './constants.js';

export function calculateRashiIndex(dateStr: string, timeStr: string): number {
  const eph = calculateEphemeris(dateStr, timeStr);
  return eph.moon.signIndex;
}

export function calculateNakshatraIndex(dateStr: string, timeStr: string): number {
  const eph = calculateEphemeris(dateStr, timeStr);
  return eph.moon.nakshatraIndex;
}

export function calculateLagnaIndex(dateStr: string, timeStr: string): number {
  const eph = calculateEphemeris(dateStr, timeStr);
  return eph.ascendant.signIndex;
}

export function calculateBirthDetails(dateStr: string, timeStr: string) {
  const eph = calculateEphemeris(dateStr, timeStr);
  const rashiIndex = eph.moon.signIndex;
  const nakshatraIndex = eph.moon.nakshatraIndex;
  const lagnaIndex = eph.ascendant.signIndex;

  const rashiKey = getRashiKey(rashiIndex);
  const lagnaKey = getRashiKey(lagnaIndex);

  return {
    dateObj: new Date(`${dateStr}T${timeStr}:00`),
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
  };
}

export function getMoonPhase(targetDate: Date) {
  const dateStr = targetDate.toISOString().split('T')[0];
  const timeStr = '12:00';
  const eph = calculateEphemeris(dateStr, timeStr);
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
  const SYNODIC_MONTH = 29.53058867;
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
