import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { CardSkeleton } from '@/components/Skeleton';
import { RASHIS } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';
import type { DailyHoroscope } from '@shared/types/api';

const staggerContainer = { animate: { transition: { staggerChildren: 0.03 } } };
const staggerItem = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export function HoroscopePage() {
  const { t } = useT();
  const [selectedRashi, setSelectedRashi] = useState('Mesh');

  const { data, isLoading } = useQuery({
    queryKey: ['horoscope', selectedRashi],
    queryFn: () => api.post<DailyHoroscope>('/api/astrology/daily-horoscope', { rashi: selectedRashi }),
  });

  const horoscope = data?.data;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-serif font-bold">{t('horoscope.title')}</h1>
        <p className="text-ink/50 dark:text-parchment/50 mt-1">{t('horoscope.subtitle')}</p>
      </motion.div>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
        {RASHIS.map((r) => (
          <motion.button
            key={r.key}
            variants={staggerItem}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedRashi(r.key)}
            className={`p-3 text-center rounded-xl transition-all duration-300 ${
              selectedRashi === r.key
                ? 'bg-gradient-to-br from-gold to-amber-400 text-cosmic shadow-lg shadow-gold/20'
                : 'glass-card hover:cosmic-glow'
            }`}
          >
            <span className="text-lg block mb-0.5">{r.symbol}</span>
            <span className="text-[9px] font-sans font-bold uppercase block truncate tracking-wider">{r.key}</span>
          </motion.button>
        ))}
      </motion.div>

      {isLoading ? (
        <CardSkeleton />
      ) : horoscope ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 space-y-6">
            <PremiumCard glass glow>
              <span className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-gold">{t('horoscope.cosmicForecast')}</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mt-1">
                {horoscope.rashi} <span className="text-lg font-normal text-ink/40 dark:text-parchment/40">({horoscope.englishName})</span>
              </h2>
              <p className="text-base leading-relaxed mt-4 text-ink/70 dark:text-parchment/70">{horoscope.general}</p>
            </PremiumCard>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: t('horoscope.career'), value: horoscope.career, color: 'from-blue-500/10', border: 'border-l-blue-400' },
                { label: t('horoscope.finance'), value: horoscope.finance, color: 'from-green-500/10', border: 'border-l-green-400' },
                { label: t('horoscope.love'), value: horoscope.love, color: 'from-pink-500/10', border: 'border-l-pink-400' },
                { label: t('horoscope.health'), value: horoscope.health, color: 'from-teal-500/10', border: 'border-l-teal-400' },
              ].map((section, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <PremiumCard glass className={`border-l-4 ${section.border} relative overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${section.color} to-transparent opacity-50`} />
                    <div className="relative">
                      <span className="text-[9px] uppercase font-sans font-bold tracking-widest text-ink/40 dark:text-parchment/40">{section.label}</span>
                      <p className="text-sm mt-2 leading-relaxed text-ink/70 dark:text-parchment/70">{section.value}</p>
                    </div>
                  </PremiumCard>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <PremiumCard glass>
              <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-ink/40 dark:text-parchment/40">{t('horoscope.energyLevel')}</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-sm text-ink/60 dark:text-parchment/60">{t('horoscope.energyVitality')}</span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-3xl font-serif font-bold text-gold"
                >
                  {horoscope.energyLevel}%
                </motion.span>
              </div>
              <div className="w-full h-2 bg-ink/5 dark:bg-white/5 rounded-full mt-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${horoscope.energyLevel}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-gold to-amber-400"
                />
              </div>
            </PremiumCard>

            <PremiumCard glass>
              <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-ink/40 dark:text-parchment/40">{t('horoscope.luckyAttributes')}</span>
              <div className="space-y-3 mt-3">
                {[
                  { label: t('horoscope.number'), value: horoscope.luckyNumber },
                  { label: t('horoscope.color'), value: horoscope.luckyColor },
                  { label: t('horoscope.luckyTime'), value: horoscope.luckyTime },
                ].map((attr, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-ink/40 dark:text-parchment/40">{attr.label}</span>
                    <span className="font-bold">{attr.value}</span>
                  </motion.div>
                ))}
              </div>
            </PremiumCard>

            <PremiumCard glass className="gold-border">
              <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-gold">{t('horoscope.remedy')}</span>
              <p className="text-sm mt-2 italic text-ink/70 dark:text-parchment/70">{horoscope.remedy}</p>
            </PremiumCard>
          </div>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
