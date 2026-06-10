import { useI18nStore } from './store';
import { translations } from './translations';
import type { TranslationKey } from './translations';

export { useI18nStore };
export type { TranslationKey, Language } from './translations';

export function useTranslation() {
  const language = useI18nStore((state) => state.language);

  const t = (key: TranslationKey, replacements?: Record<string, string | number>): string => {
    const lang = translations[language as keyof typeof translations]
      ?? translations['en'];
    let text = (lang as Record<string, string>)[key]
      ?? (translations['en'] as Record<string, string>)[key]
      ?? key;
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  };

  return { t, language };
}
