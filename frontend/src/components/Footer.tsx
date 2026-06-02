import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';

export function Footer() {
  const { t } = useT();
  return (
    <footer className="border-t border-border-primary dark:border-dark-border-primary">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-accent/10">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
              </div>
              <span className="text-sm font-semibold tracking-tight">
                Soma<span className="text-text-tertiary dark:text-dark-text-tertiary font-normal">&</span>Surya
              </span>
            </Link>
            <p className="text-xs text-text-tertiary dark:text-dark-text-tertiary leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-dark-text-secondary mb-3">{t('footer.product')}</h4>
            <div className="space-y-2">
              {[
                { label: t('footer.features'), href: '#features' },
                { label: t('footer.pricing'), href: '#pricing' },
                { label: t('footer.faq'), href: '/faq' },
                { label: t('footer.about'), href: '/about' },
              ].map(l => (
                <Link key={l.label} to={l.href} className="block text-xs text-text-tertiary dark:text-dark-text-tertiary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-dark-text-secondary mb-3">{t('footer.support')}</h4>
            <div className="space-y-2">
              {[
                { label: t('footer.contact'), href: '/contact' },
                { label: t('footer.privacyPolicy'), href: '/privacy' },
                { label: t('footer.termsService'), href: '/terms' },
                { label: t('footer.refundPolicy'), href: '/refund' },
              ].map(l => (
                <Link key={l.label} to={l.href} className="block text-xs text-text-tertiary dark:text-dark-text-tertiary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-dark-text-secondary mb-3">{t('footer.account')}</h4>
            <div className="space-y-2">
              {[
                { label: t('footer.login'), href: '/login' },
                { label: t('footer.register'), href: '/register' },
              ].map(l => (
                <Link key={l.label} to={l.href} className="block text-xs text-text-tertiary dark:text-dark-text-tertiary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border-primary dark:border-dark-border-primary flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-text-tertiary dark:text-dark-text-tertiary">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-text-tertiary/60 dark:text-dark-text-tertiary/60 font-mono">
              Build: v{__BUILD_HASH__}
            </span>
            <span className="text-[11px] text-text-tertiary dark:text-dark-text-tertiary">
              hello@somaandsurya.com
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
