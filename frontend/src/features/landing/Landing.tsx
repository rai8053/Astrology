import { useRef, useState, useEffect } from 'react';
import { Sparkles, Moon, Heart, Star, Globe, MessageCircle, ArrowRight, Shield, Zap, Users, Check, Quote, ChevronDown, Sun, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PremiumButton } from '@/components/PremiumButton';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { useAuthStore } from '@/lib/store';
import { easeOut } from '@/lib/animations';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: easeOut },
};

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  viewport: { once: true, margin: '-60px' },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
  viewport: { once: true },
};

function SectionTag({ children }: { children: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="tag mb-5 inline-block"
    >
      {children}
    </motion.span>
  );
}

function SectionHeading({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-balance ${className}`}>
      {children}
    </h2>
  );
}

function SectionSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-base sm:text-lg text-text-secondary dark:text-dark-text-secondary max-w-xl mx-auto text-balance">
      {children}
    </p>
  );
}

const features = [
  {
    icon: Star,
    title: 'AI Birth Chart',
    desc: 'Instant Vedic birth chart with planetary positions, Nakshatra, and Dosha analysis. AI-enhanced readings with mathematical fallback.',
  },
  {
    icon: Moon,
    title: 'Daily Horoscope',
    desc: 'Personalized sidereal daily forecasts for all 12 Moon signs. Five categories with energy levels and Vedic remedies.',
  },
  {
    icon: Heart,
    title: 'Compatibility',
    desc: 'Ashta Koota Gun Milan analysis — 36-point Vedic matching across 8 dimensions with AI-powered insights.',
  },
  {
    icon: Globe,
    title: 'Moon Phase Tracker',
    desc: 'Live Tithi tracking with 30 Vedic lunar days, spiritual significance, and next Purnima/Amavasya dates.',
  },
  {
    icon: MessageCircle,
    title: 'AI Astrologer',
    desc: 'Chat with an intelligent AI astrologer. Context-aware conversations with 7 AI provider fallback.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    desc: 'JWT auth with refresh token rotation, bcrypt encryption, rate limiting, and Stripe-powered subscriptions.',
  },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    text: 'The birth chart analysis was remarkably accurate. It helped me understand my career trajectory in ways I never expected.',
    role: 'Yoga Teacher',
    initials: 'PS',
  },
  {
    name: 'Rahul Kapoor',
    text: 'My partner and I used the compatibility matching before our wedding. The insights were profound and helped us communicate better.',
    role: 'Software Engineer',
    initials: 'RK',
  },
  {
    name: 'Ananya Mehta',
    text: 'I check my daily horoscope every morning now. The AI chat feature feels like talking to a real astrologer who actually understands.',
    role: 'Visual Artist',
    initials: 'AM',
  },
];

const faqs = [
  { q: 'How accurate is the AI astrology reading?', a: 'Our AI is trained on authentic Vedic astrology texts and uses the sidereal (Lahiri) system. Every reading combines mathematical calculations with AI-generated insights, with automatic fallback to pure calculation if needed.' },
  { q: 'What is Ashta Koota Gun Milan?', a: 'A traditional Vedic compatibility system scoring relationships out of 36 points across 8 categories: Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi. Each category examines a different aspect of compatibility.' },
  { q: 'How does the AI chat work?', a: 'Our AI astrologer uses context-aware conversations — it remembers your last 10 messages. It\'s powered by 7 AI providers with automatic fallback, so you always get a response. Premium users get unlimited chats.' },
  { q: 'Is my birth data secure?', a: 'Yes. All data is encrypted end-to-end. We use JWT authentication with rotating refresh tokens. Your birth details are never shared with third parties.' },
  { q: 'Can I switch plans?', a: 'Yes, upgrade or downgrade anytime. Changes take effect immediately. Paid plans come with a 7-day free trial — no credit card required to start.' },
];

function DashboardPreview() {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative rounded-2xl card-border overflow-hidden bg-bg-primary dark:bg-dark-bg-secondary shadow-xl shadow-black/5 dark:shadow-black/20"
      >
        <div className="flex items-center gap-1.5 px-5 py-3 border-b border-border-primary dark:border-dark-border-primary bg-bg-secondary dark:bg-dark-bg-tertiary/50">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
          <span className="ml-3 text-[11px] text-text-tertiary dark:text-dark-text-tertiary font-mono">dashboard</span>
        </div>
        <div className="p-5 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider font-medium">Good Morning</p>
              <p className="text-lg font-semibold tracking-tight mt-0.5">Welcome back, seeker</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-[11px] font-medium">Free Plan</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Reports', value: '12' },
              { label: 'Chat Sessions', value: '48' },
              { label: 'Active Plan', value: 'Free' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="rounded-xl card-border bg-bg-primary dark:bg-dark-bg-secondary p-4"
              >
                <p className="text-[11px] text-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold tracking-tight mt-1">{stat.value}</p>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Daily Horoscope', 'Birth Chart', 'Compatibility', 'AI Chat'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.06 }}
                className="rounded-xl card-border bg-bg-primary dark:bg-dark-bg-secondary p-4 hover:border-accent/20 transition-colors cursor-default"
              >
                <p className="text-[13px] font-medium">{item}</p>
                <p className="text-[11px] text-text-tertiary dark:text-dark-text-tertiary mt-0.5">Get started</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function Landing() {
  const { isAuthenticated } = useAuthStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
      <Navbar />

      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent" />
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 40%, rgba(212,175,55,0.06) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(212,175,55,0.04) 0%, transparent 40%),
              radial-gradient(circle at 50% 80%, rgba(212,175,55,0.03) 0%, transparent 45%)
            `,
          }} />
        </motion.div>

        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 text-center pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut }}
          >
            <motion.span
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="tag mb-8 inline-block"
            >
              AI-Powered Vedic Astrology
            </motion.span>

            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-sans font-bold tracking-[-0.03em] leading-[0.92] mb-5 text-balance">
              Discover Your
              <br />
              <span className="accent-gradient inline-block mt-2">Cosmic Blueprint</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto mb-10 text-balance leading-relaxed">
              Ancient Vedic wisdom meets modern AI. Get personalized birth charts, daily horoscopes,
              compatibility analysis, and chat with an AI astrologer.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
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
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-text-tertiary dark:text-dark-text-tertiary"
            >
              <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> Encrypted</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Instant</span>
              <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> 1,250+ Users</span>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-4 h-4 text-text-tertiary dark:text-dark-text-tertiary" />
        </motion.div>
      </section>

      {/* ===== METRICS ===== */}
      <section className="py-20 border-y border-border-primary dark:border-dark-border-primary">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: 1250, suffix: '+', label: 'Birth Charts Generated' },
              { value: 8400, suffix: '+', label: 'AI Conversations' },
              { value: 3600, suffix: '+', label: 'Compatibility Checks' },
              { value: 98, suffix: '%', label: 'Satisfaction Rate' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary dark:text-dark-text-primary">
                  <AnimatedCounter to={stat.value} suffix={stat.suffix} duration={2} delay={i * 0.2} />
                </div>
                <p className="mt-1.5 text-xs sm:text-sm text-text-tertiary dark:text-dark-text-tertiary font-medium tracking-wide">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="section-padding">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div {...fadeUp} className="text-center mb-16 md:mb-20">
            <SectionTag>Features</SectionTag>
            <SectionHeading>Everything You Need</SectionHeading>
            <SectionSubtitle>
              From birth charts to AI chat &mdash; the complete Vedic astrology toolkit in one platform.
            </SectionSubtitle>
          </motion.div>

          <motion.div {...stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="card-border card-hover rounded-xl p-6 bg-bg-primary dark:bg-dark-bg-secondary"
              >
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <f.icon className="w-4.5 h-4.5 text-accent" />
                </div>
                <h3 className="text-base font-semibold tracking-tight mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== PRODUCT SHOWCASE ===== */}
      <section className="section-padding bg-bg-secondary dark:bg-dark-bg-secondary/50 border-y border-border-primary dark:border-dark-border-primary">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <SectionTag>Dashboard</SectionTag>
            <SectionHeading>Beautiful by Design</SectionHeading>
            <SectionSubtitle>
              A cinematic experience crafted for clarity and joy. Dark mode included.
            </SectionSubtitle>
          </motion.div>

          <DashboardPreview />
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div {...fadeUp} className="text-center mb-16 md:mb-20">
            <SectionTag>Testimonials</SectionTag>
            <SectionHeading>Trusted by Seekers</SectionHeading>
            <SectionSubtitle>
              Join thousands who have found clarity through ancient Vedic wisdom.
            </SectionSubtitle>
          </motion.div>

          <motion.div {...stagger} className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="card-border rounded-xl p-6 bg-bg-primary dark:bg-dark-bg-secondary"
              >
                <Quote className="w-5 h-5 text-accent/40 mb-3" />
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary leading-relaxed mb-5">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-semibold text-accent">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">{t.name}</p>
                    <p className="text-[11px] text-text-tertiary dark:text-dark-text-tertiary">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <PricingSection />

      {/* ===== FAQ ===== */}
      <section id="faq" className="section-padding bg-bg-secondary dark:bg-dark-bg-secondary/50 border-y border-border-primary dark:border-dark-border-primary">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <SectionTag>FAQ</SectionTag>
            <SectionHeading>Frequently Asked Questions</SectionHeading>
            <SectionSubtitle>
              Everything you need to know about Soma &amp; Surya.
            </SectionSubtitle>
          </motion.div>

          <div className="divide-y divide-border-primary dark:divide-dark-border-primary">
            {faqs.map((item, i) => (
              <FaqItem key={i} question={item.q} answer={item.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section-padding">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 text-center">
          <motion.div {...fadeUp}>
            <SectionTag>Get Started</SectionTag>
            <SectionHeading className="mb-4">Ready to Discover Your Path?</SectionHeading>
            <p className="text-base sm:text-lg text-text-secondary dark:text-dark-text-secondary mb-8 max-w-md mx-auto text-balance">
              Join thousands who have found clarity through ancient Vedic wisdom and modern AI.
            </p>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <PremiumButton size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                  Go to Dashboard
                </PremiumButton>
              </Link>
            ) : (
              <Link to="/register">
                <PremiumButton size="lg" icon={<Sparkles className="w-4 h-4" />}>
                  Start Free &mdash; No Credit Card
                </PremiumButton>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-5 text-left group"
      >
        <span className="text-sm sm:text-base font-medium pr-4">{question}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-text-tertiary dark:text-dark-text-tertiary transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{
          height: open ? 'auto' : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: easeOut }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-sm text-text-secondary dark:text-dark-text-secondary leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </motion.div>
  );
}

function PricingSection() {
  const [yearly, setYearly] = useState(false);

  const plans = [
    {
      name: 'Free', price: 0, desc: 'Get started with daily guidance',
      features: ['Daily horoscope', 'Basic birth chart', 'Moon phase tracker', '5 AI chat credits'],
      cta: 'Get Started', highlighted: false,
    },
    {
      name: 'Pro', price: 9.99, desc: 'For serious seekers of cosmic wisdom',
      features: ['Everything in Free', 'AI chat astrologer', 'Compatibility analysis', 'Detailed birth chart', 'Weekly predictions'],
      cta: 'Subscribe', highlighted: true,
    },
    {
      name: 'Premium', price: 19.99, desc: 'The complete spiritual companion',
      features: ['Everything in Pro', 'Unlimited AI chats', 'Numerology report', 'Tarot readings', 'Priority support'],
      cta: 'Subscribe', highlighted: false,
    },
    {
      name: 'Enterprise', price: 49.99, desc: 'For studios and professionals',
      features: ['Everything in Premium', 'API access', 'White-label reports', 'Dedicated support', 'Custom integrations'],
      cta: 'Contact Us', highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="section-padding">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div {...fadeUp} className="text-center mb-16">
          <SectionTag>Pricing</SectionTag>
          <SectionHeading>Simple, Transparent Pricing</SectionHeading>
          <SectionSubtitle>
            Start free. Upgrade when you need more.
          </SectionSubtitle>
        </motion.div>

        <div className="flex items-center justify-center gap-3 mb-12">
          <motion.span
            animate={{ color: yearly ? 'var(--tw-text-tertiary)' : 'var(--tw-text-primary)' }}
            className="text-sm text-text-primary dark:text-dark-text-primary font-medium"
          >
            Monthly
          </motion.span>
          <button
            onClick={() => setYearly(!yearly)}
            className="relative w-12 h-6 rounded-full bg-border-primary dark:bg-dark-border-primary transition-colors"
          >
            <motion.div
              animate={{ x: yearly ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 rounded-full bg-accent shadow-sm"
            />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-primary dark:text-dark-text-primary font-medium">Yearly</span>
            <span className="px-2 py-0.5 text-[10px] font-medium bg-accent/10 text-accent border border-accent/20 rounded-full">
              Save ~17%
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {plans.map((plan, i) => {
            const displayPrice = yearly ? (plan.price * 10).toFixed(2) : plan.price.toFixed(2);
            return (
              <motion.div
                key={`${plan.name}-${yearly}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className={`relative rounded-xl p-6 flex flex-col transition-all duration-300 ${
                  plan.highlighted
                    ? 'card-border bg-accent/5 dark:bg-dark-accent-subtle border-accent/30 dark:border-dark-accent/30 shadow-sm'
                    : 'card-border bg-bg-primary dark:bg-dark-bg-secondary'
                }`}
              >
                {plan.highlighted && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-white text-[10px] font-medium rounded-full whitespace-nowrap shadow-sm"
                  >
                    Most Popular
                  </motion.span>
                )}

                <h3 className="text-lg font-semibold tracking-tight mb-1">{plan.name}</h3>
                <p className="text-xs text-text-tertiary dark:text-dark-text-tertiary mb-5 min-h-[2rem]">{plan.desc}</p>

                <div className="mb-5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={String(yearly)}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-baseline gap-0.5"
                    >
                      <span className="text-3xl sm:text-4xl font-bold tracking-tight">
                        {plan.price === 0 ? 'Free' : `$${displayPrice}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-xs text-text-tertiary dark:text-dark-text-tertiary ml-1">
                          /{yearly ? 'yr' : 'mo'}
                        </span>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <ul className="flex-1 space-y-2.5 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs sm:text-sm">
                      <Check className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                      <span className="text-text-secondary dark:text-dark-text-secondary">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link to={plan.price === 0 ? '/register' : '/register?plan=' + plan.name.toLowerCase()}>
                  <PremiumButton
                    variant={plan.highlighted ? 'primary' : plan.price === 0 ? 'secondary' : 'ghost'}
                    className="w-full"
                  >
                    {plan.cta}
                  </PremiumButton>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
