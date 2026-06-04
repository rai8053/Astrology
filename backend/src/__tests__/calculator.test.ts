import { describe, it, expect } from 'vitest';
import { calculateBirthDetails, getMoonPhase, calculateRashiIndex, calculateNakshatraIndex, calculateLagnaIndex, calculateVimshottariDasha, getCurrentDasha } from '../services/astrology/calculator.js';
import { calculateEphemeris } from '../services/astrology/ephemeris.js';
import { RASHI_KEYS, NAKSHATRAS } from '../services/astrology/constants.js';

describe('calculateRashiIndex', () => {
  it('returns a number between 0 and 11', () => {
    const idx = calculateRashiIndex('1998-06-15', '08:30');
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThanOrEqual(11);
  });

  it('maps to a valid RASHI key', () => {
    const idx = calculateRashiIndex('1998-06-15', '08:30');
    expect(RASHI_KEYS[idx]).toBeDefined();
  });
});

describe('calculateNakshatraIndex', () => {
  it('returns a number between 0 and 26', () => {
    const idx = calculateNakshatraIndex('1998-06-15', '08:30');
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThanOrEqual(26);
  });

  it('maps to a valid Nakshatra name', () => {
    const idx = calculateNakshatraIndex('1998-06-15', '08:30');
    expect(NAKSHATRAS[idx]).toBeDefined();
  });
});

describe('calculateLagnaIndex', () => {
  it('returns a number between 0 and 11', () => {
    expect(calculateLagnaIndex('2024-01-01', '00:00')).toBeGreaterThanOrEqual(0);
    expect(calculateLagnaIndex('2024-01-01', '23:59')).toBeLessThanOrEqual(11);
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

  it('returns deterministic results for same input', () => {
    const a = calculateBirthDetails('1998-06-15', '08:30');
    const b = calculateBirthDetails('1998-06-15', '08:30');
    expect(a.rashiKey).toBe(b.rashiKey);
    expect(a.nakshatraName).toBe(b.nakshatraName);
    expect(a.lagnaKey).toBe(b.lagnaKey);
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

describe('Vimshottari Dasha', () => {
  it('returns 9 or 10 periods covering ~120 years', () => {
    const dashas = calculateVimshottariDasha(0, 0, new Date('1990-01-01'));
    expect(dashas.length).toBeGreaterThanOrEqual(9);
    expect(dashas.length).toBeLessThanOrEqual(10);
    const totalYears = dashas.reduce((s, d) => s + d.years, 0);
    expect(totalYears).toBeCloseTo(120, 0);
  });

  it('has valid planet names for each period', () => {
    const dashas = calculateVimshottariDasha(0, 5, new Date('1990-06-15'));
    for (const d of dashas) {
      expect(d.planet).toBeTruthy();
      expect(d.startDate).toBeInstanceOf(Date);
      expect(d.endDate).toBeInstanceOf(Date);
      expect(d.endDate.getTime()).toBeGreaterThan(d.startDate.getTime());
    }
  });

  it('periods are sequential without gaps', () => {
    const dashas = calculateVimshottariDasha(3, 10, new Date('2000-01-01'));
    for (let i = 1; i < dashas.length; i++) {
      expect(dashas[i].startDate.getTime()).toBe(dashas[i - 1].endDate.getTime());
    }
  });

  it('deterministic for same input', () => {
    const a = calculateVimshottariDasha(14, 7.5, new Date('1985-03-20'));
    const b = calculateVimshottariDasha(14, 7.5, new Date('1985-03-20'));
    expect(a.length).toBe(b.length);
    expect(a[0].planet).toBe(b[0].planet);
    expect(a[0].startDate.getTime()).toBe(b[0].startDate.getTime());
  });
});

describe('getCurrentDasha', () => {
  it('returns null for empty dasha list', () => {
    expect(getCurrentDasha([])).toBeNull();
  });

  it('returns dasha and antardasha for current date', () => {
    const dashas = calculateVimshottariDasha(5, 3, new Date('2000-01-01'));
    const current = getCurrentDasha(dashas);
    expect(current).not.toBeNull();
    if (current) {
      expect(current.dasha).toBeDefined();
      expect(current.antardasha).toBeDefined();
      expect(current.antardasha.planet).toBeTruthy();
      expect(current.antardasha.startDate).toBeInstanceOf(Date);
      expect(current.antardasha.endDate).toBeInstanceOf(Date);
    }
  });

  it('antardasha end is within mahadasha', () => {
    const dashas = calculateVimshottariDasha(10, 12, new Date('1995-06-01'));
    const current = getCurrentDasha(dashas);
    if (current) {
      expect(current.antardasha.endDate.getTime()).toBeLessThanOrEqual(current.dasha.endDate.getTime());
      expect(current.antardasha.startDate.getTime()).toBeGreaterThanOrEqual(current.dasha.startDate.getTime());
    }
  });
});

describe('Rahu / Ketu in ephemeris', () => {
  it('returns rahu and ketu positions', () => {
    const eph = calculateEphemeris('2000-01-01', '12:00');
    expect(eph.rahu).toBeDefined();
    expect(eph.ketu).toBeDefined();
    expect(eph.rahu.longitude).toBeGreaterThanOrEqual(0);
    expect(eph.rahu.longitude).toBeLessThan(360);
    expect(eph.ketu.longitude).toBeGreaterThanOrEqual(0);
    expect(eph.ketu.longitude).toBeLessThan(360);
  });

  it('rahu and ketu are 180° apart', () => {
    const eph = calculateEphemeris('2023-06-15', '12:00');
    const diff = Math.abs(eph.rahu.longitude - eph.ketu.longitude);
    expect(diff).toBeGreaterThan(175);
    expect(diff).toBeLessThan(185);
  });

  it('rahu/ketu are included in birth details', () => {
    const details = calculateBirthDetails('1995-11-20', '14:30');
    expect(details.rahu).toBeDefined();
    expect(details.ketu).toBeDefined();
    expect(details.rahu.signIndex).toBeGreaterThanOrEqual(0);
    expect(details.rahu.signIndex).toBeLessThanOrEqual(11);
  });
});

describe('Navamsa (D9) positions', () => {
  it('each planet has navamsaSignIndex set', () => {
    const eph = calculateEphemeris('1998-06-15', '08:30');
    const bodies = [eph.sun, eph.moon, eph.mercury, eph.venus, eph.mars, eph.jupiter, eph.saturn, eph.rahu, eph.ketu, eph.ascendant];
    for (const b of bodies) {
      expect(b.navamsaSignIndex).toBeGreaterThanOrEqual(0);
      expect(b.navamsaSignIndex).toBeLessThanOrEqual(11);
      expect(b.navamsaSignName).toBeTruthy();
    }
  });

  it('navamsa sign is deterministic', () => {
    const a = calculateEphemeris('2000-06-15', '12:00');
    const b = calculateEphemeris('2000-06-15', '12:00');
    expect(a.sun.navamsaSignIndex).toBe(b.sun.navamsaSignIndex);
  });

  it('navamsa is included in birth details planets', () => {
    const details = calculateBirthDetails('2005-03-10', '06:45');
    expect(details.sun.navamsaSignIndex).toBeGreaterThanOrEqual(0);
    expect(details.moon.navamsaSignName).toBeTruthy();
  });
});
