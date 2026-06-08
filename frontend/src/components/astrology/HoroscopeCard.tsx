import { ScoreRing } from './ScoreRing';

interface HoroscopeCardProps {
  prediction: string;
  dailyAdvice?: string;
  love?: number | null;
  career?: number | null;
  health?: number | null;
  finance?: number | null;
  date?: string;
}

export function HoroscopeCard({ prediction, dailyAdvice, love, career, health, finance, date }: HoroscopeCardProps) {
  const today = date || new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{today}</p>
      <p className="text-sm leading-relaxed text-foreground">
        {prediction || 'The stars are aligning in your favor today.'}
      </p>
      <div className="mt-4 grid grid-cols-4 gap-2">
        <ScoreRing value={love} label="Love" />
        <ScoreRing value={career} label="Career" />
        <ScoreRing value={health} label="Health" />
        <ScoreRing value={finance} label="Wealth" />
      </div>
      {dailyAdvice && (
        <p className="mt-3 border-t border-border pt-3 text-xs italic leading-relaxed text-muted-foreground">
          &ldquo;{dailyAdvice}&rdquo;
        </p>
      )}
    </div>
  );
}
