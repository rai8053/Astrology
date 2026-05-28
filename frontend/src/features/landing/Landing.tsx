import { useEffect, useRef } from 'react';
import { Sparkles, Moon, Heart, Star, Globe, MessageCircle, ChevronDown, Check, ArrowRight, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PremiumButton } from '@/components/PremiumButton';
import { AnimatedSection } from '@/components/AnimatedSection';
import { useAuthStore } from '@/lib/store';

const easeOut = [0.25, 0.1, 0.25, 1] as const;
const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6, ease: easeOut } };

const staggerContainer = { animate: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } };
const staggerItem = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } } };

const features = [
  { icon: Sparkles, title: 'AI Birth Chart', desc: 'Instant Vedic birth chart with planetary positions, Nakshatra, and Dosha analysis.' },
  { icon: Moon, title: 'Daily Horoscope', desc: 'Personalized sidereal daily forecasts for all 12 Moon signs with AI insight.' },
  { icon: Heart, title: 'Compatibility', desc: 'Ashta Koota Gun Milan analysis for deep relationship matching.' },
  { icon: Star, title: 'Moon Phase Tracker', desc: 'Live Tithi tracking with spiritual significance and rituals.' },
  { icon: Globe, title: 'Multi-Language', desc: 'Support for English, Hindi, Bengali, and more languages.' },
  { icon: MessageCircle, title: 'AI Astrologer Chat', desc: 'Chat with an intelligent Vedic astrologer for personalized guidance.' },
];

const testimonials = [
  { name: 'Priya S.', text: 'The birth chart analysis was incredibly accurate. It helped me understand my career path and life purpose.', rating: 5, role: 'Yoga Teacher' },
  { name: 'Rahul K.', text: 'Compatibility matching helped me and my partner understand each other better. Highly recommended!', rating: 5, role: 'Software Engineer' },
  { name: 'Ananya M.', text: 'Daily horoscopes are remarkably precise. I check them every morning — it\'s become my daily ritual.', rating: 5, role: 'Artist' },
];

const faqs = [
  { q: 'How accurate is the AI astrology reading?', a: 'Our AI is trained on authentic Vedic astrology texts and continuously refined by expert astrologers. It provides highly personalized and accurate readings based on your exact birth details.' },
  { q: 'What is Ashta Koota Gun Milan?', a: 'It\'s a traditional Vedic compatibility system that scores relationships out of 36 points across 8 categories including temperament, health, and spiritual alignment.' },
  { q: 'Can I chat with a real astrologer?', a: 'Our AI astrologer provides instant guidance 24/7. Premium users get access to more detailed consultations and unlimited chats.' },
  { q: 'Is my birth data secure?', a: 'Yes, all data is encrypted end-to-end and never shared. We follow strict privacy practices compliant with data protection regulations.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, debit cards, and UPI payments through our secure payment partners.' },
];

function SectionLabel({ text }: { text: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="inline-block px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-[10px] font-sans font-bold uppercase tracking-[0.2em] mb-5"
    >
      {text}
    </motion.span>
  );
}

