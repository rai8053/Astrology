import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageContainer } from '@/components/layout/PageContainer';
import { Sun, Moon, Globe, Sparkles, Clock } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAstrology } from '@/hooks/useAstrology';
import { RASHIS } from '@/lib/utils';
import { getAstrologyLabel } from '@/lib/astrologyLocales';

const planetData = [
  { key: 'Sun', signKey: 'Mithun', degree: "14° 23'", icon: Sun, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { key: 'Moon', signKey: 'Kanya', degree: "8° 47'", icon: Moon, color: 'text-sky-400', bg: 'bg-sky-400/10' },
  { key: 'Mercury', signKey: 'Vrishabh', degree: "22° 15'", icon: Globe, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { key: 'Venus', signKey: 'Kark', degree: "5° 38'", icon: Sparkles, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  { key: 'Mars', signKey: 'Simha', degree: "19° 52'", icon: Sun, color: 'text-red-400', bg: 'bg-red-400/10' },
  { key: 'Jupiter', signKey: 'Mesh', degree: "11° 06'", icon: Globe, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { key: 'Saturn', signKey: 'Meen', degree: "27° 44'", icon: Globe, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
];

const transitEvents = [
  { date: 'Jun 15', titleKey: 'transits.newMoonGemini', descKey: 'transits.newMoonGeminiDesc', type: 'major' as const },
  { date: 'Jun 18', titleKey: 'transits.mercuryCancer', descKey: 'transits.mercuryCancerDesc', type: 'minor' as const },
  { date: 'Jun 21', titleKey: 'transits.summerSolstice', descKey: 'transits.summerSolsticeDesc', type: 'major' as const },
  { date: 'Jun 25', titleKey: 'transits.venusTrineJupiter', descKey: 'transits.venusTrineJupiterDesc', type: 'minor' as const },
  { date: 'Jun 29', titleKey: 'transits.fullMoonCapricorn', descKey: 'transits.fullMoonCapricornDesc', type: 'major' as const },
  { date: 'Jul 2', titleKey: 'transits.marsSquareUranus', descKey: 'transits.marsSquareUranusDesc', type: 'major' as const },
];

export function TransitsPage() {
  const { t } = useTranslation();
  const { getPlanetName, getZodiacName } = useAstrology();

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
            <span className="tag mb-4 inline-block">{t('transits.tag') || 'Celestial Transits'}</span>
            <h1 className="hero-text mb-4">{t('transits.title') || 'Planetary Movements'}</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {t('transits.subtitle') || 'Track current planetary positions and upcoming transit events.'}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5 text-primary-light" />
                {t('transits.positions') || 'Current Planetary Positions'}
              </h2>
              <div className="space-y-3">
                {planetData.map((p, i) => (
                  <motion.div
                    key={p.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="glass-card rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className={`w-10 h-10 rounded-lg ${p.bg} flex items-center justify-center`}>
                      <p.icon className={`w-5 h-5 ${p.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{getPlanetName(p.key)}</p>
                      <p className="text-xs text-muted-foreground">{getZodiacName(p.signKey)} · {p.degree}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-light" />
                {t('transits.upcoming') || 'Upcoming Transits'}
              </h2>
              <div className="relative">
                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
                <div className="space-y-6">
                  {transitEvents.map((tEvent, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      className="relative flex gap-4"
                    >
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tEvent.type === 'major' ? 'bg-accent/10' : 'bg-primary/10'}`}>
                        <div className={`w-2 h-2 rounded-full ${tEvent.type === 'major' ? 'bg-accent' : 'bg-primary-light'}`} />
                      </div>
                      <div className="glass-card rounded-xl p-4 flex-1">
                        <span className="text-[10px] font-bold tracking-wider text-primary-lighter uppercase">{tEvent.date}</span>
                        <h3 className="text-sm font-semibold mt-1">{t(tEvent.titleKey)}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{t(tEvent.descKey)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </PageContainer>
      </section>
      <Footer />
    </div>
  );
}
