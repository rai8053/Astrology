import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Compass, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n/useT';

export function NotFoundPage() {
  const { t } = useT();
  return (
    <div className="min-h-screen bg-gradient-to-b from-parchment to-amber-50 dark:from-cosmic dark:to-cosmic-deeper flex items-center justify-center">
      <Helmet>
        <title>404 — Page Not Found — Soma & Surya</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-5"
      >
        <motion.div
          animate={{ rotate: [0, 10, 0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6"
        >
          <Compass className="w-8 h-8 text-gold" />
        </motion.div>
        <h1 className="font-serif text-6xl font-bold text-gold mb-2">404</h1>
        <p className="text-lg text-ink/60 dark:text-parchment/60 mb-8 max-w-md mx-auto">
          {t('common.somethingWentWrong')} — the stars could not align for this page.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-white font-medium hover:bg-gold/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('common.back')} Home
        </Link>
      </motion.div>
    </div>
  );
}
