import { useI18nStore } from './store';
import { translations } from './translations';
export type { TranslationKey, Language } from './translations';
export { useI18nStore };

export function useTranslation() {
  const language = useI18nStore((state) => state.language);

  function t(key: string, replacements?: Record<string, string | number>): string {
    const dict = translations as Record<string, Record<string, string>>;
    const langDict = dict[language] ?? dict['en'];
    let text = langDict?.[key] ?? dict['en']?.[key] ?? key;
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  }

  return { t, language };
}
