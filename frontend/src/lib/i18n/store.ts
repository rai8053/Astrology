import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from './translations';
import { detectBrowserLanguage } from './translations';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const STORAGE_KEY = 'soma-language';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: detectBrowserLanguage(),
      setLanguage: (language) => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        set({ language });
        const { user } = useAuthStore.getState();
        if (user) {
          api.patch('/api/user/profile', { language }).catch(() => {});
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ language: state.language }),
    },
  ),
);
