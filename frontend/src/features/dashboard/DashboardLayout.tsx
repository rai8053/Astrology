import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Home, Moon, Star, Heart, MessageCircle, Settings, BarChart3, Users, LogOut, Menu, X, Sun, User, Crown, Bell, ChevronDown, Shield, Globe } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import { useThemeStore } from '@/hooks/useTheme';
import { PremiumButton } from '@/components/PremiumButton';
import { useTranslation } from '@/lib/i18n';
import { useI18nStore } from '@/lib/i18n/store';
import { ALL_LANGUAGES, type LanguageEntry } from '@/data/languages';

function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useThemeStore();
  const { t: trans } = useTranslation();
  const t = theme || 'system';
  const cycle = { light: 'dark' as const, dark: 'system' as const, system: 'light' as const };
  const next = cycle[t];
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(next)}
      className={cn('p-2 hover:bg-text-secondary/5 dark:hover:bg-dark-text-secondary/5 rounded-full transition-colors relative', className)}
      aria-label={`Theme: ${t}. Click for ${next}.`}
    >
      {t === 'dark' ? <Sun className="w-4 h-4" /> : t === 'light' ? <Moon className="w-4 h-4" /> : (
        <span className="text-[10px] font-bold font-sans w-4 h-4 flex items-center justify-center">A</span>
      )}
    </motion.button>
  );
}

const DROPDOWN_H = 320;

interface LangRowProps {
  language: string;
  select: (lang: LanguageEntry) => void;
}

function LangRow({ index, language, select }: LangRowProps & { index: number }) {
  const lang = ALL_LANGUAGES[index];
  if (!lang) return null;
  return (
    <button
      onClick={() => select(lang)}
      className={`block w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${
        lang.code === language
          ? 'bg-accent/10 text-accent font-medium'
          : 'text-text-secondary dark:text-dark-text-secondary hover:bg-accent/5 hover:text-text-primary dark:hover:text-dark-text-primary'
      }`}
    >
      {lang.native} <span className="text-text-tertiary dark:text-dark-text-tertiary">({lang.short})</span>
    </button>
  );
}

