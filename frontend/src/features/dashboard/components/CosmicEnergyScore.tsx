import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { useT } from '@/lib/i18n/useT';
import type { CosmicEnergy } from '@shared/types/api';

const levelColors: Record<string, { text: string; bar: string; glow: string }> = {
  Excellent: { text: 'text-emerald-400', bar: 'from-emerald-400 to-green-500', glow: 'rgba(52,211,153,0.15)' },
  High: { text: 'text-blue-400', bar: 'from-blue-400 to-indigo-500', glow: 'rgba(96,165,250,0.15)' },
  Moderate: { text: 'text-amber-400', bar: 'from-amber-400 to-yellow-500', glow: 'rgba(251,191,36,0.15)' },
  Low: { text: 'text-red-400', bar: 'from-red-400 to-rose-500', glow: 'rgba(248,113,113,0.15)' },
};

export function CosmicEnergyCard({ data, isLoading }: { data?: CosmicEnergy | null; isLoading: boolean }) {
  const { t } = useT();
  const levelLabels: Record<string, string> = {
    Excellent: t('dashboard.cosmicExcellent'),
    High: t('dashboard.cosmicHigh'),
    Moderate: t('dashboard.cosmicModerate'),
    Low: t('dashboard.cosmicLow'),
  };
  if (isLoading) {
    return (
      <PremiumCard glass className="animate-pulse">
        <div className="h-5 w-32 bg-ink/5 dark:bg-white/5 rounded mb-4" />
        <div className="h-16 bg-ink/5 dark:bg-white/5 rounded-lg" />
      </PremiumCard>
    );
  }

  if (!data) return null;

  const lc = (levelColors[data.level] ?? levelColors.Moderate)!;

  return (
    <PremiumCard glass>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-gold" />
        </div>
        <h3 className="font-serif text-base font-semibold">{t('dashboard.cosmicEnergy')}</h3>
      </div>

      <div className="flex items-end justify-between mb-2">
        <div>
          <motion.span
            key={data.score}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className={`text-3xl font-serif font-bold ${lc.text}`}
          >
            {data.score}
          </motion.span>
          <span className="text-xs text-ink/40 dark:text-parchment/40 ml-1">{t('common.of100')}</span>
        </div>
        <span className={`text-[10px] uppercase tracking-wider font-sans font-bold ${lc.text}`}>{levelLabels[data.level] || data.level}</span>
      </div>

      <div className="w-full h-2 bg-ink/5 dark:bg-white/5 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${data.score}%` }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${lc.bar}`}
          style={{ boxShadow: `0 0 12px ${lc.glow}` }}
        />
      </div>

      <p className="text-xs text-ink/60 dark:text-parchment/60 leading-relaxed">{data.description}</p>
    </PremiumCard>
  );
}
