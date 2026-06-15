import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageContainer } from '@/components/layout/PageContainer';
import { Sun, Moon, Globe, Sparkles, Clock } from 'lucide-react';

const planets = [
  { name: 'Sun', sign: 'Gemini', degree: '14° 23\'', icon: Sun, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { name: 'Moon', sign: 'Virgo', degree: '8° 47\'', icon: Moon, color: 'text-sky-400', bg: 'bg-sky-400/10' },
  { name: 'Mercury', sign: 'Taurus', degree: '22° 15\'', icon: Globe, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { name: 'Venus', sign: 'Cancer', degree: '5° 38\'', icon: Sparkles, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  { name: 'Mars', sign: 'Leo', degree: '19° 52\'', icon: Sun, color: 'text-red-400', bg: 'bg-red-400/10' },
  { name: 'Jupiter', sign: 'Aries', degree: '11° 06\'', icon: Globe, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { name: 'Saturn', sign: 'Pisces', degree: '27° 44\'', icon: Globe, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
];

const transits = [
  { date: 'Jun 15', title: 'New Moon in Gemini', desc: 'A fresh start for communication and intellectual pursuits', type: 'major' as const },
  { date: 'Jun 18', title: 'Mercury enters Cancer', desc: 'Emotional communication takes center stage', type: 'minor' as const },
  { date: 'Jun 21', title: 'Summer Solstice', desc: 'The longest day brings powerful solar energy', type: 'major' as const },
  { date: 'Jun 25', title: 'Venus trine Jupiter', desc: 'A harmonious aspect for love and abundance', type: 'minor' as const },
  { date: 'Jun 29', title: 'Full Moon in Capricorn', desc: 'Culmination of career and ambition themes', type: 'major' as const },
  { date: 'Jul 2', title: 'Mars square Uranus', desc: 'Unexpected disruptions require adaptability', type: 'major' as const },
];

export function TransitsPage() {
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
            <span className="tag mb-4 inline-block">Celestial Transits</span>
            <h1 className="hero-text mb-4">Planetary Movements</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Track current planetary positions and upcoming transit events.
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
                Current Planetary Positions
              </h2>
              <div className="space-y-3">
                {planets.map((p, i) => (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="glass-card rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className={`w-10 h-10 rounded-lg ${p.bg} flex items-center justify-center`}>
                      <p.icon className={`w-5 h-5 ${p.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sign} · {p.degree}</p>
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
                Upcoming Transits
              </h2>
              <div className="relative">
                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
                <div className="space-y-6">
                  {transits.map((t, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      className="relative flex gap-4"
                    >
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.type === 'major' ? 'bg-accent/10' : 'bg-primary/10'}`}>
                        <div className={`w-2 h-2 rounded-full ${t.type === 'major' ? 'bg-accent' : 'bg-primary-light'}`} />
                      </div>
                      <div className="glass-card rounded-xl p-4 flex-1">
                        <span className="text-[10px] font-bold tracking-wider text-primary-lighter uppercase">{t.date}</span>
                        <h3 className="text-sm font-semibold mt-1">{t.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
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
