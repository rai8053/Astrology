import { RASHI_KEYS, NAKSHATRAS, REF_NEW_MOON, SYNODIC_MONTH } from './constants.js';

export function calculateRashiIndex(dateObj: Date): number {
  return Math.floor((dateObj.getFullYear() + dateObj.getMonth() * 3 + dateObj.getDate() + dateObj.getHours()) % 12);
}

export function calculateNakshatraIndex(dateObj: Date): number {
  return Math.floor((dateObj.getFullYear() + dateObj.getDate() * 1.5 + dateObj.getHours() + dateObj.getMinutes()) % 27);
}

export function calculateLagnaIndex(dateObj: Date): number {
  return Math.floor((dateObj.getHours() + 1) / 2) % 12;
}

export function calculateBirthDetails(dateStr: string, timeStr: string) {
  const dateObj = new Date(`${dateStr}T${timeStr}:00`);
  const rashiIndex = calculateRashiIndex(dateObj);
  const nakshatraIndex = calculateNakshatraIndex(dateObj);
  const lagnaIndex = calculateLagnaIndex(dateObj);

  return {
    dateObj,
    rashiIndex,
    rashiKey: RASHI_KEYS[rashiIndex],
    nakshatraIndex,
    nakshatraName: NAKSHATRAS[nakshatraIndex],
    lagnaIndex,
    lagnaKey: RASHI_KEYS[lagnaIndex],
  };
}

export function getMoonPhase(targetDate: Date) {
  const diffTime = targetDate.getTime() - REF_NEW_MOON.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  let age = diffDays % SYNODIC_MONTH;
  if (age < 0) age += SYNODIC_MONTH;

  const phaseValue = age / SYNODIC_MONTH;
  const illumination = 50 * (1 - Math.cos(2 * Math.PI * phaseValue));

  let phaseName = '';
  if (phaseValue < 0.03 || phaseValue > 0.97) phaseName = 'New Moon (Amavasya)';
  else if (phaseValue >= 0.03 && phaseValue < 0.22) phaseName = 'Waxing Crescent';
  else if (phaseValue >= 0.22 && phaseValue < 0.28) phaseName = 'First Quarter';
  else if (phaseValue >= 0.28 && phaseValue < 0.47) phaseName = 'Waxing Gibbous';
  else if (phaseValue >= 0.47 && phaseValue < 0.53) phaseName = 'Full Moon (Purnima)';
  else if (phaseValue >= 0.53 && phaseValue < 0.72) phaseName = 'Waning Gibbous';
  else if (phaseValue >= 0.72 && phaseValue < 0.78) phaseName = 'Third Quarter';
  else phaseName = 'Waning Crescent';

  const tithiNum = Math.floor(phaseValue * 30) + 1;
  const tithiType = tithiNum <= 15 ? 'Shukla Paksha' as const : 'Krishna Paksha' as const;

  const tithiNames = [
    'Prathama (Pratipat)', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashti', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
    'Prathama (Pratipat)', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashti', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
  ];

  const tithiName = tithiNames[Math.min(29, Math.max(0, tithiNum - 1))] || 'Unknown';

  const daysToPurnima = 14.765 - age < 0 ? 14.765 - age + SYNODIC_MONTH : 14.765 - age;
  const purnimaDate = new Date(targetDate.getTime() + daysToPurnima * 24 * 60 * 60 * 1000);
  const daysToAmavasya = SYNODIC_MONTH - age < 0 ? SYNODIC_MONTH - age + SYNODIC_MONTH : SYNODIC_MONTH - age;
  const amavasyaDate = new Date(targetDate.getTime() + daysToAmavasya * 24 * 60 * 60 * 1000);

  return {
    age: Math.round(age * 10) / 10,
    illumination: Math.round(illumination),
    phaseName,
    phaseValue,
    tithiNum,
    tithiName,
    tithiType,
    distance: Math.round(356400 + (1 - Math.sin(phaseValue * Math.PI * 2)) * 50000),
    nextPurnima: purnimaDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
    nextAmavasya: amavasyaDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
  };
}
