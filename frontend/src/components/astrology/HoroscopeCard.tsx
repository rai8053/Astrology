import { useTranslation } from '@/lib/i18n';
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
  const { t, language } = useTranslation();
  const today = date || new Date().toLocaleDateString(language, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{today}</p>
      <p className="text-sm leading-relaxed text-foreground">
        {prediction || t('horoscope.starsAligning')}
      </p>
      <div className="mt-4 grid grid-cols-4 gap-2">
        <ScoreRing value={love} label={t('horoscope.scoreLove')} />
        <ScoreRing value={career} label={t('horoscope.scoreCareer')} />
        <ScoreRing value={health} label={t('horoscope.scoreHealth')} />
        <ScoreRing value={finance} label={t('horoscope.scoreWealth')} />
      </div>
      {dailyAdvice && (
        <p className="mt-3 border-t border-border pt-3 text-xs italic leading-relaxed text-muted-foreground">
          &ldquo;{dailyAdvice}&rdquo;
        </p>
      )}
    </div>
  );
}
