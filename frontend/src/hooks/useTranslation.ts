import { useI18nStore } from '@/lib/i18n/store';
import { translations } from '@/lib/i18n/translations';
import en from '@/lib/i18n/en.json';
import hi from '@/lib/i18n/hi.json';
import bn from '@/lib/i18n/bn.json';

const jsonDicts: Record<string, Record<string, string>> = { en, hi, bn };
const legacyDicts = translations as Record<string, Record<string, string>>;

export function useTranslation() {
  const language = useI18nStore((s) => s.language);
  const setLanguage = useI18nStore((s) => s.setLanguage);

  function t(key: string, replacements?: Record<string, string | number>): string {
    let text = jsonDicts[language]?.[key];
    if (text === undefined || text === key) text = legacyDicts[language]?.[key];
    if (text === undefined || text === key) text = jsonDicts.en?.[key];
    if (text === undefined || text === key) text = legacyDicts.en?.[key];
    if (text === undefined) text = key;
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  }

  return { t, language, setLanguage };
}
