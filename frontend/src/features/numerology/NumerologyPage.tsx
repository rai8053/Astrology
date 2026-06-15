import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageContainer } from '@/components/layout/PageContainer';
import { PremiumButton } from '@/components/PremiumButton';
import { Sparkles, Calculator, Heart, Briefcase, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const numberMeanings: Record<number, { title: string; desc: string; traits: string[] }> = {
  1: { title: 'The Pioneer', desc: 'Independent, creative, and ambitious. You are a natural leader who thrives on innovation.', traits: ['Leadership', 'Independence', 'Creativity', 'Determination'] },
  2: { title: 'The Diplomat', desc: 'Cooperative, balanced, and intuitive. You excel at building bridges and fostering harmony.', traits: ['Diplomacy', 'Cooperation', 'Intuition', 'Patience'] },
  3: { title: 'The Creator', desc: 'Expressive, optimistic, and charismatic. Your creativity and joy inspire those around you.', traits: ['Creativity', 'Expression', 'Optimism', 'Charm'] },
  4: { title: 'The Builder', desc: 'Practical, disciplined, and reliable. You create lasting foundations through hard work.', traits: ['Reliability', 'Discipline', 'Practicality', 'Honesty'] },
  5: { title: 'The Adventurer', desc: 'Freedom-loving, versatile, and curious. You thrive on change and new experiences.', traits: ['Adaptability', 'Curiosity', 'Freedom', 'Versatility'] },
  6: { title: 'The Nurturer', desc: 'Caring, responsible, and compassionate. You are the heart of your community.', traits: ['Nurturing', 'Responsibility', 'Compassion', 'Harmony'] },
  7: { title: 'The Seeker', desc: 'Analytical, spiritual, and wise. You seek truth and deeper understanding of life.', traits: ['Wisdom', 'Analysis', 'Spirituality', 'Introspection'] },
  8: { title: 'The Achiever', desc: 'Ambitious, efficient, and driven. You are built for success and material mastery.', traits: ['Ambition', 'Efficiency', 'Authority', 'Success'] },
  9: { title: 'The Humanitarian', desc: 'Compassionate, generous, and visionary. You want to make the world a better place.', traits: ['Compassion', 'Generosity', 'Vision', 'Humanitarianism'] },
  11: { title: 'The Visionary', desc: 'Highly intuitive, inspired, and enlightened. You have a profound spiritual connection.', traits: ['Intuition', 'Inspiration', 'Enlightenment', 'Sensitivity'] },
  22: { title: 'The Master Builder', desc: 'Visionary with practical power. You can turn dreams into reality on a grand scale.', traits: ['Vision', 'Practicality', 'Leadership', 'Manifestation'] },
  33: { title: 'The Master Teacher', desc: 'Compassionate wisdom elevated. You are here to uplift and teach humanity.', traits: ['Wisdom', 'Compassion', 'Teaching', 'Healing'] },
  0:   { title: 'Unknown', desc: 'Unable to calculate. Please check your input.', traits: [] },
};

const fallbackMeaning = { title: 'Unknown', desc: 'Unable to calculate.', traits: [] };
const fallbackDestiny = { title: 'Unknown', desc: 'Unable to calculate.' };
const fallbackSoul = { title: 'Unknown', desc: 'Unable to calculate.' };

const numberMeaningsDestiny: Record<number, { title: string; desc: string }> = {
  1: { title: 'Leader', desc: 'Your destiny is to take initiative and lead others through innovation.' },
  2: { title: 'Peacemaker', desc: 'Your path involves building bridges and creating harmony.' },
  3: { title: 'Communicator', desc: 'You are destined to express, create, and inspire through words.' },
  4: { title: 'Organizer', desc: 'Building lasting systems and structures is your life\'s work.' },
  5: { title: 'Explorer', desc: 'Freedom and adventure define your journey through life.' },
  6: { title: 'Guardian', desc: 'Nurturing and protecting others is your sacred calling.' },
  7: { title: 'Sage', desc: 'Your destiny is to seek and share profound wisdom.' },
  8: { title: 'Magnate', desc: 'Achieving material success and wielding power is your path.' },
  9: { title: 'Healer', desc: 'Your life mission involves healing and serving humanity.' },
};

const numberMeaningsSoul: Record<number, { title: string; desc: string }> = {
  1: { title: 'Ambition', desc: 'Your soul craves achievement and self-expression.' },
  2: { title: 'Connection', desc: 'Your deepest desire is for love and partnership.' },
  3: { title: 'Expression', desc: 'Your soul yearns to create and communicate joy.' },
  4: { title: 'Stability', desc: 'You seek security, order, and a solid foundation.' },
  5: { title: 'Freedom', desc: 'Your inner self longs for adventure and liberation.' },
  6: { title: 'Harmony', desc: 'Your soul desires beauty, family, and responsibility.' },
  7: { title: 'Wisdom', desc: 'You seek truth, knowledge, and spiritual understanding.' },
  8: { title: 'Power', desc: 'Your soul is driven to achieve mastery and abundance.' },
  9: { title: 'Compassion', desc: 'Your innermost desire is to serve and heal others.' },
};

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
            <span className="tag mb-4 inline-block">Numerology</span>
            <h1 className="hero-text mb-4">Discover Your Numbers</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Calculate your Life Path, Destiny, and Soul Urge numbers to unlock the secrets of your cosmic identity.
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
                <label className="block text-sm font-medium text-foreground mb-1.5">Your Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Date of Birth</label>
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
                Calculate My Numbers
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
                  label="Life Path Number"
                  meaning={numberMeanings[result.lifePath] || fallbackMeaning}
                  color="bg-primary/10 text-primary-light"
                />
                <NumberCard
                  num={result.destiny}
                  label="Destiny Number"
                  meaning={numberMeaningsDestiny[result.destiny] || fallbackDestiny}
                  color="bg-accent/10 text-accent"
                />
                <NumberCard
                  num={result.soulUrge}
                  label="Soul Urge Number"
                  meaning={numberMeaningsSoul[result.soulUrge] || fallbackSoul}
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
                  Your Numerology Profile
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                    <Heart className="w-4 h-4 text-primary-light mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Life Path: {result.lifePath}</p>
                      <p className="text-xs text-muted-foreground">{(numberMeanings[result.lifePath] || fallbackMeaning).desc}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5">
                    <Briefcase className="w-4 h-4 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Destiny: {result.destiny}</p>
                      <p className="text-xs text-muted-foreground">{(numberMeaningsDestiny[result.destiny] || fallbackDestiny).desc}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/5 sm:col-span-2">
                    <Users className="w-4 h-4 text-secondary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Soul Urge: {result.soulUrge}</p>
                      <p className="text-xs text-muted-foreground">{(numberMeaningsSoul[result.soulUrge] || fallbackSoul).desc}</p>
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
