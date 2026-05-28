import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { RASHIS } from '@/lib/utils';
import type { DailyHoroscope } from '@shared/types/api';

export function HoroscopePage() {
  const [selectedRashi, setSelectedRashi] = useState('Mesh');

  const { data, isLoading } = useQuery({
    queryKey: ['horoscope', selectedRashi],
    queryFn: () => api.post<DailyHoroscope>('/api/astrology/daily-horoscope', { rashi: selectedRashi }),
  });

  const horoscope = data?.data;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold">Daily Horoscope</h1>
        <p className="text-ink/60 dark:text-parchment/60 mt-1">Sidereal Vedic forecasts for your Moon sign</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
        {RASHIS.map((r) => (
          <button
            key={r.key}
            onClick={() => setSelectedRashi(r.key)}
            className={`p-3 text-center border rounded-lg transition-all ${
              selectedRashi === r.key
                ? 'bg-gold text-cosmic border-gold'
                : 'border-ink/10 dark:border-white/10 hover:border-gold/50 bg-white dark:bg-cosmic-light/50'
            }`}
          >
            <span className="text-lg block">{r.symbol}</span>
            <span className="text-[10px] font-sans font-bold uppercase block truncate">{r.key}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-gold animate-spin" />
        </div>
      ) : horoscope ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-gold">Cosmic Forecast</span>
              <h2 className="text-3xl font-serif font-bold mt-1">{horoscope.rashi} <span className="text-lg font-normal text-ink/60">({horoscope.englishName})</span></h2>
              <p className="text-lg leading-relaxed mt-4">{horoscope.general}</p>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Career', value: horoscope.career, color: 'border-l-blue-500' },
                { label: 'Finance', value: horoscope.finance, color: 'border-l-green-500' },
                { label: 'Love', value: horoscope.love, color: 'border-l-pink-500' },
                { label: 'Health', value: horoscope.health, color: 'border-l-teal-500' },
              ].map((section, i) => (
                <Card key={i} className={`border-l-4 ${section.color}`}>
                  <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-ink/50">{section.label}</span>
                  <p className="text-sm mt-2 leading-relaxed">{section.value}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <span className="text-[10px] uppercase font-sans font-bold tracking-wider text-ink/50">Energy Level</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-sm">Vitality</span>
                <span className="text-2xl font-serif font-bold">{horoscope.energyLevel}%</span>
              </div>
              <div className="w-full h-1.5 bg-ink/10 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                <div className="bg-gold h-full rounded-full transition-all duration-1000" style={{ width: `${horoscope.energyLevel}%` }} />
              </div>
            </Card>

            <Card>
              <span className="text-[10px] uppercase font-sans font-bold tracking-wider text-ink/50">Lucky Attributes</span>
              <div className="space-y-3 mt-3">
                <div className="flex justify-between text-sm"><span className="text-ink/60">Number</span><span className="font-bold">{horoscope.luckyNumber}</span></div>
                <div className="flex justify-between text-sm"><span className="text-ink/60">Color</span><span className="font-bold">{horoscope.luckyColor}</span></div>
                <div className="flex justify-between text-sm"><span className="text-ink/60">Time</span><span className="font-bold">{horoscope.luckyTime}</span></div>
              </div>
            </Card>

            <Card className="border-gold/30">
              <span className="text-[10px] uppercase font-sans font-bold tracking-wider text-gold">Remedy</span>
              <p className="text-sm mt-2 italic">{horoscope.remedy}</p>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-ink/50">Select a Rashi to view your horoscope</div>
      )}
    </div>
  );
}
