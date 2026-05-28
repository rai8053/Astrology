export const RASHI_DATA: Record<string, { translation: string; lord: string; element: string; dosha: string }> = {
  Mesh: { translation: 'Aries', lord: 'Mars / Mangal', element: 'Fire', dosha: 'Pitta' },
  Vrishabh: { translation: 'Taurus', lord: 'Venus / Shukra', element: 'Earth', dosha: 'Kapha' },
  Mithun: { translation: 'Gemini', lord: 'Mercury / Budha', element: 'Air', dosha: 'Vata' },
  Kark: { translation: 'Cancer', lord: 'Moon / Chandra', element: 'Water', dosha: 'Kapha' },
  Simha: { translation: 'Leo', lord: 'Sun / Surya', element: 'Fire', dosha: 'Pitta' },
  Kanya: { translation: 'Virgo', lord: 'Mercury / Budha', element: 'Earth', dosha: 'Vata' },
  Tula: { translation: 'Libra', lord: 'Venus / Shukra', element: 'Air', dosha: 'Vata-Pitta' },
  Vrishchik: { translation: 'Scorpio', lord: 'Mars / Mangal', element: 'Water', dosha: 'Kapha' },
  Dhanu: { translation: 'Sagittarius', lord: 'Jupiter / Guru', element: 'Fire', dosha: 'Pitta' },
  Makar: { translation: 'Capricorn', lord: 'Saturn / Shani', element: 'Earth', dosha: 'Vata' },
  Kumbha: { translation: 'Aquarius', lord: 'Saturn / Shani', element: 'Air', dosha: 'Vata' },
  Meen: { translation: 'Pisces', lord: 'Jupiter / Guru', element: 'Water', dosha: 'Kapha-Vata' },
};

export const RASHI_KEYS = Object.keys(RASHI_DATA);

export const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati',
];

export const NAKSHATRA_LORDS = [
  'Sun / Surya', 'Moon / Chandra', 'Mars / Mangal', 'Mercury / Budha',
  'Jupiter / Guru', 'Venus / Shukra', 'Saturn / Shani', 'Rahu', 'Ketu',
];

export const REF_NEW_MOON = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
export const SYNODIC_MONTH = 29.530588853;
