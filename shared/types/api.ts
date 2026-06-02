export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface BirthDetails {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
}

export interface PlanetaryPlacement {
  planet: string;
  sign: string;
  house: number;
  description: string;
}

export interface AstroInsight {
  title: string;
  content: string;
  score: number;
  color: string;
}

export interface Remedy {
  type: string;
  title: string;
  description: string;
  icon: string;
}

export interface TransitEvent {
  date: string;
  title: string;
  description: string;
  impact: 'positive' | 'neutral' | 'challenging';
}

export interface VedicProfile {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  rashi: string;
  westernSign: string;
  nakshatra: string;
  nakshatraLord: string;
  lagna: string;
  element: string;
  rashiLord: string;
  doshaDominance: string;
  generalReading: string;
  strengths: string[];
  weaknesses: string[];
  luckyNumber: number;
  luckyColor: string;
  gemstone: string;
  planetaryPlacements: PlanetaryPlacement[];
  insights: AstroInsight[];
  remedies: Remedy[];
  transitTimeline: TransitEvent[];
  detailedReport?: string;
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
  energyLevel: number;
  remedy: string;
}

export interface CompatibilityInput {
  partnerA: BirthDetails;
  partnerB: BirthDetails;
}

export interface GunKoota {
  kootaName: string;
  description: string;
  pointsScored: number;
  maxPoints: number;
}

export interface CompatibilityResult {
  partnerA_Rashi: string;
  partnerB_Rashi: string;
  partnerA_Nakshatra: string;
  partnerB_Nakshatra: string;
  compatibilityScore: number;
  gunsMatched: number;
  gunAnalysis: GunKoota[];
  verdict: string;
  strengths: string;
  challenges: string;
  remedy: string;
  detailedAnalysis: string;
}

export interface AstrologySnapshot {
  ascendant: string;
  moonRashi: string;
  nakshatra: string;
  nakshatraLord: string;
  rashiLord: string;
  element: string;
  doshaDominance: string;
}

export interface PersonalHoroscope {
  moonRashi: string;
  prediction: string;
  love: number;
  career: number;
  health: number;
  finance: number;
  luckyNumber: number;
  luckyColor: string;
  dailyAdvice: string;
}

export interface CosmicEnergy {
  score: number;
  level: string;
  description: string;
}

export interface TransitAlert {
  date: string;
  event: string;
  description: string;
  impact: 'positive' | 'neutral' | 'challenging';
}

export interface PersonalDashboardData {
  snapshot: AstrologySnapshot;
  horoscope: PersonalHoroscope;
  cosmicEnergy: CosmicEnergy;
  transitAlerts: TransitAlert[];
}

export interface MoonPhaseInfo {
  date: string;
  phaseName: string;
  illumination: number;
  age: number;
  distance: number;
  tithiNum: number;
  tithiName: string;
  tithiType: 'Shukla Paksha' | 'Krishna Paksha';
  tithiSignificance: string;
  nextPurnima: string;
  nextAmavasya: string;
}
