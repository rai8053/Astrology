import { Star } from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import type { VedicProfile } from '@shared/types/api';

const NAVAMSA_COLORS: Record<string, string> = {
  'Lagna (Ascendant)': '#f59e0b',
  'Moon (Chandra)': '#a78bfa',
  'Sun (Surya)': '#ef4444',
  'Mercury (Budha)': '#10b981',
  'Venus (Shukra)': '#ec4899',
  'Jupiter (Guru)': '#f97316',
  'Saturn (Shani)': '#3b82f6',
  'Mars (Mangal)': '#dc2626',
};

export function NavamsaChart({ placements }: { placements: VedicProfile['planetaryPlacements'] }) {
  const withNavamsa = placements.filter(p => p.navamsaSign);
  if (!withNavamsa.length) return null;

  // Group planets by navamsa sign
  const signMap = new Map<string, typeof placements>();
  for (const p of withNavamsa) {
    const key = p.navamsaSign!;
    if (!signMap.has(key)) signMap.set(key, []);
    signMap.get(key)!.push(p);
  }

  // Navamsa houses 1-12 displayed as a grid
  const navamsaSigns = ['Mesh', 'Vrishabh', 'Mithun', 'Kark', 'Simha', 'Kanya', 'Tula', 'Vrishchik', 'Dhanu', 'Makar', 'Kumbha', 'Meen'];

  return (
    <PremiumCard glass>
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-4 h-4 text-gold" />
        <h3 className="font-serif font-semibold">Navamsa (D9) Chart</h3>
        <span className="text-[9px] uppercase font-sans font-bold text-ink/30 dark:text-parchment/30 tracking-wider ml-auto">Divisional Chart for Marriage & Dharma</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {navamsaSigns.map((sign) => {
          const planetsInSign = signMap.get(sign) || [];
          return (
            <div key={sign} className="border border-ink/10 dark:border-white/[0.06] rounded-lg p-2 min-h-[64px] bg-ink/3 dark:bg-white/[0.02]">
              <p className="text-[8px] font-sans font-bold uppercase tracking-wider text-gold/60 mb-1">{sign}</p>
              {planetsInSign.length === 0 ? (
                <p className="text-[7px] text-ink/20 dark:text-parchment/20">—</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {planetsInSign.map((p) => {
                    const color = NAVAMSA_COLORS[p.planet] || '#999';
                    return (
                      <span key={p.planet} className="text-[7px] font-mono font-bold px-1 py-0.5 rounded" style={{ backgroundColor: `${color}18`, color }}>
                        {p.planet.split('(')[1]?.split(')')[0] || p.planet.split(' ')[0]}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-ink/10 dark:border-white/[0.06]">
              <th className="pb-2 font-sans text-[8px] uppercase tracking-wider text-ink/40 dark:text-parchment/40 font-bold">Planet</th>
              <th className="pb-2 font-sans text-[8px] uppercase tracking-wider text-ink/40 dark:text-parchment/40 font-bold">Rashi Sign</th>
              <th className="pb-2 font-sans text-[8px] uppercase tracking-wider text-ink/40 dark:text-parchment/40 font-bold">Navamsa Sign</th>
              <th className="pb-2 font-sans text-[8px] uppercase tracking-wider text-ink/40 dark:text-parchment/40 font-bold">D9 House</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5 dark:divide-white/[0.03]">
            {withNavamsa.map((p, i) => (
              <tr key={i} className="hover:bg-ink/5 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-1.5 font-medium text-[10px]">{p.planet}</td>
                <td className="py-1.5 text-ink/60 dark:text-parchment/60">{p.sign}</td>
                <td className="py-1.5">
                  <span className="px-1.5 py-0.5 bg-gold/10 text-gold rounded text-[9px] font-mono font-bold">{p.navamsaSign}</span>
                </td>
                <td className="py-1.5">
                  <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[9px] font-mono font-bold">{p.navamsaHouse}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PremiumCard>
  );
}