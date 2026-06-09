import { useI18nStore } from './store';
import { t as translate, type TranslationKey } from './translations';

export function useT() {
  const language = useI18nStore((s) => s.language);
  const t = (key: TranslationKey, replacements?: Record<string, string | number>) => {
    let text = translate(key, language);
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  };
  return { t, language };
}
