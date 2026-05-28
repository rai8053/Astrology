import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PremiumButton } from '@/components/PremiumButton';

const plans = [
  { name: 'Free', price: '$0', features: ['Daily horoscope', 'Basic birth chart', 'Moon phase tracker'], cta: 'Get Started', highlighted: false },
  { name: 'Pro', price: '$9.99', features: ['Everything in Free', 'AI chat astrologer', 'Compatibility analysis', 'Detailed birth chart', 'Weekly predictions'], cta: 'Subscribe', highlighted: true },
  { name: 'Premium', price: '$19.99', features: ['Everything in Pro', 'Unlimited AI chats', 'Numerology report', 'Tarot readings', 'Priority support'], cta: 'Subscribe', highlighted: false },
  { name: 'Enterprise', price: '$49.99', features: ['Everything in Premium', 'API access', 'White-label reports', 'Dedicated astrologer', 'Custom integrations'], cta: 'Contact Us', highlighted: false },
];

export function PricingPage() {
  return (
    <div className="min-h-screen bg-parchment dark:bg-cosmic">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold">Choose Your Plan</h1>
            <p className="text-ink/50 dark:text-parchment/50 mt-3">Start free, upgrade anytime</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className={`p-6 rounded-xl ${plan.highlighted ? 'gold-border cosmic-glow bg-gradient-to-b from-gold/[0.05] to-transparent glass-card' : 'glass-card'} relative transition-all duration-500`}
              >
                {plan.highlighted && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-gold to-amber-400 text-cosmic text-[9px] font-sans font-bold uppercase tracking-[0.15em] rounded-full shadow-lg shadow-gold/20"
                  >
                    Popular
                  </motion.span>
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
                      animate={{ opacity: 1, x: 0 }}
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
                    {plan.cta}
                  </PremiumButton>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
