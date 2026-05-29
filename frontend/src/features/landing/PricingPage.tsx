import { useState } from 'react';
import { Check, Sparkles, ArrowRight, Star, Zap, Crown, Globe, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PremiumButton } from '@/components/PremiumButton';
import { cn } from '@/lib/utils';

const monthlyPlans = [
  {
    name: 'Free', price: 0, icon: Star,
    desc: 'Get started with daily celestial guidance',
    features: [
      { text: 'Daily horoscope', included: true },
      { text: 'Basic birth chart', included: true },
      { text: 'Moon phase tracker', included: true },
      { text: 'AI chat astrologer', included: false },
      { text: 'Compatibility analysis', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started', highlighted: false,
  },
  {
    name: 'Pro', price: 9.99, icon: Zap,
    desc: 'For serious seekers of cosmic wisdom',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'AI chat astrologer', included: true },
      { text: 'Compatibility analysis', included: true },
      { text: 'Detailed birth chart', included: true },
      { text: 'Weekly predictions', included: true },
      { text: 'Priority support', included: false },
    ],
    cta: 'Subscribe', highlighted: true,
  },
  {
    name: 'Premium', price: 19.99, icon: Crown,
    desc: 'The complete spiritual companion',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited AI chats', included: true },
      { text: 'Numerology report', included: true },
      { text: 'Tarot readings', included: true },
      { text: 'Birth chart + Dasha', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Subscribe', highlighted: false,
  },
  {
    name: 'Enterprise', price: 49.99, icon: Globe,
    desc: 'For studios and professional astrologers',
    features: [
      { text: 'Everything in Premium', included: true },
      { text: 'API access', included: true },
      { text: 'White-label reports', included: true },
      { text: 'Dedicated astrologer', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'SLA guarantee', included: true },
    ],
    cta: 'Contact Us', highlighted: false,
  },
];

const faqs = [
  { q: 'Can I switch plans anytime?', a: 'Yes, you can upgrade or downgrade at any time. Changes take effect immediately.' },
  { q: 'Is there a free trial?', a: 'Pro and Premium plans come with a 7-day free trial. No credit card required to start.' },
  { q: 'Can I cancel my subscription?', a: 'Cancel anytime. You retain access until the end of your billing period.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and UPI (India).' },
];

export function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-accent/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Choose Your Plan</h1>
            <p className="text-text-secondary dark:text-dark-text-secondary mt-3 max-w-md mx-auto text-balance">
              Unlock the cosmos. Start free, upgrade when you&rsquo;re ready.
            </p>
          </motion.div>

          <div className="flex items-center justify-center gap-3 mb-12">
            <span className="text-sm font-medium">Monthly</span>
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
              <span className="text-sm font-medium">Yearly</span>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-accent/10 text-accent border border-accent/20 rounded-full">
                Save 17%
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {monthlyPlans.map((plan, i) => {
              const yearlyPrice = (plan.price * 10).toFixed(2);
              const displayPrice = yearly ? yearlyPrice : plan.price.toFixed(2);
              return (
                <motion.div
                  key={`${plan.name}-${yearly}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                  className={cn(
                    'rounded-xl p-6 relative transition-all duration-300 flex flex-col',
                    plan.highlighted
                      ? 'card-border bg-accent/5 dark:bg-dark-accent-subtle border-accent/30 dark:border-dark-accent/30 shadow-sm'
                      : 'card-border bg-bg-primary dark:bg-dark-bg-secondary',
                  )}
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

                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <plan.icon className="w-4.5 h-4.5 text-accent" />
                  </div>

                  <h3 className="text-lg font-semibold tracking-tight mb-1">{plan.name}</h3>
                  <p className="text-xs text-text-tertiary dark:text-dark-text-tertiary mb-4 min-h-[2rem]">{plan.desc}</p>

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

                  <div className="flex-1 space-y-2.5 mb-6">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <div className={cn(
                          'mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0',
                          f.included ? 'bg-accent/15' : 'bg-border-primary dark:bg-dark-border-primary',
                        )}>
                          <Check className={cn(
                            'w-2.5 h-2.5',
                            f.included ? 'text-accent' : 'text-text-tertiary dark:text-dark-text-tertiary',
                          )} />
                        </div>
                        <span className={cn(
                          'text-xs sm:text-sm',
                          f.included ? 'text-text-secondary dark:text-dark-text-secondary' : 'text-text-tertiary dark:text-dark-text-tertiary line-through',
                        )}>
                          {f.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link to={plan.price === 0 ? '/register' : '/register?plan=' + plan.name.toLowerCase()}>
                    <PremiumButton
                      variant={plan.highlighted ? 'primary' : plan.price === 0 ? 'secondary' : 'ghost'}
                      className="w-full"
                    >
                      {plan.cta}
                      {plan.highlighted && <ArrowRight className="w-3.5 h-3.5" />}
                    </PremiumButton>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto mt-20"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 tracking-tight">Frequently Asked Questions</h2>
            <div className="divide-y divide-border-primary dark:divide-dark-border-primary">
              {faqs.map((faq, i) => (
                <FaqItem key={i} question={faq.q} answer={faq.a} index={i} />
              ))}
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-16 text-xs text-text-tertiary dark:text-dark-text-tertiary"
          >
            All plans come with a 7-day free trial. Cancel anytime. No hidden fees.
          </motion.p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left group"
      >
        <span className="text-sm font-medium pr-4">{question}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-text-tertiary dark:text-dark-text-tertiary transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="overflow-hidden"
      >
        <p className="pb-4 text-sm text-text-secondary dark:text-dark-text-secondary leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </motion.div>
  );
}
