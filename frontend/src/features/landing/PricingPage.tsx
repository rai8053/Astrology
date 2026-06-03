import { useState, useEffect } from 'react';
import { Check, Sparkles, ArrowRight, Star, Zap, Crown, Globe, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PremiumButton } from '@/components/PremiumButton';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { getDetectedCountry, setManualCountryOverride, getCurrencyInfo, formatPrice, REGIONAL_PRICING } from '@/lib/pricing';
import type { CountryCode } from '@shared/config/pricing';
import toast from 'react-hot-toast';
import { useT } from '@/lib/i18n/useT';

export function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useT();
  const [detectedCountry, setDetectedCountry] = useState<string>('US');
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  useEffect(() => {
    getDetectedCountry().then(setDetectedCountry);
  }, []);

  const faqs = [
    { q: t('pricing.faq1q'), a: t('pricing.faq1a') },
    { q: t('pricing.faq2q'), a: t('pricing.faq2a') },
    { q: t('pricing.faq3q'), a: t('pricing.faq3a') },
    { q: t('pricing.faq4q'), a: t('pricing.faq4a') },
  ];

  const effectiveCountry = (user?.country || detectedCountry);
  const countryForQuery = effectiveCountry;

  const { data: plansData } = useQuery({
    queryKey: ['plans-page', countryForQuery],
    queryFn: () => api.get<{ id: string; name: string; price: number; currency: string; interval: string; features: string[]; highlighted: boolean; displayPrice: number }[]>('/api/payments/plans' + `?country=${encodeURIComponent(countryForQuery)}`),
    staleTime: 300000,
  });

  const checkoutMutation = useMutation({
    mutationFn: (planId: string) => api.post<{ url: string }>('/api/payments/create-checkout', { plan: planId }),
    onSuccess: (data) => {
      if (data.data?.url?.startsWith('https://')) window.location.href = data.data.url;
       else toast.error(t('pricing.invalidUrl'));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t('common.error'));
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

  const currencyInfo = getCurrencyInfo(countryForQuery);
  const plans = plansData?.data || [];
  const currentConfig = REGIONAL_PRICING[detectedCountry]! || REGIONAL_PRICING.US!;

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
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{t('pricing.title')}</h1>
            <p className="text-text-secondary dark:text-dark-text-secondary mt-3 max-w-md mx-auto text-balance">
              {t('pricing.subtitle')}
            </p>
          </motion.div>

          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            <span className="text-sm font-medium">{t('pricing.monthly')}</span>
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
              <span className="text-sm font-medium">{t('pricing.yearly')}</span>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-accent/10 text-accent border border-accent/20 rounded-full">
                {t('pricing.savePercent')}
              </span>
            </div>

            <div className="w-px h-5 bg-border-primary dark:bg-dark-border-primary mx-2" />

            <div className="relative">
              <button
                onClick={() => setShowCountryPicker(!showCountryPicker)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border-primary dark:border-dark-border-primary hover:border-accent/30 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{currentConfig.flag} {currencyInfo.code}</span>
                <span className="text-text-tertiary">{currencyInfo.symbol}</span>
              </button>
              <AnimatePresence>
                {showCountryPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 max-h-72 overflow-y-auto card-border rounded-xl premium-shadow z-50 bg-bg-primary dark:bg-dark-bg-primary"
                  >
                    {Object.entries(REGIONAL_PRICING).map(([code, cfg]) => (
                      <button
                        key={code}
                        onClick={() => handleCountryChange(code)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent/5 ${
                          code === detectedCountry ? 'bg-accent/10 text-accent font-medium' : 'text-text-secondary'
                        }`}
                      >
                        <span className="text-base">{cfg.flag}</span>
                        <span className="flex-1 text-left">{cfg.currency.code}</span>
                        <span className="text-xs text-text-tertiary">{cfg.currency.symbol}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
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
                      {t('pricing.mostPopular')}
                    </motion.span>
                  )}

                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Star className="w-4.5 h-4.5 text-accent" />
                  </div>

                  <h3 className="text-lg font-semibold tracking-tight mb-1">{plan.name}</h3>
                  <p className="text-xs text-text-tertiary dark:text-dark-text-tertiary mb-4 min-h-[2rem]">{plan.desc || ''}</p>

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
                          <span className="text-xs text-text-tertiary dark:text-dark-text-tertiary ml-1">
                            /{yearly ? t('pricing.perYear') : t('pricing.perMonth')}
                          </span>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="flex-1 space-y-2.5 mb-6">
                    {(plan.features || []).map((f: string, j: number) => (
                      <div key={j} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-accent" />
                        </div>
                        <span className="text-xs sm:text-sm text-text-secondary dark:text-dark-text-secondary">{f}</span>
                      </div>
                    ))}
                  </div>

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
                      {checkoutMutation.isPending ? t('pricing.redirecting') : t('pricing.subscribe')}
                      {plan.highlighted && !checkoutMutation.isPending && <ArrowRight className="w-3.5 h-3.5" />}
                    </PremiumButton>
                  )}
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
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 tracking-tight">{t('pricing.faqTitle')}</h2>
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
            {t('pricing.freeTrialNote')}
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
