import { useI18nStore } from '@/lib/i18n/store';
import { getAstrologyLabel, getNakshatraName } from '@/lib/astrologyLocales';

export function useAstrology() {
  const language = useI18nStore((s) => s.language);

  function getZodiacName(sanskritKey: string): string {
    return getAstrologyLabel('zodiac', sanskritKey, language);
  }

  function getPlanetName(englishKey: string): string {
    return getAstrologyLabel('planets', englishKey, language);
  }

  function getElementName(englishKey: string): string {
    return getAstrologyLabel('elements', englishKey, language);
  }

  function getNakshatra(sanskritKey: string): string {
    return getNakshatraName(sanskritKey, language);
  }

  function getDoshaName(englishKey: string): string {
    return getAstrologyLabel('doshas', englishKey, language);
  }

  function getEnergyLabel(englishKey: string): string {
    return getAstrologyLabel('energyLevels', englishKey, language);
  }

  function getImpactLabel(englishKey: string): string {
    return getAstrologyLabel('impacts', englishKey, language);
  }

  function getScoreCategory(englishKey: string): string {
    return getAstrologyLabel('scoreCategories', englishKey, language);
  }

  function getMoonPhase(englishKey: string): string {
    return getAstrologyLabel('moonPhases', englishKey, language);
  }

  function getPaksha(englishKey: string): string {
    return getAstrologyLabel('paksha', englishKey, language);
  }

  return {
    getZodiacName, getPlanetName, getElementName, getNakshatra,
    getDoshaName, getEnergyLabel, getImpactLabel, getScoreCategory,
    getMoonPhase, getPaksha,
    language,
  };
}
