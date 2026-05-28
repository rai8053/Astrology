import { describe, it, expect } from 'vitest';
import { RASHI_DATA, RASHI_KEYS, NAKSHATRAS, NAKSHATRA_LORDS, SYNODIC_MONTH } from '../services/astrology/constants.js';

describe('astrology constants', () => {
  it('RASHI_DATA has 12 entries', () => {
    expect(Object.keys(RASHI_DATA)).toHaveLength(12);
  });

  it('RASHI_KEYS match RASHI_DATA keys', () => {
    expect(RASHI_KEYS).toEqual(Object.keys(RASHI_DATA));
  });

  it('each Rashi has required fields', () => {
    for (const [key, rashi] of Object.entries(RASHI_DATA)) {
      expect(rashi.translation).toBeDefined();
      expect(rashi.lord).toBeDefined();
      expect(rashi.element).toBeDefined();
      expect(rashi.dosha).toBeDefined();
      expect(['Fire', 'Earth', 'Air', 'Water']).toContain(rashi.element);
    }
  });

  it('NAKSHATRAS has 27 entries', () => {
    expect(NAKSHATRAS).toHaveLength(27);
  });

  it('NAKSHATRA_LORDS has 9 entries', () => {
    expect(NAKSHATRA_LORDS).toHaveLength(9);
  });

  it('SYNODIC_MONTH is approximately 29.53 days', () => {
    expect(SYNODIC_MONTH).toBeCloseTo(29.53, 1);
  });
});
