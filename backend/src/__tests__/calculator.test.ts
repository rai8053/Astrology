import { describe, it, expect } from 'vitest';
import { calculateBirthDetails, getMoonPhase, calculateRashiIndex, calculateNakshatraIndex, calculateLagnaIndex } from '../services/astrology/calculator.js';
import { RASHI_KEYS, NAKSHATRAS } from '../services/astrology/constants.js';

describe('calculateRashiIndex', () => {
  it('returns a number between 0 and 11', () => {
    const date = new Date('1998-06-15T08:30:00');
    const idx = calculateRashiIndex(date);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThanOrEqual(11);
  });

  it('maps to a valid RASHI key', () => {
    const date = new Date('1998-06-15T08:30:00');
    const idx = calculateRashiIndex(date);
    expect(RASHI_KEYS[idx]).toBeDefined();
  });
});

describe('calculateNakshatraIndex', () => {
  it('returns a number between 0 and 26', () => {
    const date = new Date('1998-06-15T08:30:00');
    const idx = calculateNakshatraIndex(date);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThanOrEqual(26);
  });

  it('maps to a valid Nakshatra name', () => {
    const date = new Date('1998-06-15T08:30:00');
    const idx = calculateNakshatraIndex(date);
    expect(NAKSHATRAS[idx]).toBeDefined();
  });
});

describe('calculateLagnaIndex', () => {
  it('returns a number between 0 and 11', () => {
    expect(calculateLagnaIndex(new Date('2024-01-01T00:00:00'))).toBeGreaterThanOrEqual(0);
    expect(calculateLagnaIndex(new Date('2024-01-01T23:59:00'))).toBeLessThanOrEqual(11);
  });
});

describe('calculateBirthDetails', () => {
  it('returns correct structure', () => {
    const result = calculateBirthDetails('1998-06-15', '08:30');
    expect(result).toHaveProperty('rashiKey');
    expect(result).toHaveProperty('nakshatraName');
    expect(result).toHaveProperty('lagnaKey');
    expect(result).toHaveProperty('dateObj');
    expect(RASHI_KEYS).toContain(result.rashiKey);
    expect(NAKSHATRAS).toContain(result.nakshatraName);
    expect(RASHI_KEYS).toContain(result.lagnaKey);
  });
});

describe('getMoonPhase', () => {
  it('returns valid moon phase structure', () => {
    const result = getMoonPhase(new Date());
    expect(result).toHaveProperty('phaseName');
    expect(result).toHaveProperty('illumination');
    expect(result).toHaveProperty('age');
    expect(result).toHaveProperty('distance');
    expect(result).toHaveProperty('tithiNum');
    expect(result).toHaveProperty('tithiName');
    expect(result).toHaveProperty('tithiType');
    expect(result).toHaveProperty('nextPurnima');
    expect(result).toHaveProperty('nextAmavasya');
  });

  it('illumination is between 0 and 100', () => {
    const result = getMoonPhase(new Date());
    expect(result.illumination).toBeGreaterThanOrEqual(0);
    expect(result.illumination).toBeLessThanOrEqual(100);
  });

  it('tithiNum is between 1 and 30', () => {
    const result = getMoonPhase(new Date());
    expect(result.tithiNum).toBeGreaterThanOrEqual(1);
    expect(result.tithiNum).toBeLessThanOrEqual(30);
  });

  it('tithiType is either Shukla or Krishna Paksha', () => {
    const result = getMoonPhase(new Date());
    expect(['Shukla Paksha', 'Krishna Paksha']).toContain(result.tithiType);
  });

  it('distance is positive', () => {
    const result = getMoonPhase(new Date());
    expect(result.distance).toBeGreaterThan(0);
  });

  it('returns valid dates for next events', () => {
    const result = getMoonPhase(new Date());
    expect(() => new Date(result.nextPurnima)).not.toThrow();
    expect(() => new Date(result.nextAmavasya)).not.toThrow();
  });
});