function LanguageSelector() {
  const { language, setLanguage } = useI18nStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open) {
      listRef.current?.focus();
      const idx = ALL_LANGUAGES.findIndex((l) => l.code === language);
      if (idx >= 0 && listRef.current) {
        const el = listRef.current.children[idx] as HTMLElement | undefined;
        el?.scrollIntoView({ block: 'center', behavior: 'instant' });
      }
    }
  }, [open, language]);

  const select = useCallback((lang: LanguageEntry) => {
    setLanguage(lang.code as any);
    setOpen(false);
    triggerRef.current?.focus();
  }, [setLanguage]);

  const current = ALL_LANGUAGES.find((l) => l.code === language);

  return (
    <div className="relative" ref={ref}>
      <motion.button
        ref={triggerRef}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-0.5 px-2 py-2 hover:bg-ink/5 dark:hover:bg-white/5 rounded-full transition-colors"
        title={current?.native || 'English'}
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="text-[10px] font-semibold font-sans">{current?.short || 'EN'}</span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 card-border rounded-xl premium-shadow z-50"
            style={{ width: 228, height: DROPDOWN_H, paddingRight: 6 }}>
            <div ref={listRef} tabIndex={-1} className="overflow-y-scroll w-full h-full outline-none rounded-xl">
              {ALL_LANGUAGES.map((lang, i) => (
                <LangRow
                  key={lang.code}
                  index={i}
                  language={language}
                  select={select}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarTriggerRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: t('layout.overview') },
    { path: '/dashboard/kundli', icon: Star, label: t('nav.kundli') },
    { path: '/dashboard/horoscope', icon: Moon, label: t('nav.horoscope') },
    { path: '/dashboard/compatibility', icon: Heart, label: t('nav.compatibility') },
    { path: '/dashboard/moon', icon: Moon, label: t('nav.moon') },
    { path: '/dashboard/chat', icon: MessageCircle, label: t('layout.astrologer') },
  ];

  const secondaryItems = [
    { path: '/dashboard/settings', icon: Settings, label: t('nav.settings') },
    { path: '/pricing', icon: Crown, label: t('nav.pricing') },
  ];

  const adminItems = [
    { path: '/admin', icon: BarChart3, label: t('nav.admin') },
    { path: '/admin/users', icon: Users, label: t('admin.users') },
    { path: '/admin/analytics', icon: BarChart3, label: t('admin.analytics') },
  ];

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isActive = (path: string) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));

  const closeUserMenu = useCallback(() => {
    setUserMenuOpen(false);
    userMenuTriggerRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeUserMenu(); setSidebarOpen(false); sidebarTriggerRef.current?.focus(); }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [closeUserMenu]);

  useEffect(() => {
    setUserMenuOpen(false);
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setUserMenuOpen(false);
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const container = sidebarRef.current;
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
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const displayName = user?.name?.trim() || localStorage.getItem('googleName') || '';
  const initials = displayName
    ? displayName.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const allNavItems = [...navItems, ...secondaryItems, ...(isAdmin ? adminItems : [])];

  return (
    <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 glass-nav border-b border-border-primary dark:border-dark-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Left: Logo + Desktop Nav */}
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="hidden sm:block font-sans text-sm font-semibold tracking-tight">
                  Soma<span className="text-text-tertiary dark:text-dark-text-tertiary font-normal">&</span>Surya
                </span>
              </Link>
              <nav className="hidden lg:flex items-center gap-0.5">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={isActive(item.path) ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors',
                      isActive(item.path)
                        ? 'bg-accent/10 text-accent'
                        : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-accent/5',
                    )}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              <ThemeToggle />
              <LanguageSelector />

              <Link to="/pricing">
                <PremiumButton variant="ghost" size="sm" className="hidden sm:flex">
                  <Crown className="w-3 h-3" /> {t('layout.upgrade')}
                </PremiumButton>
              </Link>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  ref={userMenuTriggerRef}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent/5 transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center text-[11px] font-semibold text-accent">
                    {initials}
                  </div>
                  <motion.div animate={{ rotate: userMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="hidden md:block">
                    <ChevronDown className="w-3 h-3 text-text-tertiary dark:text-dark-text-tertiary" />
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 card-border rounded-xl premium-shadow overflow-hidden z-50" {/* deslop-ignore 22 */}
                    >
                      <div className="px-4 py-3 border-b border-border-primary dark:border-dark-border-primary">
                        <p className="text-sm font-medium truncate">{displayName}</p>
                        <p className="text-[11px] text-text-tertiary dark:text-dark-text-tertiary truncate">{user?.email}</p>
                      </div>
                      <div className="p-1.5">
                        {[{ to: '/dashboard', icon: User, label: t('nav.dashboard') }, { to: '/dashboard/settings', icon: Settings, label: t('nav.userSettings') }, { to: '/pricing', icon: Crown, label: t('nav.upgradePlan') }].map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => closeUserMenu()}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-accent/5 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors"
                          >
                            <item.icon className="w-3.5 h-3.5" />
                            {item.label}
                          </Link>
                        ))}
                        {isAdmin && (
                          <>
                            <div className="my-1 border-t border-border-primary dark:border-dark-border-primary" />
                            <Link
                              to="/admin"
                              onClick={() => closeUserMenu()}
                              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-accent/5 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors"
                            >
                              <Shield className="w-3.5 h-3.5" />
                              {t('nav.adminPanel')}
                            </Link>
                          </>
                        )}
                        <div className="my-1 border-t border-border-primary dark:border-dark-border-primary" />
                        <button
                          onClick={() => { closeUserMenu(); handleLogout(); }}
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

              {/* Mobile Hamburger */}
              <motion.button
                ref={sidebarTriggerRef}
                whileTap={{ scale: 0.9 }}
                className="lg:hidden p-2 -mr-2"
                onClick={() => setSidebarOpen(true)}
                aria-label={t('nav.menu')}
              >
                <Menu className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <motion.aside
        ref={sidebarRef}
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-bg-primary dark:bg-dark-bg-secondary/95 backdrop-blur-2xl border-r border-border-primary dark:border-dark-border-primary lg:hidden',
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-primary dark:border-dark-border-primary">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="font-sans text-lg font-semibold tracking-tight">Soma<span className="text-text-tertiary dark:text-dark-text-tertiary font-normal">&</span>Surya</span>
          </Link>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSidebarOpen(false)} className="p-1">
            <X className="w-5 h-5" />
          </motion.button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-scroll max-h-[calc(100vh-140px)]">
          {allNavItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-colors duration-200',
                  active
                    ? 'bg-accent/10 text-accent font-semibold shadow-sm'
                    : 'text-text-tertiary hover:bg-accent/5 hover:text-text-primary dark:hover:text-dark-text-primary',
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-primary dark:border-dark-border-primary">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <User className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-text-tertiary truncate">{user?.email}</p>
            </div>
            <LanguageSelector />
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-text-tertiary hover:text-red-500 transition-colors w-full py-1.5"
          >
            <LogOut className="w-4 h-4" /> {t('nav.signOut')}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
