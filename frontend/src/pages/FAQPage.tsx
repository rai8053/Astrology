import { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useT } from '@/lib/i18n/useT';

export function FAQPage() {
  const { t } = useT();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const FAQS = [
    { q: t('faq.q1' as any), a: t('faq.a1' as any) },
    { q: t('faq.q2' as any), a: t('faq.a2' as any) },
    { q: t('faq.q3' as any), a: t('faq.a3' as any) },
    { q: t('faq.q4' as any), a: t('faq.a4' as any) },
    { q: t('faq.q5' as any), a: t('faq.a5' as any) },
    { q: t('faq.q6' as any), a: t('faq.a6' as any) },
    { q: t('faq.q7' as any), a: t('faq.a7' as any) },
    { q: t('faq.q8' as any), a: t('faq.a8' as any) },
    { q: t('faq.q9' as any), a: t('faq.a9' as any) },
    { q: t('faq.q10' as any), a: t('faq.a10' as any) },
    { q: t('faq.q11' as any), a: t('faq.a11' as any) },
    { q: t('faq.q12' as any), a: t('faq.a12' as any) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-parchment to-amber-50 dark:from-cosmic dark:to-cosmic-deeper">
      <div className="max-w-3xl mx-auto px-5 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <HelpCircle className="w-10 h-10 text-gold mx-auto mb-3" />
          <h1 className="font-serif text-4xl font-bold mb-3">{t('faq.title' as any)}</h1>
          <p className="text-ink/60 dark:text-parchment/60">{t('faq.subtitle' as any)}</p>
        </motion.div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="rounded-2xl border border-ink/5 dark:border-white/[0.06] overflow-hidden">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-ink/5 dark:hover:bg-white/[0.03] transition-colors">
                <span className="font-medium text-sm pr-4">{faq.q}</span>
                <motion.div animate={{ rotate: openIndex === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
                  <ChevronDown className="w-4 h-4 text-ink/40" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="px-5 pb-5 text-sm text-ink/60 dark:text-parchment/60 leading-relaxed">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-ink/50 mb-4">{t('faq.stillHaveQuestions' as any)}</p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-white font-medium hover:bg-gold/90 transition-colors">
            <Sparkles className="w-4 h-4" /> {t('faq.contactUs' as any)}
          </Link>
        </div>
      </div>
    </div>
  );
}
