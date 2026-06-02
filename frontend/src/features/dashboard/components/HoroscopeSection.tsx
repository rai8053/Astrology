import { motion } from 'framer-motion';
import { Sparkles, Heart, Briefcase, Activity, DollarSign, Hash, Palette, Lightbulb } from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { useT } from '@/lib/i18n/useT';
import type { PersonalHoroscope } from '@shared/types/api';

type Period = 'today' | 'tomorrow' | 'week' | 'month';

export function HoroscopeSection({
  data, isLoading, period, onPeriodChange,
}: {
  data?: PersonalHoroscope | null;
  isLoading: boolean;
  period: Period;
  onPeriodChange: (p: Period) => void;
}) {
  const { t } = useT();
  const TABS: { key: Period; label: string }[] = [
    { key: 'today', label: t('dashboard.today') },
    { key: 'tomorrow', label: t('dashboard.tomorrow') },
    { key: 'week', label: t('dashboard.week') },
    { key: 'month', label: t('dashboard.month') },
  ];

  const scoreConfig: { label: string; key: keyof Pick<PersonalHoroscope, 'love' | 'career' | 'health' | 'finance'>; icon: typeof Heart; color: string; barColor: string }[] = [
    { label: t('dashboard.loveScore'), key: 'love', icon: Heart, color: 'text-pink-400', barColor: 'from-pink-400 to-rose-500' },
    { label: t('dashboard.careerScore'), key: 'career', icon: Briefcase, color: 'text-blue-400', barColor: 'from-blue-400 to-indigo-500' },
    { label: t('dashboard.healthScore'), key: 'health', icon: Activity, color: 'text-emerald-400', barColor: 'from-emerald-400 to-teal-500' },
    { label: t('dashboard.financeScore'), key: 'finance', icon: DollarSign, color: 'text-amber-400', barColor: 'from-amber-400 to-yellow-500' },
  ];
  return (
    <PremiumCard glass>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
          </div>
          <h3 className="font-sans text-base font-semibold">{t('horoscope.title')}</h3>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-ink/[0.03] dark:bg-white/[0.03] p-1 rounded-lg">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onPeriodChange(t.key)}
            className={`flex-1 py-2 text-xs font-sans font-bold uppercase tracking-wider rounded-md transition-all duration-200 ${
              period === t.key
                ? 'bg-gold/10 text-gold shadow-sm'
                : 'text-ink/40 dark:text-parchment/40 hover:text-ink/70 dark:hover:text-parchment/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-16 bg-ink/5 dark:bg-white/5 rounded-lg" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-ink/5 dark:bg-white/5 rounded-lg" />
            ))}
          </div>
          <div className="h-12 bg-ink/5 dark:bg-white/5 rounded-lg" />
        </div>
      ) : data ? (
        <motion.div
          key={period}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-5"
        >
          <p className="text-sm leading-relaxed text-ink/70 dark:text-parchment/70">{data.prediction}</p>

          <div className="grid grid-cols-2 gap-3">
            {scoreConfig.map((s) => {
              const Icon = s.icon;
              const val = data[s.key];
              return (
                <div key={s.key} className="p-3 rounded-lg bg-ink/[0.02] dark:bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                      <span className="text-[11px] font-sans font-semibold text-ink/50 dark:text-parchment/50">{s.label}</span>
                    </div>
                    <span className={`text-sm font-bold font-sans ${s.color}`}>{val}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-ink/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                      className={`h-full rounded-full bg-gradient-to-r ${s.barColor}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-ink/[0.02] dark:bg-white/[0.02]">
              <Hash className="w-4 h-4 text-gold/60" />
              <div>
                <p className="text-[10px] uppercase tracking-wider font-sans font-bold text-ink/40 dark:text-parchment/40">{t('dashboard.luckyNumber')}</p>
                <p className="text-sm font-bold font-sans">{data.luckyNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-ink/[0.02] dark:bg-white/[0.02]">
              <Palette className="w-4 h-4 text-gold/60" />
              <div>
                <p className="text-[10px] uppercase tracking-wider font-sans font-bold text-ink/40 dark:text-parchment/40">{t('dashboard.luckyColor')}</p>
                <p className="text-sm font-bold font-sans">{data.luckyColor}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-ink/[0.02] dark:bg-white/[0.02]">
              <Lightbulb className="w-4 h-4 text-gold/60" />
              <div>
                <p className="text-[10px] uppercase tracking-wider font-sans font-bold text-ink/40 dark:text-parchment/40">{t('dashboard.dailyAdvice')}</p>
                <p className="text-xs font-medium leading-snug">{data.dailyAdvice}</p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </PremiumCard>
  );
}