export function Landing() {
  const { isAuthenticated } = useAuthStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    document.title = 'Soma & Surya — AI-Powered Vedic Astrology Platform';
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* CINEMATIC HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-cosmic via-cosmic to-cosmic/98" />
          <div className="absolute inset-0 opacity-[0.15]" style={{
            backgroundImage: `
              radial-gradient(circle at 15% 50%, rgba(212,175,55,0.4) 0%, transparent 50%),
              radial-gradient(circle at 85% 30%, rgba(212,175,55,0.2) 0%, transparent 40%),
              radial-gradient(circle at 50% 80%, rgba(212,175,55,0.15) 0%, transparent 45%)
            `,
          }} />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,0.2) 0%, transparent 100%), radial-gradient(1.5px 1.5px at 60% 20%, rgba(255,255,255,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 80% 60%, rgba(255,255,255,0.2) 0%, transparent 100%), radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.15) 0%, transparent 100%), radial-gradient(1.5px 1.5px at 90% 40%, rgba(255,255,255,0.2) 0%, transparent 100%)',
            backgroundSize: '200px 200px',
          }} />
        </motion.div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block px-5 py-2 rounded-full bg-gold/[0.08] border border-gold/30 text-gold text-[10px] font-sans font-bold uppercase tracking-[0.25em] mb-8"
            >
              AI-Powered Vedic Astrology
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-[0.95] mb-6"
            >
              Discover Your
              <motion.span
                initial={{ backgroundPosition: '0% 50%' }}
                animate={{ backgroundPosition: '100% 50%' }}
                transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                className="block text-gradient mt-2"
                style={{ backgroundSize: '200% auto' }}
              >
                Cosmic Blueprint
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 font-sans leading-relaxed"
            >
              Ancient Vedic wisdom meets modern AI. Get personalized birth charts, daily horoscopes,
              compatibility analysis, and chat with an AI astrologer — all in one platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <PremiumButton size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                    Go to Dashboard
                  </PremiumButton>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <PremiumButton size="lg" icon={<Sparkles className="w-4 h-4" />}>
                      Start Free
                    </PremiumButton>
                  </Link>
                  <Link to="/login">
                    <PremiumButton variant="secondary" size="lg">
                      Sign In
                    </PremiumButton>
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-5 h-5 text-white/20" />
        </motion.div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <motion.div {...fadeUp} className="text-center mb-20">
            <SectionLabel text="Features" />
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mt-2">Everything You Need</h2>
            <p className="text-ink/50 dark:text-parchment/50 mt-4 max-w-xl mx-auto text-base">From birth charts to AI chat — the complete Vedic astrology toolkit</p>
          </motion.div>
          <motion.div {...staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="group relative p-7 rounded-xl glass-card hover:cosmic-glow transition-all duration-500"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors"
                  >
                    <f.icon className="w-5 h-5 text-gold" />
                  </motion.div>
                  <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-gold transition-colors">{f.title}</h3>
                  <p className="text-sm text-ink/50 dark:text-parchment/50 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.02] via-gold/[0.01] to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <motion.div {...fadeUp} className="text-center mb-20">
            <SectionLabel text="Testimonials" />
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mt-2">What Our Users Say</h2>
          </motion.div>
          <motion.div {...staggerContainer} className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                className="relative p-7 rounded-xl glass-card"
              >
                <Quote className="w-6 h-6 text-gold/30 mb-3" />
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <motion.span
                      key={j}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * j }}
                    >
                      <Star className="w-4 h-4 fill-gold text-gold" />
                    </motion.span>
                  ))}
                </div>
                <p className="text-sm text-ink/60 dark:text-parchment/60 italic mb-4 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="text-sm font-semibold font-serif">— {t.name}</p>
                  <p className="text-[10px] text-ink/40 dark:text-parchment/40 uppercase tracking-wider">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <motion.div {...fadeUp} className="text-center mb-20">
            <SectionLabel text="Pricing" />
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mt-2">Simple, Transparent Pricing</h2>
            <p className="text-ink/50 dark:text-parchment/50 mt-4">Start free, upgrade when you need more</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Free', price: '$0', features: ['Daily horoscope', 'Basic birth chart', 'Moon phase tracker'], highlighted: false },
              { name: 'Pro', price: '$9.99', features: ['Everything in Free', 'AI chat astrologer', 'Compatibility analysis', 'Detailed birth chart', 'Weekly predictions'], highlighted: true },
              { name: 'Premium', price: '$19.99', features: ['Everything in Pro', 'Unlimited AI chats', 'Numerology report', 'Tarot readings', 'Priority support'], highlighted: false },
              { name: 'Enterprise', price: '$49.99', features: ['Everything in Premium', 'API access', 'White-label reports', 'Dedicated astrologer', 'Custom integrations'], highlighted: false },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                whileHover={{ y: -6 }}
                className={`relative p-6 rounded-xl ${plan.highlighted ? 'gold-border cosmic-glow bg-gradient-to-b from-gold/[0.05] to-transparent' : 'glass-card'} transition-all duration-500`}
              >
                {plan.highlighted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-gold to-amber-400 text-cosmic text-[9px] font-sans font-bold uppercase tracking-[0.15em] rounded-full shadow-lg shadow-gold/20"
                  >
                    Popular
                  </motion.div>
                )}
                <h3 className="font-serif text-2xl font-bold mb-1">{plan.name}</h3>
                <p className="text-3xl font-bold mb-6">
                  {plan.price}
                  <span className="text-sm font-normal text-ink/40 dark:text-parchment/40">/mo</span>
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <motion.li
                      key={j}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: j * 0.05 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                      <span className="text-ink/60 dark:text-parchment/60">{f}</span>
                    </motion.li>
                  ))}
                </ul>
                <Link to="/register">
                  <PremiumButton variant={plan.highlighted ? 'primary' : 'ghost'} className="w-full">
                    {plan.name === 'Free' ? 'Get Started' : 'Subscribe'}
                  </PremiumButton>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-28 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
          <motion.div {...fadeUp} className="text-center mb-16">
            <SectionLabel text="FAQ" />
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mt-2">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((item, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group p-5 rounded-xl glass-card cursor-pointer"
              >
                <summary className="flex items-center justify-between font-serif text-lg font-semibold list-none">
                  <span>{item.q}</span>
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform duration-300 text-gold" />
                  </motion.div>
                </summary>
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 text-sm text-ink/50 dark:text-parchment/50 leading-relaxed"
                >
                  {item.a}
                </motion.p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cosmic via-cosmic to-cosmic-deeper" />
        <div className="absolute inset-0 opacity-[0.12]" style={{
          backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(212,175,55,0.5) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(212,175,55,0.2) 0%, transparent 40%)',
        }} />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div {...fadeUp}>
            <motion.h2
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4"
              style={{ background: 'linear-gradient(90deg, #fff, #d4af37, #fff)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Ready to Discover Your Path?
            </motion.h2>
            <p className="text-lg text-white/50 mb-10 max-w-lg mx-auto">
              Join thousands who have found clarity through ancient Vedic wisdom.
            </p>
            <Link to="/register">
              <PremiumButton size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                Get Started Free
              </PremiumButton>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
