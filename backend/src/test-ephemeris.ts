import { calculateBirthDetails } from './services/astrology/calculator.js';

const r1 = calculateBirthDetails('1995-06-15', '14:30');
const r2 = calculateBirthDetails('1995-06-15', '14:30');

console.log('Rashi:', r1.rashiKey);
console.log('Nakshatra:', r1.nakshatraName);
console.log('Lagna:', r1.lagnaKey);
console.log('Tithi:', JSON.stringify(r1.tithi));
console.log('Yoga:', JSON.stringify(r1.yoga));
console.log('Moon Nakshatra Lord:', r1.moonNakshatraLord);
console.log('Deterministic:', r1.rashiKey === r2.rashiKey && r1.nakshatraName === r2.nakshatraName);

// Verify different times give different results
const r3 = calculateBirthDetails('1995-06-15', '16:30');
console.log('Different time result:', r3.rashiKey);
console.log('Different time same rashi?', r1.rashiKey === r3.rashiKey);
console.log('Different time same lagna?', r1.lagnaKey === r3.lagnaKey);
