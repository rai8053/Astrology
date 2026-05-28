import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import type { MoonPhaseInfo } from '@shared/types/api';

function MoonSvg({ illumination, phaseName }: { illumination: number; phaseName: string }) {
  const isWaning = phaseName.toLowerCase().includes('waning') || phaseName.toLowerCase().includes('third');
  const size = 140;
  const radius = 55;
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
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      <circle cx={cx} cy={cy} r={radius} fill="#FFFBF2" stroke="#D4AF37" strokeWidth="1" />
      {illumination < 100 && path && <path d={path} fill="#1a0a2e" opacity="0.94" />}
      <circle cx={cx} cy={cy} r={radius + 5} fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
    </svg>
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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold">Moon Phase Tracker</h1>
        <p className="text-ink/60 dark:text-parchment/60 mt-1">Live Tithi & Lunar Station</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-sans font-bold uppercase tracking-wider text-ink/50">Date:</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="bg-transparent border border-ink/20 dark:border-white/20 px-3 py-1.5 text-sm rounded-lg focus:border-gold outline-none" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><RefreshCw className="w-8 h-8 text-gold animate-spin" /></div>
      ) : moon ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="text-center">
            <MoonSvg illumination={moon.illumination} phaseName={moon.phaseName} />
            <h2 className="text-2xl font-serif font-bold mt-4">{moon.phaseName}</h2>
            <p className="text-xs uppercase font-sans font-bold text-ink/50 mt-1">{moon.tithiType} • Tithi #{moon.tithiNum}</p>
            <div className="flex justify-around mt-4 pt-4 border-t border-ink/10 dark:border-white/10">
              <div>
                <span className="text-[10px] text-ink/50 block">Illumination</span>
                <span className="text-lg font-bold">{moon.illumination}%</span>
              </div>
              <div>
                <span className="text-[10px] text-ink/50 block">Age</span>
                <span className="text-lg font-bold">{moon.age}d</span>
              </div>
              <div>
                <span className="text-[10px] text-ink/50 block">Distance</span>
                <span className="text-lg font-bold">{(moon.distance / 1000).toFixed(0)}k km</span>
              </div>
            </div>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <span className="text-[10px] uppercase font-sans font-bold text-gold">Tithi</span>
              <h2 className="text-2xl font-serif font-bold mt-1">{moon.tithiName}</h2>
              <p className="text-sm mt-3 leading-relaxed">{moon.tithiSignificance}</p>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="bg-cosmic text-parchment border-gold/30">
                <span className="text-[9px] uppercase font-sans font-bold text-gold">Next Full Moon</span>
                <h3 className="text-xl font-serif font-bold mt-2">Purnima</h3>
                <p className="text-lg mt-2 text-gold">{moon.nextPurnima}</p>
              </Card>
              <Card>
                <span className="text-[9px] uppercase font-sans font-bold text-ink/50">Next New Moon</span>
                <h3 className="text-xl font-serif font-bold mt-2">Amavasya</h3>
                <p className="text-lg mt-2 text-ink/70">{moon.nextAmavasya}</p>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-ink/50">Select a date to view moon phase</div>
      )}
    </div>
  );
}
