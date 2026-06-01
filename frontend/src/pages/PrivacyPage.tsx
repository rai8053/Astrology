import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';

export function PrivacyPage() {
  const { t } = useT();
  return (
    <div className="min-h-screen bg-gradient-to-b from-parchment to-amber-50 dark:from-cosmic dark:to-cosmic-deeper">
      <div className="max-w-3xl mx-auto px-5 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Shield className="w-10 h-10 text-gold mx-auto mb-3" />
          <h1 className="font-serif text-4xl font-bold mb-3">{t('privacy.title' as any)}</h1>
          <p className="text-sm text-ink/40">{t('privacy.lastUpdated' as any)}: May 31, 2026</p>
        </motion.div>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-ink/70 dark:text-parchment/70">
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">1. Information We Collect</h2><p>We collect information you provide directly: name, email, birth date, birth time, birth place, gender, and language preferences. We also collect usage data: astrology reports, chat history, and feature interactions.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">2. How We Use Your Data</h2><p>Your birth details are used solely to generate astrological calculations and personalized readings. We use AI to enhance interpretations but never share your personal data with third parties. Usage data helps us improve our services.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">3. Data Storage & Security</h2><p>All data is encrypted at rest using AES-256. Data in transit uses TLS 1.3. We use PostgreSQL with row-level security. Each user's data is isolated and never accessible to other users.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">4. Data Retention</h2><p>We retain your data for as long as your account is active. Upon account deletion, all personal data including birth details, chat history, and astrology reports are permanently deleted within 30 days.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">5. Third-Party Services</h2><p>We use Stripe for payment processing and OpenRouter for AI services. Payment data goes directly to Stripe — we never store credit card details. AI processing is done without storing your personal information on third-party servers.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">6. Cookies</h2><p>We use essential cookies for authentication (JWT tokens) and preference storage (language, theme). No tracking cookies or third-party analytics are used.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">7. Your Rights</h2><p>You have the right to access, correct, or delete your data at any time from your Settings page. You can export your data in JSON format. Contact us at privacy@somaandsurya.com for any privacy concerns.</p></section>
          <section><h2 className="text-lg font-semibold text-ink dark:text-parchment">8. Children's Privacy</h2><p>Our service is not intended for users under 13. We do not knowingly collect data from children. If we discover such data, we delete it immediately.</p></section>
        </div>
      </div>
    </div>
  );
}
