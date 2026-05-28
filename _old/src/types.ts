export interface BirthDetails {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  birthPlace: string;
}

export interface VedicProfile {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  rashi: string;       // Moon Sign (e.g. Mesh, Vrishabh)
  westernSign: string;  // Western sign approximation
  nakshatra: string;   // Constellation
  nakshatraLord: string; // Ruling deity/planet
  lagna: string;       // Ascendant
  element: string;     // Fire, Earth, Air, Water
  rashiLord: string;   // Ruling planet of Moon sign
  doshaDominance: string; // Vata, Pitta, Kapha
  generalReading: string; // Dynamic Gemini reading overview
  strengths: string[];
  weaknesses: string[];
  luckyNumber: number;
  luckyColor: string;
  gemstone: string;
  planetaryPlacements: {
    planet: string;
    sign: string;
    house: number;
    description: string;
  }[];
}

export interface DailyHoroscope {
  rashi: string;
  englishName: string;
  general: string;
  career: string;
  finance: string;
  love: string;
  health: string;
  luckyNumber: number;
  luckyColor: string;
  luckyTime: string;
  energyLevel: number; // 1-100
  remedy: string;     // Vedic remedy/mantra
}

export interface CompatibilityInput {
  partnerA: BirthDetails;
  partnerB: BirthDetails;
}

export interface CompatibilityResult {
  partnerA_Rashi: string;
  partnerB_Rashi: string;
  partnerA_Nakshatra: string;
  partnerB_Nakshatra: string;
  compatibilityScore: number; // 0-100 or Gun Milan out of 36
  gunsMatched?: number;       // out of 36
  gunAnalysis?: {
    kootaName: string;
    description: string;
    pointsScored: number;
    maxPoints: number;
  }[];
  verdict: string; // High, Medium, Low, etc.
  strengths: string;
  challenges: string;
  remedy: string;
  detailedAnalysis: string; // Markdown detailed breakdown
}

export interface MoonPhaseInfo {
  date: string;
  phaseName: string;         // e.g., Waxing Gibbous
  illumination: number;      // 0-100 %
  age: number;               // days
  distance: number;          // km
  tithiNum: number;          // 1-30
  tithiName: string;         // Padyami, Dwitiya... Purnima, Amavasya
  tithiType: 'Shukla Paksha' | 'Krishna Paksha'; // Bright / Dark fortnight
  tithiSignificance: string; // Spiritual significance/ritual
  nextPurnima: string;       // date string
  nextAmavasya: string;      // date string
}
