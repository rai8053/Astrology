import { create } from 'zustand';
import type { Language } from './translations';
import { detectBrowserLanguage } from './translations';

const STORAGE_KEY = 'soma-language';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Language;
    if (['en', 'hi', 'bn', 'es', 'pt', 'fr', 'de', 'ja', 'zh', 'ar'].includes(stored)) {
      return stored;
    }
  } catch { /* ignore */ }
  return detectBrowserLanguage();
}

function applyLanguage(language: Language) {
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
}

const initial = getInitialLanguage();
applyLanguage(initial);

export const useI18nStore = create<I18nState>((set) => ({
  language: initial,
  setLanguage: (language) => {
    try { localStorage.setItem(STORAGE_KEY, language); } catch { /* ignore */ }
    applyLanguage(language);
    set({ language });
  },
}));
