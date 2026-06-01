import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18nStore } from '@/lib/i18n/store';
import type { Language } from '@/lib/i18n/translations';

const LANGUAGES: { code: Language; name: string; native: string }[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'zh', name: 'Chinese', native: '中文' },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18nStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = LANGUAGES.find((l) => l.code === language)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-ink/60 dark:text-parchment/60 hover:text-ink dark:hover:text-parchment hover:bg-ink/5 dark:hover:bg-white/[0.05] transition-all"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{current.native}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute right-0 mt-1 w-40 rounded-xl bg-white dark:bg-cosmic border border-ink/10 dark:border-white/[0.08] shadow-xl z-50 max-h-64 overflow-y-auto"
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLanguage(l.code); setOpen(false); }}
                className={`w-full text-left px-3.5 py-2 text-sm flex items-center gap-2 transition-colors ${
                  language === l.code
                    ? 'text-gold bg-gold/5'
                    : 'text-ink/70 dark:text-parchment/70 hover:bg-ink/5 dark:hover:bg-white/[0.05]'
                }`}
              >
                <span className="text-xs opacity-60 w-5">{l.native.charAt(0)}</span>
                <span>{l.native}</span>
                <span className="ml-auto text-[10px] text-ink/30">{l.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
