import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const footerLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Login', href: '/login' },
  { label: 'Register', href: '/register' },
];

export function Footer() {
  return (
    <footer className="border-t border-border-primary dark:border-dark-border-primary">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-accent/10">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
              </div>
              <span className="text-sm font-semibold tracking-tight">
                Soma<span className="text-text-tertiary dark:text-dark-text-tertiary font-normal">&</span>Surya
              </span>
            </Link>
            <span className="text-[11px] text-text-tertiary dark:text-dark-text-tertiary hidden sm:inline">
              &copy; {new Date().getFullYear()} VedicPath Systems
            </span>
          </div>
          <div className="flex items-center gap-1">
            {footerLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="px-3 py-1.5 text-[13px] text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-border-primary dark:border-dark-border-primary flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-text-tertiary dark:text-dark-text-tertiary">
            Sidereal Vedic Astrology &mdash; Lahiri Ayanamsa
          </p>
          <p className="text-[11px] text-text-tertiary dark:text-dark-text-tertiary">
            hello@somasurya.com
          </p>
        </div>
      </div>
    </footer>
  );
}
