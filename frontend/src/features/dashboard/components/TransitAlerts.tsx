import { motion } from 'framer-motion';
import { Calendar, ArrowUpRight, Minus, AlertTriangle } from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { useT } from '@/lib/i18n/useT';
import type { TransitAlert } from '@shared/types/api';

export function TransitAlertsCard({ data, isLoading }: { data?: TransitAlert[] | null; isLoading: boolean }) {
  const { t } = useT();
  const impactStyles: Record<string, { icon: typeof ArrowUpRight; color: string; bg: string; label: string }> = {
    positive: { icon: ArrowUpRight, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: t('dashboard.impactPositive') },
    neutral: { icon: Minus, color: 'text-blue-400', bg: 'bg-blue-500/10', label: t('dashboard.impactNeutral') },
    challenging: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: t('dashboard.impactChallenging') },
  };
  if (isLoading) {
    return (
      <PremiumCard glass className="animate-pulse">
        <div className="h-5 w-36 bg-ink/5 dark:bg-white/5 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-ink/5 dark:bg-white/5 rounded-lg" />
          ))}
        </div>
      </PremiumCard>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <PremiumCard glass>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center">
          <Calendar className="w-3.5 h-3.5 text-gold" />
        </div>
        <h3 className="font-sans text-base font-semibold">{t('dashboard.transitAlerts')}</h3>
      </div>

      <div className="space-y-2">
        {data.map((alert, i) => {
          const istyle = (impactStyles[alert.impact] || impactStyles.neutral)!;
          const Icon = istyle.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-ink/[0.02] dark:bg-white/[0.02] hover:bg-ink/[0.04] dark:hover:bg-white/[0.04] transition-colors"
            >
              <div className={`w-7 h-7 rounded-full ${istyle.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon className={`w-3.5 h-3.5 ${istyle.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{alert.event}</p>
                  <span className="text-[10px] font-sans font-bold text-ink/40 dark:text-parchment/40 whitespace-nowrap">{alert.date}</span>
                </div>
                <p className="text-xs text-ink/60 dark:text-parchment/60 mt-0.5 leading-snug">{alert.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </PremiumCard>
  );
}
