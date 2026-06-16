import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageContainer } from '@/components/layout/PageContainer';
import { PremiumButton } from '@/components/PremiumButton';
import { Sparkles, Calculator, Heart, Briefcase, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

type NumerologyResult = {
  lifePath: number;
  destiny: number;
  soulUrge: number;
};

function calculateLifePath(year: number, month: number, day: number): number {
  const sum = [...String(year), ...String(month), ...String(day)].reduce((a, d) => a + parseInt(d), 0);
  if (sum === 11 || sum === 22 || sum === 33) return sum;
  if (sum < 10) return sum;
  return calculateLifePath(Math.floor(sum / 10), 0, sum % 10);
}

function calculateDestiny(name: string): number {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const values = [1, 2, 3, 4, 5, 8, 3, 5, 1, 1, 2, 3, 4, 5, 7, 8, 2, 2, 3, 4, 6, 6, 6, 5, 1, 7];
  let sum = 0;
  for (const ch of name.toLowerCase()) {
    const idx = letters.indexOf(ch);
    if (idx >= 0) sum += values[idx]!;
  }
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = String(sum).split('').reduce((a, d) => a + parseInt(d), 0);
  }
  return sum;
}

function calculateSoulUrge(name: string): number {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  let sum = 0;
  for (const ch of name.toLowerCase()) {
    if (vowels.includes(ch)) {
      sum += 'aeiou'.indexOf(ch) + 1;
    }
  }
  if (sum === 0) return 0;
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = String(sum).split('').reduce((a, d) => a + parseInt(d), 0);
  }
  return sum;
}

function NumberCard({ num, label, meaning, color }: { num: number; label: string; meaning: { title: string; desc: string; traits?: string[] }; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-xl p-6 text-center card-hover"
    >
      <div className={cn('w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center', color)}>
        <span className="text-2xl font-bold">{num}</span>
      </div>
      <h3 className="text-sm font-semibold text-primary-light mb-1">{label}</h3>
      <h4 className="text-lg font-bold mb-2">{meaning.title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{meaning.desc}</p>
      {meaning.traits && (
        <div className="flex flex-wrap justify-center gap-1.5 mt-3">
          {meaning.traits.map((trait) => (
            <span key={trait} className="px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary-light rounded-full">
              {trait}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function NumerologyPage() {
  const { t } = useTranslation();

  const getLifePathMeaning = (num: number) => {
    if (num === 0) return { title: t('numerology.unknown'), desc: t('numerology.calcError'), traits: [] as string[] };
    return {
      title: t(`numerology.title${num}`),
      desc: t(`numerology.desc${num}`),
      traits: t(`numerology.traits${num}`).split(',').map((s) => s.trim()),
    };
  };

  const getDestinyMeaning = (num: number) => {
    if (num < 1 || num > 9) return { title: t('numerology.unknown'), desc: t('numerology.calcError') };
    return {
      title: t(`numerology.destiny${num}`),
      desc: t(`numerology.destiny${num}Desc`),
    };
  };

  const getSoulUrgeMeaning = (num: number) => {
    if (num < 1 || num > 9) return { title: t('numerology.unknown'), desc: t('numerology.calcError') };
    return {
      title: t(`numerology.soul${num}`),
      desc: t(`numerology.soul${num}Desc`),
    };
  };

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [calculated, setCalculated] = useState(false);

  const handleCalculate = () => {
    if (!name.trim() || !dob) return;
    const parts = dob.split('-').map(Number);
    const y = parts[0] ?? 0, m = parts[1] ?? 0, d = parts[2] ?? 0;
    const lifePath = calculateLifePath(y, m, d);
    const destiny = calculateDestiny(name.trim());
    const soulUrge = calculateSoulUrge(name.trim());
    setResult({ lifePath, destiny, soulUrge });
    setCalculated(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20">
        <PageContainer maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="tag mb-4 inline-block">{t('numerology.tag')}</span>
            <h1 className="hero-text mb-4">{t('numerology.title')}</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {t('numerology.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-6 sm:p-8 max-w-md mx-auto mb-12"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('numerology.nameLabel')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('numerology.namePlaceholder')}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t('numerology.dobLabel')}</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/40 transition-colors [color-scheme:dark]"
                />
              </div>
              <PremiumButton
                className="w-full"
                size="lg"
                icon={<Calculator className="w-4 h-4" />}
                onClick={handleCalculate}
                disabled={!name.trim() || !dob}
              >
                {t('numerology.calculate')}
              </PremiumButton>
            </div>
          </motion.div>

          {calculated && result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="grid md:grid-cols-3 gap-6">
                <NumberCard
                  num={result.lifePath}
                  label={t('numerology.lifePathLabel')}
                  meaning={getLifePathMeaning(result.lifePath)}
                  color="bg-primary/10 text-primary-light"
                />
                <NumberCard
                  num={result.destiny}
                  label={t('numerology.destinyLabel')}
                  meaning={getDestinyMeaning(result.destiny)}
                  color="bg-accent/10 text-accent"
                />
                <NumberCard
                  num={result.soulUrge}
                  label={t('numerology.soulUrgeLabel')}
                  meaning={getSoulUrgeMeaning(result.soulUrge)}
                  color="bg-cyan-500/10 text-secondary"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-xl p-6 sm:p-8"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-light" />
                  {t('numerology.profileTitle')}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                    <Heart className="w-4 h-4 text-primary-light mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{t('numerology.lifePathResult', { n: result.lifePath })}</p>
                      <p className="text-xs text-muted-foreground">{getLifePathMeaning(result.lifePath).desc}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5">
                    <Briefcase className="w-4 h-4 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{t('numerology.destinyResult', { n: result.destiny })}</p>
                      <p className="text-xs text-muted-foreground">{getDestinyMeaning(result.destiny).desc}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/5 sm:col-span-2">
                    <Users className="w-4 h-4 text-secondary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{t('numerology.soulUrgeResult', { n: result.soulUrge })}</p>
                      <p className="text-xs text-muted-foreground">{getSoulUrgeMeaning(result.soulUrge).desc}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </PageContainer>
      </section>
      <Footer />
    </div>
  );
}
