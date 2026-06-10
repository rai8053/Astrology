import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Direction = 'ltr' | 'rtl';
const RTL = ['ar', 'ur', 'he', 'fa'];

interface I18nStore {
  language: string;
  direction: Direction;
  setLanguage: (lang: string) => void;
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set) => ({
      language: 'en',
      direction: 'ltr',
      setLanguage: (language) => {
        const direction: Direction = RTL.includes(language) ? 'rtl' : 'ltr';
        document.documentElement.setAttribute('dir', direction);
        document.documentElement.setAttribute('lang', language);
        set({ language, direction });
      },
    }),
    { name: 'soma-language' },
  ),
);
