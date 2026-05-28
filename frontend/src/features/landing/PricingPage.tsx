import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

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
          <div className="text-center mb-16">
            <h1 className="text-5xl font-serif font-bold">Choose Your Plan</h1>
            <p className="text-ink/60 dark:text-parchment/60 mt-3">Start free, upgrade anytime</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div key={i} className={`p-6 rounded-xl border ${plan.highlighted ? 'border-gold bg-gold/5 shadow-lg shadow-gold/10' : 'border-ink/10 dark:border-white/10 bg-white dark:bg-cosmic-light/50'} relative`}>
                {plan.highlighted && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gold text-cosmic text-[10px] font-sans font-bold uppercase tracking-widest rounded-full">Popular</span>}
                <h3 className="font-serif text-2xl font-bold mb-1">{plan.name}</h3>
                <p className="text-3xl font-bold mb-6">{plan.price}<span className="text-sm font-normal text-ink/50">/mo</span></p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                      <span className="text-ink/70 dark:text-parchment/70">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button variant={plan.highlighted ? 'primary' : 'secondary'} className="w-full">{plan.cta}</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
