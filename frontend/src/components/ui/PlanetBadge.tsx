import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const planetColors: Record<string, string> = {
  Sun: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  Moon: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
  Mercury: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  Venus: 'bg-pink-400/10 text-pink-400 border-pink-400/20',
  Mars: 'bg-red-400/10 text-red-400 border-red-400/20',
  Jupiter: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  Saturn: 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20',
  Rahu: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  Ketu: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
};

interface Props {
  name: string;
  children?: ReactNode;
  className?: string;
}

export function PlanetBadge({ name, children, className }: Props) {
  const colorClass = planetColors[name] || 'bg-primary/10 text-primary-light border-primary/20';
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border', colorClass, className)}>
      {children || name}
    </span>
  );
}
