import { describe, it, expect } from 'vitest';
import { getAstrologyLabel, getNakshatraName, ZODIAC, PLANETS, ELEMENTS } from '@/lib/astrologyLocales';

describe('astrologyLocales', () => {
  describe('getAstrologyLabel', () => {
    it('returns English zodiac name by default', () => {
      expect(getAstrologyLabel('zodiac', 'Mesh')).toBe('Aries');
      expect(getAstrologyLabel('zodiac', 'Meen')).toBe('Pisces');
    });

    it('returns Hindi zodiac name when language is hi', () => {
      expect(getAstrologyLabel('zodiac', 'Mesh', 'hi')).toBe('मेष');
      expect(getAstrologyLabel('zodiac', 'Meen', 'hi')).toBe('मीन');
    });

    it('returns Bengali zodiac name when language is bn', () => {
      expect(getAstrologyLabel('zodiac', 'Mesh', 'bn')).toBe('মেষ');
    });

    it('returns Spanish zodiac name when language is es', () => {
      expect(getAstrologyLabel('zodiac', 'Mesh', 'es')).toBe('Aries');
      expect(getAstrologyLabel('zodiac', 'Meen', 'es')).toBe('Piscis');
    });

    it('returns English planet names', () => {
      expect(getAstrologyLabel('planets', 'Sun')).toBe('Sun');
      expect(getAstrologyLabel('planets', 'Moon')).toBe('Moon');
      expect(getAstrologyLabel('planets', 'Rahu')).toBe('Rahu');
    });

    it('returns Hindi planet names', () => {
      expect(getAstrologyLabel('planets', 'Sun', 'hi')).toBe('सूर्य');
      expect(getAstrologyLabel('planets', 'Moon', 'hi')).toBe('चंद्र');
    });

    it('returns English element names', () => {
      expect(getAstrologyLabel('elements', 'Fire')).toBe('Fire');
      expect(getAstrologyLabel('elements', 'Water')).toBe('Water');
    });

    it('returns Hindi element names', () => {
      expect(getAstrologyLabel('elements', 'Fire', 'hi')).toBe('अग्नि');
      expect(getAstrologyLabel('elements', 'Water', 'hi')).toBe('जल');
    });

    it('returns energy level labels', () => {
      expect(getAstrologyLabel('energyLevels', 'Excellent')).toBe('Excellent');
      expect(getAstrologyLabel('energyLevels', 'Excellent', 'hi')).toBe('उत्कृष्ट');
      expect(getAstrologyLabel('energyLevels', 'Moderate', 'es')).toBe('Moderado');
    });

    it('returns impact labels', () => {
      expect(getAstrologyLabel('impacts', 'Positive')).toBe('Positive');
      expect(getAstrologyLabel('impacts', 'Positive', 'hi')).toBe('सकारात्मक');
      expect(getAstrologyLabel('impacts', 'Neutral', 'fr')).toBe('Neutre');
    });

    it('returns score categories', () => {
      expect(getAstrologyLabel('scoreCategories', 'Love')).toBe('Love');
      expect(getAstrologyLabel('scoreCategories', 'Love', 'hi')).toBe('प्रेम');
    });

    it('returns moon phase names', () => {
      expect(getAstrologyLabel('moonPhases', 'NewMoon')).toBe('New Moon');
      expect(getAstrologyLabel('moonPhases', 'FullMoon')).toBe('Full Moon');
      expect(getAstrologyLabel('moonPhases', 'FullMoon', 'hi')).toBe('पूर्णिमा');
    });

    it('returns dosha names', () => {
      expect(getAstrologyLabel('doshas', 'Vata')).toBe('Vata');
      expect(getAstrologyLabel('doshas', 'Vata', 'hi')).toBe('वात');
    });

    it('returns paksha names', () => {
      expect(getAstrologyLabel('paksha', 'ShuklaPaksha')).toBe('Shukla Paksha');
      expect(getAstrologyLabel('paksha', 'ShuklaPaksha', 'hi')).toBe('शुक्ल पक्ष');
    });

    it('falls back to English for unsupported language', () => {
      expect(getAstrologyLabel('zodiac', 'Mesh', 'xx')).toBe('Aries');
    });

    it('falls back to key for unknown key', () => {
      expect(getAstrologyLabel('zodiac', 'UnknownRashi')).toBe('UnknownRashi');
    });
  });

  describe('getNakshatraName', () => {
    it('returns English nakshatra name', () => {
      expect(getNakshatraName('Ashwini')).toBe('Ashwini');
    });

    it('returns Hindi nakshatra name', () => {
      expect(getNakshatraName('Ashwini', 'hi')).toBe('अश्विनी');
    });

    it('returns Bengali nakshatra name', () => {
      expect(getNakshatraName('Ashwini', 'bn')).toBe('অশ্বিনী');
    });
  });

  describe('dictionary completeness', () => {
    it('all 10 languages have 12 zodiac signs', () => {
      const langs = ['en', 'hi', 'bn', 'es', 'pt', 'fr', 'de', 'ar', 'ja', 'zh'];
      const keys = ['Mesh', 'Vrishabh', 'Mithun', 'Kark', 'Simha', 'Kanya', 'Tula', 'Vrishchik', 'Dhanu', 'Makar', 'Kumbha', 'Meen'];
      for (const lang of langs) {
        for (const key of keys) {
          expect(ZODIAC[lang]![key]).toBeTruthy();
        }
      }
    });

    it('all 10 languages have 9 planets', () => {
      const langs = ['en', 'hi', 'bn', 'es', 'pt', 'fr', 'de', 'ar', 'ja', 'zh'];
      const keys = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
      for (const lang of langs) {
        for (const key of keys) {
          expect(PLANETS[lang]![key]).toBeTruthy();
        }
      }
    });

    it('all 10 languages have 4 elements', () => {
      const langs = ['en', 'hi', 'bn', 'es', 'pt', 'fr', 'de', 'ar', 'ja', 'zh'];
      const keys = ['Fire', 'Earth', 'Air', 'Water'];
      for (const lang of langs) {
        for (const key of keys) {
          expect(ELEMENTS[lang]![key]).toBeTruthy();
        }
      }
    });
  });
});
