import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';

export function RefundPage() {
  const { t } = useT();
  return (
    <div className="min-h-screen bg-gradient-to-b from-parchment to-amber-50 dark:from-cosmic dark:to-cosmic-deeper">
      <div className="max-w-3xl mx-auto px-5 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <RotateCcw className="w-10 h-10 text-gold mx-auto mb-3" />
          <h1 className="font-serif text-4xl font-bold mb-3">{t('refund.title' as any)}</h1>
          <p className="text-sm text-ink/40">{t('refund.lastUpdated' as any)}: May 31, 2026</p>
        </motion.div>
        <div className="space-y-6 text-ink/70 dark:text-parchment/70">
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">30-Day Money-Back Guarantee</h2><p>We stand behind our service. If you're not satisfied within 30 days of your premium subscription purchase, we'll refund your payment in full — no questions asked.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">How to Request a Refund</h2><p>Simply email us at refunds@somaandsurya.com with the email address used for your account. We process refunds within 5-7 business days. The refund will be credited to your original payment method.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">Partial Refunds</h2><p>For annual subscriptions canceled after 30 days, we offer prorated refunds for the remaining months. Monthly subscriptions canceled after 30 days are not eligible for refunds but remain active until the end of the billing period.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">Free Trial</h2><p>All new accounts include a 14-day free trial of premium features. You can cancel anytime during the trial with no charge. Your account automatically converts to the free plan after the trial ends.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">Exceptions</h2><p>Refunds are limited to one per customer. Enterprise and custom plans may have separate refund terms as specified in your agreement.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">Contact</h2><p>For refund questions: refunds@somaandsurya.com. We typically respond within 24 hours.</p></section>
        </div>
      </div>
    </div>
  );
}
