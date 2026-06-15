import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Compass, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { PremiumButton } from '@/components/PremiumButton';
import { useTranslation } from '@/lib/i18n';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
      <Navbar />
      <div className="flex items-center justify-center pt-32 pb-24 px-5">
        <Helmet>
          <title>404 — {t('errors.pageNotFound')}</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <motion.div animate={{ rotate: [0, 10, 0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Compass className="w-8 h-8 text-accent" />
          </motion.div>
          <h1 className="font-sans text-6xl sm:text-7xl font-bold text-accent mb-2">404</h1>
          <p className="text-lg text-text-secondary mb-8 max-w-md mx-auto">{t('errors.pageNotFoundDesc')}</p>
          <Link to="/">
            <PremiumButton icon={<ArrowLeft className="w-4 h-4" />}>{t('errors.backHome')}</PremiumButton>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
