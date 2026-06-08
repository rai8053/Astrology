import { cn } from '@/lib/utils';

interface PlanetCardProps {
  name: string;
  sign: string;
  signFull?: string;
  house: number | null | undefined;
  degrees: number | null | undefined;
  minutes: number | null | undefined;
  interpretation?: string;
  color?: string;
}

const PLANET_COLORS: Record<string, string> = {
  Sun: 'bg-amber-500/15 text-amber-500 border-amber-500/25',
  Moon: 'bg-blue-500/15 text-blue-500 border-blue-500/25',
  Mars: 'bg-red-500/15 text-red-500 border-red-500/25',
  Mercury: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25',
  Jupiter: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/25',
  Venus: 'bg-pink-500/15 text-pink-500 border-pink-500/25',
  Saturn: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/25',
  Rahu: 'bg-purple-500/15 text-purple-500 border-purple-500/25',
  Ketu: 'bg-orange-500/15 text-orange-500 border-orange-500/25',
};

function getPlanetStyle(name: string): string {
  for (const [key, cls] of Object.entries(PLANET_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return cls;
  }
  return 'bg-muted text-muted-foreground border-border';
}

export function PlanetCard({ name, sign, signFull, house, degrees, minutes, interpretation }: PlanetCardProps) {
  const planetStyle = getPlanetStyle(name);
  const subtitle = signFull?.split('(')[1]?.replace(')', '') || signFull || '—';

  return (
    <div className="rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-base font-semibold text-foreground">{name || '—'}</span>
        <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-semibold', planetStyle)}>
          {sign || '—'}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {subtitle}
        <span className="mx-1">&middot;</span>
        House {house ?? '—'}
        <span className="mx-1">&middot;</span>
        {degrees ?? '—'}°{minutes ?? '—'}'
      </p>
      {interpretation && (
        <p className="mt-2 border-t border-border pt-2 text-sm italic leading-snug text-muted-foreground">
          {interpretation}
        </p>
      )}
    </div>
  );
}
