import { useEffect } from 'react';
import { Sparkles, Moon, Heart, Star, Globe, Shield, MessageCircle, BarChart3, ArrowRight, Check, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store';

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

const features = [
  { icon: Sparkles, title: 'AI Birth Chart', desc: 'Instant Vedic birth chart with planetary positions, Nakshatra, and Dosha analysis.' },
  { icon: Moon, title: 'Daily Horoscope', desc: 'Personalized sidereal daily forecasts for all 12 Moon signs.' },
  { icon: Heart, title: 'Compatibility', desc: 'Ashta Koota Gun Milan analysis for relationship matching.' },
  { icon: Star, title: 'Moon Phase Tracker', desc: 'Live Tithi tracking with spiritual significance and rituals.' },
  { icon: Globe, title: 'Multi-Language', desc: 'Support for English, Hindi, Bengali, and more languages.' },
  { icon: MessageCircle, title: 'AI Astrologer Chat', desc: 'Chat with an AI Vedic astrologer for personalized guidance.' },
];

const testimonials = [
  { name: 'Priya S.', text: 'The birth chart analysis was incredibly accurate. It helped me understand my career path.', rating: 5 },
  { name: 'Rahul K.', text: 'Compatibility matching helped me and my partner understand each other better. Highly recommended!', rating: 5 },
  { name: 'Ananya M.', text: 'Daily horoscopes are remarkably precise. I check them every morning now.', rating: 5 },
];

const faqs = [
  { q: 'How accurate is the AI astrology reading?', a: 'Our AI is trained on authentic Vedic astrology texts and continuously refined by expert astrologers. It provides highly personalized and accurate readings based on your exact birth details.' },
  { q: 'What is Ashta Koota Gun Milan?', a: 'It\'s a traditional Vedic compatibility system that scores relationships out of 36 points across 8 categories including temperament, health, and spiritual alignment.' },
  { q: 'Can I chat with a real astrologer?', a: 'Our AI astrologer provides instant guidance 24/7. Premium users get access to more detailed consultations.' },
  { q: 'Is my birth data secure?', a: 'Yes, all data is encrypted and never shared. We follow strict privacy practices compliant with data protection regulations.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, debit cards, and UPI payments through our secure payment partners.' },
];

export function Landing() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    document.title = 'Soma & Surya — AI-Powered Vedic Astrology Platform';
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cosmic via-cosmic to-cosmic/95" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(212,175,55,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(212,175,55,0.1) 0%, transparent 50%)' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div {...fadeUp}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-sans font-semibold uppercase tracking-widest mb-6">
              AI-Powered Vedic Astrology
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-tight mb-6">
              Discover Your
              <span className="text-gradient block">Cosmic Blueprint</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 font-sans leading-relaxed">
              Ancient Vedic wisdom meets modern AI. Get personalized birth charts, daily horoscopes,
              compatibility analysis, and chat with an AI astrologer — all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="lg" className="bg-gold text-cosmic hover:bg-gold/90">
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="bg-gold text-cosmic hover:bg-gold/90">
                      Start Free <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/30" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-parchment dark:bg-cosmic">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="text-gold text-xs font-sans font-semibold uppercase tracking-widest">Features</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mt-2">Everything You Need</h2>
            <p className="text-ink/60 dark:text-parchment/60 mt-3 max-w-xl mx-auto">From birth charts to AI chat — complete Vedic astrology toolkit</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-xl border border-ink/10 dark:border-white/10 hover:border-gold/50 transition-all duration-300 bg-white dark:bg-cosmic-light/50 hover:shadow-lg hover:shadow-gold/5"
              >
                <f.icon className="w-8 h-8 text-gold mb-4" />
                <h3 className="font-serif text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-ink/60 dark:text-parchment/60 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-ink/5 dark:bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="text-gold text-xs font-sans font-semibold uppercase tracking-widest">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mt-2">What Our Users Say</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-white dark:bg-cosmic-light border border-ink/10 dark:border-white/10"
              >
                <div className="flex gap-1 mb-3">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-gold text-gold" />)}</div>
                <p className="text-sm text-ink/70 dark:text-parchment/70 italic mb-4">"{t.text}"</p>
                <p className="text-sm font-semibold font-serif">— {t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-parchment dark:bg-cosmic">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="text-gold text-xs font-sans font-semibold uppercase tracking-widest">Pricing</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mt-2">Simple, Transparent Pricing</h2>
            <p className="text-ink/60 dark:text-parchment/60 mt-3">Start free, upgrade when you need more</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Free', price: '$0', features: ['Daily horoscope', 'Basic birth chart', 'Moon phase tracker'], highlighted: false },
              { name: 'Pro', price: '$9.99', features: ['Everything in Free', 'AI chat astrologer', 'Compatibility analysis', 'Detailed birth chart', 'Weekly predictions'], highlighted: true },
              { name: 'Premium', price: '$19.99', features: ['Everything in Pro', 'Unlimited AI chats', 'Numerology report', 'Tarot readings', 'Priority support'], highlighted: false },
              { name: 'Enterprise', price: '$49.99', features: ['Everything in Premium', 'API access', 'White-label reports', 'Dedicated astrologer', 'Custom integrations'], highlighted: false },
            ].map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-xl border ${plan.highlighted ? 'border-gold bg-gold/5 shadow-lg shadow-gold/10' : 'border-ink/10 dark:border-white/10 bg-white dark:bg-cosmic-light/50'} relative`}
              >
                {plan.highlighted && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gold text-cosmic text-[10px] font-sans font-bold uppercase tracking-widest rounded-full">Popular</span>}
                <h3 className="font-serif text-2xl font-bold mb-1">{plan.name}</h3>
                <p className="text-3xl font-bold mb-6">{plan.price}<span className="text-sm font-normal text-ink/50 dark:text-parchment/50">/mo</span></p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                      <span className="text-ink/70 dark:text-parchment/70">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button variant={plan.highlighted ? 'primary' : 'secondary'} className="w-full">
                    {plan.name === 'Free' ? 'Get Started' : 'Subscribe'}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-ink/5 dark:bg-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="text-gold text-xs font-sans font-semibold uppercase tracking-widest">FAQ</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mt-2">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((item, i) => (
              <motion.details key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group p-4 rounded-xl border border-ink/10 dark:border-white/10 bg-white dark:bg-cosmic-light/30 cursor-pointer"
              >
                <summary className="flex items-center justify-between font-serif text-lg font-semibold list-none">
                  {item.q}
                  <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-sm text-ink/60 dark:text-parchment/60 leading-relaxed">{item.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-cosmic to-cosmic-light relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.4) 0%, transparent 60%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Ready to Discover Your Path?</h2>
            <p className="text-lg text-white/60 mb-8">Join thousands who have found clarity through ancient Vedic wisdom.</p>
            <Link to="/register">
              <Button size="lg" className="bg-gold text-cosmic hover:bg-gold/90">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
