import { motion } from 'framer-motion';
import { ScrollText } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';

export function TermsPage() {
  const { t } = useT();
  return (
    <div className="min-h-screen bg-gradient-to-b from-parchment to-amber-50 dark:from-cosmic dark:to-cosmic-deeper">
      <div className="max-w-3xl mx-auto px-5 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <ScrollText className="w-10 h-10 text-gold mx-auto mb-3" />
          <h1 className="font-serif text-4xl font-bold mb-3">{t('terms.title' as any)}</h1>
          <p className="text-sm text-ink/40">{t('terms.lastUpdated' as any)}: May 31, 2026</p>
        </motion.div>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-ink/70 dark:text-parchment/70">
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">1. Acceptance of Terms</h2><p>By creating an account and using Soma & Surya, you agree to these terms. If you do not agree, do not use the service.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">2. Description of Service</h2><p>Soma & Surya provides AI-powered Vedic astrology readings, horoscopes, Kundli charts, compatibility analysis, and related services. All astrological content is for entertainment, self-reflection, and educational purposes. It is not a substitute for professional advice.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">3. User Accounts</h2><p>You are responsible for maintaining the confidentiality of your account credentials. You must be at least 13 years old to use this service. One account per person.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">4. Subscriptions & Billing</h2><p>Free accounts include basic features. Premium subscriptions auto-renew unless canceled. Refunds follow our Refund Policy. Prices are subject to change with 30 days notice.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">5. Acceptable Use</h2><p>You agree not to: misuse the AI chat for harmful content, attempt to reverse-engineer our calculations, scrape or reproduce our content, or create multiple accounts.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">6. Intellectual Property</h2><p>All content, calculations, and technology are the property of Soma & Surya. Your personal astrology reports are yours to download and keep.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">7. Disclaimer</h2><p>Astrological readings are provided for entertainment and personal growth. We make no guarantees about accuracy of predictions. Always consult qualified professionals for medical, legal, or financial decisions.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">8. Limitation of Liability</h2><p>Soma & Surya is not liable for any damages arising from the use or inability to use the service. Our total liability is limited to the amount you paid for your subscription.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">9. Termination</h2><p>We reserve the right to terminate accounts that violate these terms. You may delete your account at any time. Upon termination, your data is deleted within 30 days.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">10. Changes to Terms</h2><p>We may update these terms with 30 days notice via email. Continued use after changes constitutes acceptance.</p></section>
        </div>
      </div>
    </div>
  );
}
