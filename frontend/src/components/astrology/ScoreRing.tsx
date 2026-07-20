import { useEffect, useState } from 'react';

interface ScoreRingProps {
  value: number | null | undefined;
  label: string;
  size?: number;
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'stroke-[var(--color-primary)]';
  if (score >= 70) return 'stroke-[var(--color-primary-light)]';
  if (score >= 50) return 'stroke-[var(--color-primary-lighter)]';
  return 'stroke-[var(--color-primary)]';
}

export function ScoreRing({ value, label, size = 64 }: ScoreRingProps) {
  const safeVal = typeof value === 'number' && !isNaN(value) ? Math.max(0, Math.min(100, value)) : 0;
  const [animatedOffset, setAnimatedOffset] = useState(100);

  const r = Math.max(20, (size - 8) / 2);
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    const start = performance.now();
    const duration = 800;
    function animate(time: number) {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedOffset(circ - (safeVal / 100) * circ * eased);
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [safeVal, circ]);

  const displayVal = value != null && !isNaN(value) ? Math.round(safeVal) : '—';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth="4"
            strokeDasharray={circ}
            strokeDashoffset={animatedOffset}
            strokeLinecap="round"
            className={getScoreColor(safeVal)}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
          {displayVal}
        </span>
      </div>
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}
