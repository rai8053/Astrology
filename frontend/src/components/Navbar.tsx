import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, User, Settings, Shield, LogOut, Crown, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumButton } from './PremiumButton';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuthStore } from '@/lib/store';
import { useThemeStore } from '@/hooks/useTheme';
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

const NAV_LINKS = [
  { labelKey: 'nav.home', href: '/' },
  { labelKey: 'nav.kundli', href: '/dashboard/kundli' },
  { labelKey: 'nav.horoscope', href: '/dashboard/horoscope' },
  { labelKey: 'nav.numerology', href: '/numerology' },
  { labelKey: 'nav.tarot', href: '/tarot' },
  { labelKey: 'nav.pricing', href: '/pricing' },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { setTheme, resolved } = useThemeStore();
  const { t } = useTranslation();
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

  const displayName = user?.name?.trim() || localStorage.getItem('googleName') || '';
  const initials = displayName
    ? displayName.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const isLanding = location.pathname === '/';

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,box-shadow] duration-500',
        scrolled
          ? 'glass-nav shadow-lg backdrop-blur-xl border-b border-primary/10'
          : isLanding
          ? 'bg-transparent'
          : 'glass-nav',
      )}
    >
      <div className={cn(
        'mx-auto px-5 sm:px-8 transition-[padding,max-width] duration-500',
        scrolled ? 'max-w-6xl' : 'max-w-7xl',
      )}>
        <div className={cn(
          'flex items-center justify-between transition-[height] duration-500',
          scrolled ? 'h-14' : 'h-16',
        )}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-primary">
              <path d="M14 3C11.5 3 7 5.5 7 14s4.5 11 7 11c-3 0-7-4-7-11S11 3 14 3z" fill="currentColor" opacity="0.6"/>
              <path d="M16 4a10 10 0 0 0-3 20 10 10 0 0 0 3-20z" fill="currentColor" opacity="0.3"/>
            </svg>
            <span className="text-base font-display tracking-tight text-foreground" style={{ fontSize: '18px' }}>
              Soma <span className="text-primary-light">&</span> Surya
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => {
              const isActive = location.pathname === link.href ||
                (link.href !== '/' && location.pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'relative px-3 py-2 text-xs font-medium tracking-[0.04em] uppercase transition-colors duration-200 group',
                    isActive
                      ? 'text-primary-light'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t(link.labelKey as any)}
                  <span className={cn(
                    'absolute bottom-0 left-2 right-2 h-[1px] bg-primary rounded-full transition-transform duration-200 origin-left',
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                  )} />
                </Link>
              );
            })}

            <div className="ml-4 flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
                className={cn(
                  'p-2 rounded-lg transition-colors duration-200',
                  'hover:bg-primary/5 text-muted-foreground hover:text-primary-light',
                )}
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
                        className="absolute right-0 mt-2 w-52 glass-card rounded-xl premium-shadow overflow-hidden"
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

          {/* Mobile Menu Trigger */}
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

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl overflow-hidden relative"
          >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='80' fill='none' stroke='%23C9943A' stroke-width='0.5'/%3E%3Ccircle cx='100' cy='100' r='60' fill='none' stroke='%23C9943A' stroke-width='0.3'/%3E%3Ccircle cx='100' cy='100' r='40' fill='none' stroke='%23C9943A' stroke-width='0.3'/%3E%3C/svg%3E")`, backgroundSize: '200px 200px', backgroundPosition: 'center' }}
            />
            <div className="px-5 py-5 space-y-3 relative z-[1]">
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

              {NAV_LINKS.map(link => {
                const isActive = location.pathname === link.href ||
                  (link.href !== '/' && location.pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'block text-sm py-2 px-3 rounded-lg transition-colors',
                      isActive
                        ? 'text-primary-light bg-primary/5'
                        : 'text-muted-foreground hover:bg-primary/5',
                    )}
                  >
                    {t(link.labelKey as any)}
                  </Link>
                );
              })}

              <div className="border-t border-border pt-3 space-y-3">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
