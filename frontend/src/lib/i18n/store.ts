import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const RTL_LANGS = ['ar', 'ur', 'he', 'fa'];

interface I18nStore {
  language: string;
  setLanguage: (lang: string) => void;
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => {
        const dir = RTL_LANGS.includes(language) ? 'rtl' : 'ltr';
        document.documentElement.setAttribute('lang', language);
        document.documentElement.setAttribute('dir', dir);
        set({ language });
      },
    }),
    { name: 'soma-i18n' },
  ),
);
