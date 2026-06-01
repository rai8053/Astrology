import { motion } from 'framer-motion';
import { Star, Moon, Sun, Compass } from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { useT } from '@/lib/i18n/useT';
import type { AstrologySnapshot as SnapshotData } from '@shared/types/api';

const item = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export function AstrologySnapshotCard({ data, isLoading }: { data?: SnapshotData | null; isLoading: boolean }) {
  const { t } = useT();
  const fields: { label: string; key: keyof SnapshotData; icon: typeof Star; color: string }[] = [
    { label: t('onboarding.ascendant'), key: 'ascendant', icon: Compass, color: 'text-amber-400' },
    { label: t('onboarding.moonSign'), key: 'moonRashi', icon: Moon, color: 'text-blue-400' },
    { label: t('onboarding.nakshatra'), key: 'nakshatra', icon: Star, color: 'text-purple-400' },
    { label: t('onboarding.rashiLord'), key: 'rashiLord', icon: Sun, color: 'text-gold' },
  ];
  if (isLoading) {
    return (
      <PremiumCard glass className="animate-pulse">
        <div className="h-5 w-36 bg-ink/5 dark:bg-white/5 rounded mb-5" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-ink/5 dark:bg-white/5 rounded-lg" />
          ))}
        </div>
      </PremiumCard>
    );
  }

  if (!data) return null;

  return (
    <PremiumCard glass>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center">
          <Star className="w-3.5 h-3.5 text-gold" />
        </div>
        <h3 className="font-serif text-base font-semibold">{t('dashboard.astrologySnapshot')}</h3>
      </div>
      <motion.div initial="initial" animate="animate" className="grid grid-cols-2 gap-3">
        {fields.map((f) => {
          const Icon = f.icon;
          return (
            <motion.div key={f.key} variants={item} className="flex items-start gap-3 p-3 rounded-lg bg-ink/[0.02] dark:bg-white/[0.02]">
              <div className={`w-8 h-8 rounded-lg ${f.color}/10 flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${f.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-sans font-bold text-ink/40 dark:text-parchment/40">{f.label}</p>
                <p className="text-sm font-semibold truncate">{String(data[f.key])}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </PremiumCard>
  );
}
