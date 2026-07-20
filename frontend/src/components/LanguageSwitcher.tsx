import { useState } from 'react';
import { useI18nStore, useTranslation } from '@/lib/i18n';

const LANGUAGES = [
  { code: 'en', name: 'English',    short: 'EN' },
  { code: 'hi', name: 'हिन्दी',      short: 'HI' },
  { code: 'bn', name: 'বাংলা',       short: 'BN' },
  { code: 'es', name: 'Español',    short: 'ES' },
  { code: 'pt', name: 'Português',  short: 'PT' },
  { code: 'fr', name: 'Français',   short: 'FR' },
  { code: 'de', name: 'Deutsch',    short: 'DE' },
  { code: 'ar', name: 'العربية',    short: 'AR' },
  { code: 'ja', name: '日本語',      short: 'JA' },
  { code: 'zh', name: '中文',        short: 'ZH' },
] as const;

function LangBadge({ short, active }: { short: string; active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-[26px] h-[18px] rounded-[3px] text-[10px] font-semibold tracking-wide flex-shrink-0 ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground'
      }`}
    >
      {short}
    </span>
  );
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18nStore();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('common.changeLanguage') || 'Change language'}
        aria-expanded={open}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-foreground hover:bg-muted transition-colors border border-transparent hover:border-border"
      >
        <LangBadge short={current.short} active />
        <span className="hidden sm:inline text-sm">{current.short}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path
            d="M2 4l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute top-full right-0 mt-[6px] z-50 min-w-[180px] bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-80 overflow-y-auto"
            role="listbox"
            aria-label={t('common.selectLanguage') || 'Select language'}
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                role="option"
                aria-selected={lang.code === language}
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
                className={`flex items-center gap-2.5 w-full px-3 py-2 text-left text-sm cursor-pointer border-0 transition-colors ${
                  lang.code === language
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <LangBadge
                  short={lang.short}
                  active={lang.code === language}
                />
                <span className="whitespace-nowrap">{lang.name}</span>
                {lang.code === language && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    className="ml-auto flex-shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 7l3 3 6-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
