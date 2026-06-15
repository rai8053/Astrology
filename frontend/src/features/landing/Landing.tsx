import { useRef, useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { Sparkles, Moon, Heart, Star, Globe, MessageCircle, ArrowRight, Shield, Zap, Users, Check, Quote, ChevronDown, Sun, Menu, X, Compass, Gem, Eye, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { getDetectedCountry, getCurrencyInfo, getPlans, formatPrice, REGIONAL_PRICING, setManualCountryOverride } from '@/lib/pricing';
import { getCountryName } from '@shared/config/pricing';
import { Footer } from '@/components/Footer';
import { PremiumButton } from '@/components/PremiumButton';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { easeOut } from '@/lib/animations';
import toast from 'react-hot-toast';

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
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
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
    <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto text-balance">
      {children}
    </p>
  );
}

const features = [
  {
    icon: Star,
    titleKey: 'landing.featureBirthChart',
    descKey: 'landing.featureBirthChartDesc',
  },
  {
    icon: Moon,
    titleKey: 'landing.featureHoroscope',
    descKey: 'landing.featureHoroscopeDesc',
  },
  {
    icon: Heart,
    titleKey: 'landing.featureCompatibility',
    descKey: 'landing.featureCompatibilityDesc',
  },
  {
    icon: Globe,
    titleKey: 'landing.featureMoon',
    descKey: 'landing.featureMoonDesc',
  },
  {
    icon: MessageCircle,
    titleKey: 'landing.featureAiChat',
    descKey: 'landing.featureAiChatDesc',
  },
  {
    icon: Shield,
    titleKey: 'landing.featureSecurity',
    descKey: 'landing.featureSecurityDesc',
  },
];

const testimonials = [
  {
    nameKey: 'landing.testimonial1Name' as TranslationKey,
    textKey: 'landing.testimonial1Text' as TranslationKey,
    roleKey: 'landing.testimonial1Role' as TranslationKey,
    initials: 'PS',
  },
  {
    nameKey: 'landing.testimonial2Name' as TranslationKey,
    textKey: 'landing.testimonial2Text' as TranslationKey,
    roleKey: 'landing.testimonial2Role' as TranslationKey,
    initials: 'RK',
  },
  {
    nameKey: 'landing.testimonial3Name' as TranslationKey,
    textKey: 'landing.testimonial3Text' as TranslationKey,
    roleKey: 'landing.testimonial3Role' as TranslationKey,
    initials: 'AM',
  },
];

const faqs = [
  { qKey: 'landing.faq1q' as TranslationKey, aKey: 'landing.faq1a' as TranslationKey },
  { qKey: 'landing.faq2q' as TranslationKey, aKey: 'landing.faq2a' as TranslationKey },
  { qKey: 'landing.faq3q' as TranslationKey, aKey: 'landing.faq3a' as TranslationKey },
  { qKey: 'landing.faq4q' as TranslationKey, aKey: 'landing.faq4a' as TranslationKey },
  { qKey: 'landing.faq5q' as TranslationKey, aKey: 'landing.faq5a' as TranslationKey },
];

