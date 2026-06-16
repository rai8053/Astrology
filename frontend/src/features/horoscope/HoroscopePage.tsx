import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { CardSkeleton } from '@/components/Skeleton';
import { cn, RASHIS } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { DailyHoroscope } from '@shared/types/api';

const PLANET_RULERS: Record<string, string> = {
  Mesh: 'Mangal', Vrishabh: 'Shukra', Mithun: 'Budh', Kark: 'Chandra',
  Simha: 'Surya', Kanya: 'Budh', Tula: 'Shukra', Vrishchik: 'Mangal',
  Dhanu: 'Guru', Makar: 'Shani', Kumbha: 'Shani', Meen: 'Guru',
};

const staggerContainer = { animate: { transition: { staggerChildren: 0.03 } } };
const staggerItem = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export function HoroscopePage() {
  const { t } = useTranslation();
  const [selectedRashi, setSelectedRashi] = useState('Mesh');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

  const { data, isLoading } = useQuery({
    queryKey: ['horoscope', selectedRashi],
    queryFn: () => api.post<DailyHoroscope>('/api/astrology/daily-horoscope', { rashi: selectedRashi }),
  });

  const horoscope = data?.data;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-display tracking-tight text-foreground">{t('horoscope.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('horoscope.subtitle')}</p>
      </motion.div>

      {/* Zodiac Grid - 4×3 */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {RASHIS.map((r) => {
          const elDot: Record<string,string> = { Fire:'bg-orange-500', Earth:'bg-emerald-500', Air:'bg-amber-200', Water:'bg-blue-400' };
          return (
            <motion.button
              key={r.key}
              variants={staggerItem}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedRashi(r.key)}
              className={cn(
                'relative p-3 text-center rounded-xl transition-all duration-300',
                selectedRashi === r.key
                  ? 'gold-gradient text-primary-foreground shadow-lg shadow-primary/20'
                  : 'sacred-border bg-card/50 hover:bg-primary/[0.04]',
              )}
            >
              <span className="text-2xl block">{r.symbol}</span>
              <span className="text-[10px] font-sans font-bold uppercase block truncate tracking-wider mt-1">{r.key}</span>
              <span className={cn('inline-block w-1.5 h-1.5 rounded-full mt-1', elDot[r.element] || 'bg-primary/30')} />
            </motion.button>
          );
        })}
      </motion.div>

      {isLoading ? (
        <CardSkeleton />
      ) : horoscope ? (
        <>
          {/* Cosmic Energy Bars */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">{t('horoscope.cosmicEnergy') || "Today's Cosmic Energy"}</p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: t('horoscope.love') || 'Love', color: 'bg-rose-500/60', key: 'love' },
                { label: t('horoscope.career') || 'Career', color: 'bg-blue-500/60', key: 'career' },
                { label: t('horoscope.health') || 'Health', color: 'bg-emerald-500/60', key: 'health' },
                { label: t('horoscope.finance') || 'Finance', color: 'bg-amber-500/60', key: 'finance' },
                { label: t('horoscope.spirit') || 'Spirit', color: 'bg-purple-500/60', key: 'spirit' },
              ].map((item, i) => {
                const hash = (horoscope.general?.length || 1) * (i + 1);
                const score = Math.max(10, Math.min(100, horoscope.energyLevel + ((hash * 13 + i * 7) % 15) - 7));
                return (
                  <div key={item.key} className="text-center">
                    <div className="h-16 rounded-lg bg-primary/5 overflow-hidden relative">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${score}%` }}
                        transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                        className={cn('absolute bottom-0 left-0 right-0 rounded-t-lg', item.color)}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5">{item.label}</p>
                    <p className="text-[10px] font-semibold text-foreground">{score}%</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Result */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card with Glyph */}
              <PremiumCard glass glow>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">{RASHIS.find(r => r.key === selectedRashi)?.symbol || '✦'}</span>
                  <div>
                    <h2 className="text-3xl font-display tracking-tight text-foreground">{horoscope.rashi}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{horoscope.englishName}</span>
                      <span className="badge-primary">{PLANET_RULERS[selectedRashi] || ''}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  {(['summary', 'detailed', 'weekly', 'monthly'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode as any)}
                      className={cn(
                        'px-3 py-1 text-[10px] font-medium rounded-full transition-all',
                        viewMode === mode
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/5 text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {mode === 'summary' ? t('kundli.summarized') || 'Summary' :
                       mode === 'detailed' ? t('kundli.detailed') || 'Detailed' :
                       mode === 'weekly' ? t('horoscope.weekly') || 'This Week' :
                       t('horoscope.monthly') || 'This Month'}
                    </button>
                  ))}
                </div>
                {viewMode === 'summary' ? (
                  <p className="text-sm leading-relaxed text-foreground">{horoscope.general}</p>
                ) : (
                  <div className="detailed-report text-sm text-muted-foreground">
                    {horoscope.general}
                  </div>
                )}
              </PremiumCard>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: t('horoscope.career'), value: horoscope.career, border: 'border-l-blue-400' },
                  { label: t('horoscope.finance'), value: horoscope.finance, border: 'border-l-amber-400' },
                  { label: t('horoscope.love'), value: horoscope.love, border: 'border-l-rose-400' },
                  { label: t('horoscope.health'), value: horoscope.health, border: 'border-l-emerald-400' },
                ].map((section, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}>
                    <PremiumCard glass className={`border-l-4 ${section.border}`}>
                      <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-muted-foreground">{section.label}</span>
                      <p className="text-sm mt-2 leading-relaxed text-foreground">{section.value}</p>
                    </PremiumCard>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <PremiumCard glass>
                <span className="text-[10px] uppercase font-sans font-bold tracking-wider text-muted-foreground">{t('horoscope.energyLevel')}</span>
                <div className="flex items-end justify-between mt-2">
                  <span className="text-sm text-muted-foreground">{t('horoscope.energyVitality')}</span>
                  <span className="text-3xl font-bold gold-text">{horoscope.energyLevel}%</span>
                </div>
                <div className="w-full h-1.5 bg-primary/10 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${horoscope.energyLevel}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full gold-gradient"
                  />
                </div>
              </PremiumCard>

              <PremiumCard glass>
                <span className="text-[10px] uppercase font-sans font-bold tracking-wider text-muted-foreground">{t('horoscope.luckyAttributes')}</span>
                <div className="space-y-3 mt-3">
                  {[
                    { label: t('horoscope.number'), value: horoscope.luckyNumber },
                    { label: t('horoscope.color'), value: horoscope.luckyColor },
                    { label: t('horoscope.luckyTime'), value: horoscope.luckyTime },
                  ].map((attr, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
                      className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{attr.label}</span>
                      <span className="font-bold text-foreground">{attr.value}</span>
                    </motion.div>
                  ))}
                </div>
              </PremiumCard>

              <PremiumCard glass className="border-primary/30">
                <span className="text-[10px] uppercase font-sans font-bold tracking-wider text-primary-light">{t('horoscope.remedy')}</span>
                <p className="text-sm mt-2 italic text-muted-foreground">{horoscope.remedy}</p>
              </PremiumCard>
            </div>
          </motion.div>
        </>
      ) : null}
    </motion.div>
  );
}
