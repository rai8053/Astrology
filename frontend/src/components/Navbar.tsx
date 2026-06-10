import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, Sun, Moon, User, Settings, Shield, LogOut, Crown, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumButton } from './PremiumButton';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuthStore, useThemeStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') return window.matchMedia(query).matches;
    return false;
  });
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { setTheme, resolved } = useThemeStore();
  const { t } = useTranslation();
  const isLanding = location.pathname === '/';
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const isMobile = useMediaQuery('(max-width: 767px)');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setUserMenuOpen(false); setOpen(false); menuTriggerRef.current?.focus(); }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  useEffect(() => {
    setUserMenuOpen(false);
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const container = mobileMenuRef.current;
    if (!container) return;
    const selector = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';
    const focusable = container.querySelectorAll<HTMLElement>(selector);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (active === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const links = isLanding ? [
    { label: t('nav.features'), href: '#features' },
    { label: t('nav.pricing'), href: '#pricing' },
    { label: t('nav.faq'), href: '#faq' },
  ] : [];

  const displayName = user?.name?.trim() || localStorage.getItem('googleName') || '';
  const initials = displayName
    ? displayName.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const planBadge = user?.plan && user.plan !== 'FREE' ? user.plan : null;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled ? 'glass-nav shadow-sm' : isLanding ? 'bg-transparent' : 'glass-nav',
      )}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              Soma<span className="font-normal text-muted-foreground">&</span>Surya
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <a
                key={l.href}
                href={l.href}
                className="relative px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
                <span className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </a>
            ))}

            <div className="ml-4 flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-primary/5 text-muted-foreground transition-colors"
                aria-label={t('nav.themeAria')}
              >
                {resolved === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.button>

              <LanguageSwitcher />

              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                    aria-label={displayName || t('nav.userMenu')}
                  >
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-[11px] font-semibold text-primary">
                      {initials}
                    </div>
                    <motion.div animate={{ rotate: userMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </motion.div>
                  </motion.button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 card-border rounded-xl premium-shadow overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-medium truncate text-foreground">{displayName}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <div className="p-1.5">
                          {[
                            { to: '/dashboard', icon: User, label: t('nav.userDashboard') },
                            { to: '/dashboard/settings', icon: Settings, label: t('nav.userSettings') },
                            { to: '/pricing', icon: Crown, label: t('nav.upgradePlan') },
                          ].map(item => (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <item.icon className="w-3.5 h-3.5" />
                              {item.label}
                            </Link>
                          ))}
                          {isAdmin && (
                            <>
                              <div className="my-1 border-t border-border" />
                              <Link
                                to="/admin"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Shield className="w-3.5 h-3.5" />
                                {t('nav.adminPanel')}
                              </Link>
                            </>
                          )}
                          <div className="my-1 border-t border-border" />
                          <button
                            onClick={() => { setUserMenuOpen(false); logout(); }}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            {t('nav.signOut')}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login"><PremiumButton variant="ghost" size="sm">{t('nav.login')}</PremiumButton></Link>
                  <Link to="/register"><PremiumButton size="sm">{t('landing.startFree')}</PremiumButton></Link>
                </div>
              )}
            </div>
          </div>

          <motion.button
            ref={menuTriggerRef}
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 -mr-2 text-muted-foreground"
            onClick={() => setOpen(!open)}
            aria-label={t('nav.menu')}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="px-5 py-5 space-y-3">
              {isAuthenticated && (
                <div className="flex items-center gap-3 px-1 pb-3 border-b border-border">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{displayName}</p>
                    <p className="text-[11px] text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              )}
              {links.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block text-sm py-2 px-3 rounded-lg hover:bg-primary/5 text-muted-foreground transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-3 w-full text-sm py-2 px-3 rounded-lg hover:bg-primary/5 text-muted-foreground transition-colors"
              >
                {resolved === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {resolved === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}
              </motion.button>
              <div className="px-3 py-2">
                <LanguageSwitcher />
              </div>
              <div className="pt-2 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" onClick={() => setOpen(false)}>
                      <PremiumButton className="w-full">{t('nav.dashboard')}</PremiumButton>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setOpen(false)}>
                        <PremiumButton variant="ghost" className="w-full">{t('nav.adminPanel')}</PremiumButton>
                      </Link>
                    )}
                    <PremiumButton variant="ghost" className="w-full" onClick={logout}>{t('nav.signOut')}</PremiumButton>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)}>
                      <PremiumButton variant="secondary" className="w-full">{t('nav.login')}</PremiumButton>
                    </Link>
                    <Link to="/register" onClick={() => setOpen(false)}>
                      <PremiumButton className="w-full">{t('landing.startFree')}</PremiumButton>
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
