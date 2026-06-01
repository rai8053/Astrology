import { motion } from 'framer-motion';
import { ScrollText } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';
import type { TranslationKey } from '@/lib/i18n/translations';

export function TermsPage() {
  const { t } = useT();
  return (
    <div className="min-h-screen bg-gradient-to-b from-parchment to-amber-50 dark:from-cosmic dark:to-cosmic-deeper">
      <div className="max-w-3xl mx-auto px-5 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <ScrollText className="w-10 h-10 text-gold mx-auto mb-3" />
          <h1 className="font-serif text-4xl font-bold mb-3">{t('terms.title')}</h1>
          <p className="text-sm text-ink/40">{t('terms.lastUpdated')}: May 31, 2026</p>
        </motion.div>
        <div className="space-y-6 text-ink/70 dark:text-parchment/70">
          {([1,2,3,4,5,6,7,8,9,10] as const).map((i) => (
            <section key={i}>
              <h2 className="text-lg font-semibold text-ink dark:text-parchment">{t(`terms.section${i}Title` as TranslationKey)}</h2>
              <p className="mt-2">{t(`terms.section${i}Body` as TranslationKey)}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
