import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export const RASHIS = [
  { key: 'Mesh', en: 'Aries', symbol: '♈', element: 'Fire' },
  { key: 'Vrishabh', en: 'Taurus', symbol: '♉', element: 'Earth' },
  { key: 'Mithun', en: 'Gemini', symbol: '♊', element: 'Air' },
  { key: 'Kark', en: 'Cancer', symbol: '♋', element: 'Water' },
  { key: 'Simha', en: 'Leo', symbol: '♌', element: 'Fire' },
  { key: 'Kanya', en: 'Virgo', symbol: '♍', element: 'Earth' },
  { key: 'Tula', en: 'Libra', symbol: '♎', element: 'Air' },
  { key: 'Vrishchik', en: 'Scorpio', symbol: '♏', element: 'Water' },
  { key: 'Dhanu', en: 'Sagittarius', symbol: '♐', element: 'Fire' },
  { key: 'Makar', en: 'Capricorn', symbol: '♑', element: 'Earth' },
  { key: 'Kumbha', en: 'Aquarius', symbol: '♒', element: 'Air' },
  { key: 'Meen', en: 'Pisces', symbol: '♓', element: 'Water' },
];
