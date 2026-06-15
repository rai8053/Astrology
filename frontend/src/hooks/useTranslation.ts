import { useI18nStore } from '@/lib/i18n/store';
import en from '@/lib/i18n/en.json';
import hi from '@/lib/i18n/hi.json';
import bn from '@/lib/i18n/bn.json';

const dictionaries: Record<string, Record<string, string>> = { en, hi, bn };

export function useTranslation() {
  const language = useI18nStore((s) => s.language);
  const setLanguage = useI18nStore((s) => s.setLanguage);

  function t(key: string, replacements?: Record<string, string | number>): string {
    const dict = dictionaries[language] ?? dictionaries.en;
    let text = dict?.[key] ?? dictionaries.en?.[key] ?? key;
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  }

  return { t, language, setLanguage };
}
