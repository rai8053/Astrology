import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { useT } from '@/lib/i18n/useT';
import type { TranslationKey } from '@/lib/i18n/translations';

export function PrivacyPage() {
  const { t } = useT();
  return (
    <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
      <Navbar />
      <div className="max-w-3xl mx-auto px-5 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Shield className="w-10 h-10 text-accent mx-auto mb-3" />
          <h1 className="font-sans text-4xl sm:text-5xl font-bold tracking-tight mb-3">{t('privacy.title')}</h1>
          <p className="text-sm text-text-tertiary">{t('privacy.lastUpdated')}: May 31, 2026</p>
        </motion.div>
        <PremiumCard glass>
          <div className="space-y-6 text-text-secondary">
            {([1,2,3,4,5,6,7,8] as const).map((i) => (
              <section key={i}>
                <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">{t(`privacy.section${i}Title` as TranslationKey)}</h2>
                <p className="mt-2">{t(`privacy.section${i}Body` as TranslationKey)}</p>
              </section>
            ))}
          </div>
        </PremiumCard>
      </div>
      <Footer />
    </div>
  );
}
