import { useCallback, useMemo } from 'react';
import { useI18nStore } from '@/lib/i18n/store';
import { translations } from '@/lib/i18n/translations';
import en from '@/lib/i18n/en.json';
import hi from '@/lib/i18n/hi.json';
import bn from '@/lib/i18n/bn.json';
import es from '@/lib/i18n/es.json';
import pt from '@/lib/i18n/pt.json';
import fr from '@/lib/i18n/fr.json';
import de from '@/lib/i18n/de.json';
import ar from '@/lib/i18n/ar.json';
import ja from '@/lib/i18n/ja.json';
import zh from '@/lib/i18n/zh.json';
import { translateText } from '@/services/translationService';

const jsonDicts: Record<string, Record<string, string>> = {
  en, hi, bn, es, pt, fr, de, ar, ja, zh,
};
const legacyDicts = translations as Record<string, Record<string, string>>;

export function useTranslation() {
  const language = useI18nStore((s) => s.language);
  const setLanguage = useI18nStore((s) => s.setLanguage);

  const t = useCallback(
    (key: string, replacements?: Record<string, string | number>): string => {
      let text = jsonDicts[language]?.[key];
      if (text === undefined || text === key) text = legacyDicts[language]?.[key];
      if (text === undefined || text === key) text = jsonDicts.en?.[key];
      if (text === undefined || text === key) text = legacyDicts.en?.[key];

      if (text === undefined || text === key) {
        if (language !== 'en') {
          const cached = translateText(text || key, language);
          text = cached || key;
        } else {
          text = key;
        }
      }

      if (replacements) {
        for (const [k, v] of Object.entries(replacements)) {
          text = text.replace(`{${k}}`, String(v));
        }
      }
      return text;
    },
    [language],
  );

  const dir = useMemo(() => (language === 'ar' ? 'rtl' : 'ltr'), [language]);

  return { t, language, setLanguage, dir };
}