function ZodiacWheel() {
  const zodiacs = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  const starM = [150,78,162,123,200,101,178,139,220,150,178,161,200,199,162,177,
    150,222,138,177,100,199,122,161,80,150,122,139,100,101,138,123];
  return (
    <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto">
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <defs>
          <radialGradient id="mGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(201,148,58,0.10)" />
            <stop offset="100%" stopColor="rgba(201,148,58,0)" />
          </radialGradient>
        </defs>
        <style>{`
          @keyframes sz { to { transform: rotate(360deg); } }
          @keyframes sd { to { transform: rotate(-360deg); } }
          @keyframes ss { to { transform: rotate(360deg); } }
          @keyframes fo { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        `}</style>
        <rect x="0" y="0" width="300" height="300" fill="url(#mGlow)" rx="150" />
        <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(201,148,58,0.08)" strokeWidth="0.5" />
        <circle cx="150" cy="150" r="135" fill="none" stroke="rgba(201,148,58,0.05)" strokeWidth="0.5" strokeDasharray="2 4" />
        <g style={{ transformOrigin:'150px 150px', animation:'sz 120s linear infinite' }}>
          {zodiacs.map((z,i)=>{
            const a=(i*30-90)*Math.PI/180;
            return <text key={i} x={150+Math.cos(a)*130} y={150+Math.sin(a)*130}
              textAnchor="middle" dominantBaseline="central"
              fill="rgba(201,148,58,0.45)" fontSize="18" fontFamily="serif">{z}</text>;
          })}
        </g>
        <g style={{ transformOrigin:'150px 150px', animation:'sd 80s linear infinite' }}>
          {Array.from({length:24}).map((_,i)=>{
            const a=i*15*Math.PI/180;
            return <circle key={i} cx={150+Math.cos(a)*100} cy={150+Math.sin(a)*100} r="2" fill="rgba(201,148,58,0.18)" />;
          })}
        </g>
        <g style={{ transformOrigin:'150px 150px', animation:'ss 200s linear infinite' }}>
          <polygon points={starM.join(',')} fill="none" stroke="rgba(201,148,58,0.12)" strokeWidth="1" />
        </g>
        <circle cx="150" cy="150" r="50" fill="none" stroke="rgba(201,148,58,0.06)" strokeWidth="0.5" />
        <text x="150" y="152" textAnchor="middle" dominantBaseline="central"
          fontSize="24" fill="rgba(201,148,58,0.3)" fontFamily="serif"
          style={{animation:'fo 4s ease-in-out infinite'}}>ॐ</text>
      </svg>
    </div>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary-lighter/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function Landing() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-background" />
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(ellipse at 20% 30%, rgba(201,148,58,0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 40%, rgba(229,62,62,0.04) 0%, transparent 40%),
              radial-gradient(ellipse at 50% 80%, rgba(201,148,58,0.04) 0%, transparent 45%)
            `,
          }} />
        </motion.div>
        <FloatingParticles />

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 text-center pt-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: easeOut }}
              className="text-left"
            >
              <motion.span
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="tag mb-6 inline-block border-primary/20"
              >
                ✦ {t('landing.heroTag')}
              </motion.span>

              <h1 className="text-[2.5rem] sm:text-5xl md:text-7xl font-display font-medium tracking-[-0.03em] leading-[0.92] mb-5 text-balance">
                {t('landing.heroTitle1')}
                <br />
                <span className="gold-text inline-block mt-2">{t('landing.heroTitle2')}</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
                {t('landing.heroDesc')}
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                {isAuthenticated ? (
                  <Link to="/dashboard/kundli">
                    <PremiumButton size="lg" icon={<Compass className="w-4 h-4" />}>
                      {t('landing.heroGenerateKundli')}
                    </PremiumButton>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <PremiumButton size="lg" icon={<Compass className="w-4 h-4" />}>
                        {t('landing.heroGenerateKundli')}
                      </PremiumButton>
                    </Link>
                    <Link to="/dashboard/horoscope">
                      <PremiumButton variant="secondary" size="lg" icon={<Star className="w-4 h-4" />}>
                        {t('landing.heroExploreHoroscope')}
                      </PremiumButton>
                    </Link>
                  </>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
              >
                <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-primary-light" /> {t('landing.trustEncrypted')}</span>
                <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-primary-light" /> {t('landing.trustRealtime')}</span>
                <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-primary-light" /> {t('landing.trustUsers')}</span>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: easeOut }}
              className="hidden lg:flex items-center justify-center"
            >
              <ZodiacWheel />
            </motion.div>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </section>

      {/* ===== METRICS ===== */}
      <section className="py-16 border-y border-border">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: 1250, suffix: '+', label: t('landing.metricsBirthCharts') },
              { value: 8400, suffix: '+', label: t('landing.metricsAiConversations') },
              { value: 3600, suffix: '+', label: t('landing.metricsCompatibility') },
              { value: 98, suffix: '%', label: t('landing.metricsSatisfaction') },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                  <AnimatedCounter to={stat.value} suffix={stat.suffix} duration={2} delay={i * 0.2} />
                </div>
                <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground font-medium tracking-wide">
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
            <SectionTag>{t('landing.features')}</SectionTag>
            <SectionHeading>{t('landing.featuresTitle')}</SectionHeading>
            <SectionSubtitle>
              {t('landing.featuresDesc')}
            </SectionSubtitle>
          </motion.div>

          <motion.div {...stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="glass-card rounded-xl p-6 card-hover"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 cosmic-glow">
                  <f.icon className="w-5 h-5 text-primary-light" />
                </div>
                <h3 className="text-base font-semibold tracking-tight mb-2">{t(f.titleKey as TranslationKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(f.descKey as TranslationKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section-padding bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <SectionTag>{t('landing.howItWorksTitle')}</SectionTag>
            <SectionHeading>{t('landing.howItWorksTitle')}</SectionHeading>
            <SectionSubtitle>{t('landing.howItWorksDesc')}</SectionSubtitle>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: User, titleKey: 'landing.howItWorksStep1', descKey: 'landing.howItWorksStep1Desc' },
              { step: '02', icon: Zap, titleKey: 'landing.howItWorksStep2', descKey: 'landing.howItWorksStep2Desc' },
              { step: '03', icon: Eye, titleKey: 'landing.howItWorksStep3', descKey: 'landing.howItWorksStep3Desc' },
              { step: '04', icon: Sparkles, titleKey: 'landing.howItWorksStep4', descKey: 'landing.howItWorksStep4Desc' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-card rounded-xl p-6 text-center card-hover"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center cosmic-glow">
                  <item.icon className="w-5 h-5 text-primary-light" />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-primary-lighter uppercase">{item.step}</span>
                <h3 className="text-base font-semibold mt-2 mb-2">{t(item.titleKey as TranslationKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(item.descKey as TranslationKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRODUCT SHOWCASE / HOROSCOPE PREVIEW ===== */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <SectionTag>{t('landing.featureHoroscope')}</SectionTag>
            <SectionHeading>{t('landing.dashboardTitle')}</SectionHeading>
            <SectionSubtitle>
              {t('landing.dashboardDesc')}
            </SectionSubtitle>
          </motion.div>

          <DashboardPreview />
        </div>
      </section>

      {/* ===== TAROT PREVIEW ===== */}
      <section className="section-padding bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <SectionTag>{t('landing.tarotPreviewTitle')}</SectionTag>
            <SectionHeading>{t('landing.tarotPreviewTitle')}</SectionHeading>
            <SectionSubtitle>{t('landing.tarotPreviewDesc')}</SectionSubtitle>
          </motion.div>

          <motion.div {...stagger} className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Star, titleKey: 'landing.tarotPreview1Title', descKey: 'landing.tarotPreview1Desc' },
              { icon: Heart, titleKey: 'landing.tarotPreview2Title', descKey: 'landing.tarotPreview2Desc' },
              { icon: Gem, titleKey: 'landing.tarotPreview3Title', descKey: 'landing.tarotPreview3Desc' },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="glass-card rounded-xl p-6 text-center card-hover"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-accent/10 flex items-center justify-center cosmic-glow-accent">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-base font-semibold mb-2">{t(item.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(item.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div {...fadeUp} className="text-center mt-10">
            <Link to="/tarot">
              <PremiumButton variant="outline" size="lg">{t('landing.heroExploreHoroscope')}</PremiumButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== NUMEROLOGY PREVIEW ===== */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <SectionTag>{t('landing.numerologyPreviewTitle')}</SectionTag>
            <SectionHeading>{t('landing.numerologyPreviewTitle')}</SectionHeading>
            <SectionSubtitle>{t('landing.numerologyPreviewDesc')}</SectionSubtitle>
          </motion.div>

          <motion.div {...stagger} className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { number: 7, titleKey: 'landing.numPreview1Title', descKey: 'landing.numPreview1Desc' },
              { number: 3, titleKey: 'landing.numPreview2Title', descKey: 'landing.numPreview2Desc' },
              { number: 9, titleKey: 'landing.numPreview3Title', descKey: 'landing.numPreview3Desc' },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="glass-card rounded-xl p-6 text-center card-hover"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/10 flex items-center justify-center cosmic-glow-cyan">
                  <span className="text-2xl font-bold text-secondary">{item.number}</span>
                </div>
                <h3 className="text-base font-semibold mb-2">{t(item.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(item.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div {...fadeUp} className="text-center mt-10">
            <Link to="/numerology">
              <PremiumButton variant="outline" size="lg">{t('landing.numerologyCta')}</PremiumButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section-padding bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div {...fadeUp} className="text-center mb-16 md:mb-20">
            <SectionTag>{t('landing.testimonials')}</SectionTag>
            <SectionHeading>{t('landing.testimonialsTitle')}</SectionHeading>
            <SectionSubtitle>
              {t('landing.testimonialsDesc')}
            </SectionSubtitle>
          </motion.div>

          <motion.div {...stagger} className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {testimonials.map((item, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="glass-card rounded-xl p-6"
              >
                <Quote className="w-5 h-5 text-primary/40 mb-3" />
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  &ldquo;{t(item.textKey)}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">{t(item.nameKey)}</p>
                    <p className="text-[11px] text-muted-foreground">{t(item.roleKey)}</p>
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
      <section id="faq" className="section-padding bg-muted/30 border-y border-border">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <SectionTag>{t('landing.faq')}</SectionTag>
            <SectionHeading>{t('landing.faqTitle')}</SectionHeading>
            <SectionSubtitle>
              {t('landing.faqDesc')}
            </SectionSubtitle>
          </motion.div>

          <div className="divide-y divide-border">
            {faqs.map((item, i) => (
              <FaqItem key={i} question={t(item.qKey)} answer={t(item.aKey)} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section-padding">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 text-center">
          <motion.div {...fadeUp}>
            <SectionTag>{t('landing.startFree')}</SectionTag>
            <SectionHeading className="mb-4">{t('landing.ctaTitle')}</SectionHeading>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-md mx-auto text-balance">
              {t('landing.ctaDesc')}
            </p>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <PremiumButton size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                  {t('landing.goDashboard')}
                </PremiumButton>
              </Link>
            ) : (
              <Link to="/register">
                <PremiumButton size="lg" icon={<Sparkles className="w-4 h-4" />}>
                  {t('landing.ctaStartFree')}
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

function DashboardPreview() {
  const { t } = useTranslation();
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative rounded-2xl glass overflow-hidden"
      >
        <div className="flex items-center gap-1.5 px-5 py-3 border-b border-border bg-muted/50">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
          <span className="ml-3 text-[11px] text-muted-foreground font-mono">{t('landing.dashboard')}</span>
        </div>
        <div className="p-5 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{t('landing.goodMorning')}</p>
              <p className="text-lg font-semibold tracking-tight mt-0.5">{t('landing.welcomeBack')}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary-light text-[11px] font-medium">{t('billing.free')}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: t('landing.dashboardReports'), value: '12' },
              { label: t('landing.dashboardChatSessions'), value: '48' },
              { label: t('landing.dashboardActivePlan'), value: t('billing.free') },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="rounded-xl glass p-4"
              >
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold tracking-tight mt-1">{stat.value}</p>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[t('landing.featureHoroscope'), t('landing.featureBirthChart'), t('landing.featureCompatibility'), t('landing.featureAiChat')].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.06 }}
                className="rounded-xl glass p-4 hover:border-primary/20 transition-colors cursor-default"
              >
                <p className="text-[13px] font-medium">{item}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{t('landing.startFree')}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
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
          className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
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
        <p className="pb-5 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </motion.div>
  );
}

function PricingSection() {
  const { t } = useTranslation();
  const [yearly, setYearly] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [detectedCountry, setDetectedCountry] = useState<string>('US');
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  useEffect(() => {
    getDetectedCountry().then(setDetectedCountry);
  }, []);

  const effectiveCountry = user?.country || detectedCountry;

  const { data: plansData } = useQuery({
    queryKey: ['plans', effectiveCountry],
    queryFn: () => api.get<any[]>('/api/payments/plans' + `?country=${encodeURIComponent(effectiveCountry)}`),
    staleTime: 300000,
  });

  const checkoutMutation = useMutation({
    mutationFn: (planId: string) => api.post<{ url: string }>('/api/payments/create-checkout', { plan: planId }),
    onSuccess: (data) => {
      if (data.data?.url?.startsWith('https://')) window.location.href = data.data.url;
      else toast.error(t('errors.invalidCheckoutUrl'));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t('errors.paymentUnavailable'));
    },
  });

  const handleSubscribe = (planName: string) => {
    if (!isAuthenticated) {
      navigate(`/register?plan=${planName.toLowerCase()}`);
      return;
    }
    checkoutMutation.mutate(planName);
  };

  const handleCountryChange = (countryCode: string) => {
    setManualCountryOverride(countryCode);
    setDetectedCountry(countryCode);
    setShowCountryPicker(false);
  };

  const localConfig = REGIONAL_PRICING[effectiveCountry]! || REGIONAL_PRICING.US!;
  const currencyInfo = localConfig.currency;
  const localPlans = getPlans(effectiveCountry);
  const plans = plansData?.data || [
    { id: 'FREE', name: 'Free', price: 0, currency: currencyInfo.code, interval: 'month', features: [t('pricing.freeFeature1'), t('pricing.freeFeature2'), t('pricing.freeFeature3'), t('pricing.freeFeature4')], highlighted: false },
    { id: 'PRO', name: 'Pro', price: localPlans.PRO.monthly, currency: currencyInfo.code, interval: 'month', features: [t('pricing.proFeature1'), t('pricing.proFeature2'), t('pricing.proFeature3'), t('pricing.proFeature4'), t('pricing.proFeature5')], highlighted: true },
    { id: 'PREMIUM', name: 'Premium', price: localPlans.PREMIUM.monthly, currency: currencyInfo.code, interval: 'month', features: [t('pricing.premiumFeature1'), t('pricing.premiumFeature2'), t('pricing.premiumFeature3'), t('pricing.premiumFeature4'), t('pricing.premiumFeature5')], highlighted: false },
    { id: 'ENTERPRISE', name: 'Enterprise', price: localPlans.ENTERPRISE.monthly, currency: currencyInfo.code, interval: 'month', features: [t('pricing.enterpriseFeature1'), t('pricing.enterpriseFeature2'), t('pricing.enterpriseFeature3'), t('pricing.enterpriseFeature4'), t('pricing.enterpriseFeature5')], highlighted: false },
  ];

  return (
    <section id="pricing" className="section-padding">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div {...fadeUp} className="text-center mb-16">
          <SectionTag>{t('landing.pricing')}</SectionTag>
          <SectionHeading>{t('pricing.title')}</SectionHeading>
          <SectionSubtitle>
            {t('pricing.subtitle')}
          </SectionSubtitle>
        </motion.div>

        <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
          <motion.span
            animate={{ color: yearly ? 'var(--tw-text-tertiary)' : 'var(--tw-text-primary)' }}
            className="text-sm text-foreground font-medium"
          >
            {t('pricing.monthly')}
          </motion.span>
          <button
            onClick={() => setYearly(!yearly)}
            className="relative w-12 h-6 rounded-full bg-border transition-colors"
          >
            <motion.div
              animate={{ x: yearly ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 rounded-full bg-primary shadow-sm"
            />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground font-medium">{t('pricing.yearly')}</span>
            <span className="px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary-light border border-primary/20 rounded-full">
              {t('pricing.savePercent')}
            </span>
          </div>

          <div className="w-px h-5 bg-border mx-2" />

          <div className="relative">
            <button
              onClick={() => setShowCountryPicker(!showCountryPicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:border-primary/30 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{currencyInfo.code}</span>
              <span className="text-muted-foreground">{currencyInfo.symbol}</span>
            </button>
            <AnimatePresence>
              {showCountryPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 max-h-72 overflow-y-auto glass-card rounded-xl premium-shadow z-50"
                >
                  {Object.entries(REGIONAL_PRICING).map(([code, cfg]) => (
                    <button
                      key={code}
                      onClick={() => handleCountryChange(code)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-primary/5 ${
                        code === effectiveCountry ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      <span className="flex-1 text-left">{cfg.currency.code}</span>
                      <span className="text-xs text-muted-foreground">{cfg.currency.symbol}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-primary/5 border border-primary/10 text-primary-light">
            <span className="font-medium">{getCountryName(effectiveCountry)}</span>
            <span className="w-1 h-1 rounded-full bg-primary/30" />
            <span>{t('landing.pricesIn', { code: currencyInfo.code, symbol: currencyInfo.symbol })}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {plans.map((plan: any, i) => {
            const monthlyPrice = plan.price;
            const displayPrice = yearly ? monthlyPrice * 10 : monthlyPrice;
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
                    ? 'glass-card border-primary/30 shadow-lg'
                    : 'glass-card'
                }`}
              >
                {plan.highlighted && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-medium rounded-full whitespace-nowrap shadow-sm"
                  >
                    {t('pricing.mostPopular')}
                  </motion.span>
                )}

                <h3 className="text-lg font-semibold tracking-tight mb-1">{t('billing.' + plan.name.toLowerCase() as TranslationKey)}</h3>
                <p className="text-xs text-muted-foreground mb-5 min-h-[2rem]">{plan.desc || t('pricing.planDescription')}</p>

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
                        {monthlyPrice === 0 ? t('billing.free') : formatPrice(displayPrice, plan.currency, currencyInfo.locale)}
                      </span>
                      {monthlyPrice > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          /{yearly ? t('pricing.perYear') : t('pricing.perMonth')}
                        </span>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <ul className="flex-1 space-y-2.5 mb-6">
                  {(plan.features || []).map((f: string, j: number) => (
                    <li key={j} className="flex items-start gap-2 text-xs sm:text-sm">
                      <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                {monthlyPrice === 0 ? (
                  <Link to="/register">
                    <PremiumButton variant="secondary" className="w-full">
                      {t('pricing.getStarted')}
                    </PremiumButton>
                  </Link>
                ) : (
                  <PremiumButton
                    variant={plan.highlighted ? 'primary' : 'ghost'}
                    className="w-full"
                    onClick={() => handleSubscribe(plan.name)}
                    loading={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? t('common.loading') : t('pricing.subscribe')}
                  </PremiumButton>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
