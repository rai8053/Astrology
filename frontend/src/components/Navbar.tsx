import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, Sun, Moon, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumButton } from './PremiumButton';
import { useAuthStore, useThemeStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, setTheme, resolved } = useThemeStore();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = isLanding
    ? [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'FAQ', href: '#faq' },
      ]
    : [];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isLanding && !scrolled ? 'bg-transparent' : 'glass border-b border-ink/5 dark:border-white/5',
        scrolled ? 'shadow-lg shadow-black/5' : '',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-18">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="relative">
                <Sparkles className="w-5 h-5 text-gold" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gold rounded-full animate-ping opacity-60" />
              </div>
              <span className="font-serif text-xl font-semibold bg-gradient-to-r from-gold to-amber-400 bg-clip-text text-transparent">
                Soma & Surya
              </span>
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <motion.a
                key={l.href}
                href={l.href}
                whileHover={{ y: -1 }}
                className="text-sm font-sans text-ink/60 dark:text-parchment/60 hover:text-gold transition-colors relative group"
              >
                {l.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-gold group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
              className="p-2.5 hover:bg-ink/5 dark:hover:bg-white/5 rounded-full transition-colors"
              aria-label="Toggle theme"
            >
              <motion.div
                key={resolved}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {resolved === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.div>
            </motion.button>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <PremiumButton variant="ghost" size="sm" icon={<User className="w-3.5 h-3.5" />}>
                    Dashboard
                  </PremiumButton>
                </Link>
                <PremiumButton variant="ghost" size="sm" onClick={logout}>Logout</PremiumButton>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login"><PremiumButton variant="ghost" size="sm">Sign In</PremiumButton></Link>
                <Link to="/register"><PremiumButton size="sm">Get Started</PremiumButton></Link>
              </div>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-ink/5 dark:border-white/5 overflow-hidden"
          >
            <div className="px-4 py-5 space-y-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setTheme(resolved === 'dark' ? 'light' : 'dark'); }}
                className="flex items-center gap-3 w-full text-sm py-2.5 px-3 rounded-lg hover:bg-ink/5 dark:hover:bg-white/5 text-ink/70 dark:text-parchment/70"
              >
                {resolved === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {resolved === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </motion.button>
              {links.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                  className="block text-sm py-2.5 px-3 rounded-lg hover:bg-ink/5 dark:hover:bg-white/5 text-ink/70 dark:text-parchment/70">
                  {l.label}
                </a>
              ))}
              <div className="pt-2 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" onClick={() => setOpen(false)}>
                      <PremiumButton className="w-full">Dashboard</PremiumButton>
                    </Link>
                    <PremiumButton variant="ghost" className="w-full" onClick={logout}>Logout</PremiumButton>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)}>
                      <PremiumButton variant="secondary" className="w-full">Sign In</PremiumButton>
                    </Link>
                    <Link to="/register" onClick={() => setOpen(false)}>
                      <PremiumButton className="w-full">Get Started</PremiumButton>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
