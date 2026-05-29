import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { CardSkeleton } from '@/components/Skeleton';
import type { MoonPhaseInfo } from '@shared/types/api';

function MoonSvg({ illumination, phaseName }: { illumination: number; phaseName: string }) {
  const isWaning = phaseName.toLowerCase().includes('waning') || phaseName.toLowerCase().includes('third');
  const size = 160;
  const radius = 60;
  const cx = size / 2;
  const cy = size / 2;
  const k = illumination / 100;
  let path = '';

  if (illumination === 0) {
    path = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx + radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx - radius} ${cy}`;
  } else if (illumination < 50) {
    const rx = radius * (1 - 2 * k);
    path = `M ${cx} ${cy - radius} A ${radius} ${radius} 0 0 1 ${cx} ${cy + radius} A ${rx} ${radius} 0 0 ${isWaning ? 1 : 0} ${cx} ${cy - radius} Z`;
  } else if (illumination < 100) {
    const rx = radius * (2 * k - 1);
    path = `M ${cx} ${cy - radius} A ${radius} ${radius} 0 0 1 ${cx} ${cy + radius} A ${rx} ${radius} 0 0 ${isWaning ? 0 : 1} ${cx} ${cy - radius} Z`;
  }

  return (
    <motion.svg
      width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFBF2" />
          <stop offset="100%" stopColor="#f0e6cc" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={radius} fill="url(#moonGlow)" stroke="#D4AF37" strokeWidth="1" />
      {illumination < 100 && path && <path d={path} fill="#1a0a2e" opacity="0.92" />}
      <circle cx={cx} cy={cy} r={radius + 6} fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.25" />
      <circle cx={cx} cy={cy} r={radius + 10} fill="none" stroke="#D4AF37" strokeWidth="0.3" opacity="0.1" />
    </motion.svg>
  );
}

export function MoonPage() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  const { data, isLoading } = useQuery({
    queryKey: ['moon', date],
    queryFn: () => api.post<MoonPhaseInfo>('/api/astrology/moon-phase', { date }),
  });

  const moon = data?.data;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-serif font-bold">Moon Phase Tracker</h1>
        <p className="text-ink/50 dark:text-parchment/50 mt-1">Live Tithi & Lunar Station</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-3">
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-ink/40 dark:text-parchment/40">Date:</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="bg-transparent border border-ink/20 dark:border-white/10 px-3 py-2 text-sm rounded-xl focus:border-gold outline-none transition-colors glass-card"
        />
      </motion.div>

      {isLoading ? (
        <CardSkeleton />
      ) : moon ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <PremiumCard glass glow className="text-center">
            <MoonSvg illumination={moon.illumination} phaseName={moon.phaseName} />
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-serif font-bold mt-4"
            >
              {moon.phaseName}
            </motion.h2>
            <p className="text-[10px] uppercase font-sans font-bold text-ink/40 dark:text-parchment/40 mt-1 tracking-wider">
              {moon.tithiType} • Tithi #{moon.tithiNum}
            </p>
            <div className="flex justify-around mt-5 pt-4 border-t border-ink/10 dark:border-white/[0.06]">
              {[
                { label: 'Illumination', value: `${moon.illumination}%` },
                { label: 'Age', value: `${moon.age}d` },
                { label: 'Distance', value: `${(moon.distance / 1000).toFixed(0)}k km` },
              ].map((item, i) => (
                <div key={i}>
                  <span className="text-[9px] text-ink/40 dark:text-parchment/40 block uppercase tracking-wider">{item.label}</span>
                  <span className="text-lg font-bold font-serif text-gold">{item.value}</span>
                </div>
              ))}
            </div>
          </PremiumCard>

          <div className="lg:col-span-2 space-y-6">
            <PremiumCard glass>
              <span className="text-[9px] uppercase font-sans font-bold text-gold tracking-[0.2em]">Tithi</span>
              <h2 className="text-2xl font-serif font-bold mt-1">{moon.tithiName}</h2>
              <p className="text-sm mt-3 leading-relaxed text-ink/70 dark:text-parchment/70">{moon.tithiSignificance}</p>
            </PremiumCard>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div whileHover={{ y: -4 }}>
                <PremiumCard glass className="bg-gradient-to-br from-amber-50 to-parchment dark:from-cosmic dark:to-cosmic-light text-ink dark:text-parchment gold-border h-full">
                  <span className="text-[8px] uppercase font-sans font-bold text-gold tracking-wider">Next Full Moon</span>
                  <h3 className="text-xl font-serif font-bold mt-2">Purnima</h3>
                  <p className="text-lg mt-2 text-gold font-serif">{moon.nextPurnima}</p>
                </PremiumCard>
              </motion.div>
              <motion.div whileHover={{ y: -4 }}>
                <PremiumCard glass className="h-full">
                  <span className="text-[8px] uppercase font-sans font-bold text-ink/40 dark:text-parchment/40 tracking-wider">Next New Moon</span>
                  <h3 className="text-xl font-serif font-bold mt-2">Amavasya</h3>
                  <p className="text-lg mt-2 text-ink/60 dark:text-parchment/60 font-serif">{moon.nextAmavasya}</p>
                </PremiumCard>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
