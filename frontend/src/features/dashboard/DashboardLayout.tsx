import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Home, Moon, Star, Heart, MessageCircle, Settings, BarChart3, Users, LogOut, Menu, X, Sun, User, Crown, Bell, ChevronDown, Shield } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthStore, useThemeStore } from '@/lib/store';
import { PremiumButton } from '@/components/PremiumButton';
import { useT } from '@/lib/i18n/useT';

function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useThemeStore();
  const { t: trans } = useT();
  const t = theme || 'system';
  const cycle = { light: 'dark' as const, dark: 'system' as const, system: 'light' as const };
  const next = cycle[t];
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(next)}
      className={cn('p-2 hover:bg-ink/5 dark:hover:bg-white/5 rounded-full transition-colors relative', className)}
      aria-label={`Theme: ${t}. Click for ${next}.`}
      title={`${t === 'light' ? trans('settings.light') : t === 'dark' ? trans('settings.dark') : trans('settings.system')} ${trans('settings.mode')}`}
    >
      {t === 'dark' ? <Sun className="w-4 h-4" /> : t === 'light' ? <Moon className="w-4 h-4" /> : (
        <span className="text-[10px] font-bold font-mono w-4 h-4 flex items-center justify-center">A</span>
      )}
    </motion.button>
  );
}

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { t } = useT();

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

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setUserMenuOpen(false); setSidebarOpen(false); }
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

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const allNavItems = [...navItems, ...secondaryItems, ...(isAdmin ? adminItems : [])];

  return (
    <div className="min-h-screen bg-parchment dark:bg-cosmic">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 glass border-b border-ink/5 dark:border-white/[0.04]">
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
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all',
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

              <Link to="/pricing">
                <PremiumButton variant="ghost" size="sm" className="hidden sm:flex">
                  <Crown className="w-3 h-3" /> {t('layout.upgrade')}
                </PremiumButton>
              </Link>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <motion.button
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
                      className="absolute right-0 mt-2 w-52 card-border rounded-xl premium-shadow overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-border-primary dark:border-dark-border-primary">
                        <p className="text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-[11px] text-text-tertiary dark:text-dark-text-tertiary truncate">{user?.email}</p>
                      </div>
                      <div className="p-1.5">
                        {[{ to: '/dashboard', icon: User, label: t('nav.dashboard') }, { to: '/dashboard/settings', icon: Settings, label: t('nav.userSettings') }, { to: '/pricing', icon: Crown, label: t('nav.upgradePlan') }].map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setUserMenuOpen(false)}
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
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-accent/5 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors"
                            >
                              <Shield className="w-3.5 h-3.5" />
                              {t('nav.adminPanel')}
                            </Link>
                          </>
                        )}
                        <div className="my-1 border-t border-border-primary dark:border-dark-border-primary" />
                        <button
                          onClick={() => { setUserMenuOpen(false); handleLogout(); }}
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
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-cosmic-light/90 backdrop-blur-2xl border-r border-ink/10 dark:border-white/[0.06] lg:hidden',
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-ink/10 dark:border-white/[0.06]">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <Sparkles className="w-5 h-5 text-gold" />
            <span className="font-serif text-lg font-semibold bg-gradient-to-r from-gold to-amber-400 bg-clip-text text-transparent">Soma & Surya</span>
          </Link>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSidebarOpen(false)} className="p-1">
            <X className="w-5 h-5" />
          </motion.button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {allNavItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-all duration-200',
                  active
                    ? 'bg-gold/10 text-gold font-semibold shadow-sm'
                    : 'text-ink/50 dark:text-parchment/50 hover:bg-ink/5 dark:hover:bg-white/[0.04] hover:text-ink dark:hover:text-parchment',
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-ink/10 dark:border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/20 to-amber-400/20 flex items-center justify-center">
              <User className="w-4 h-4 text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-ink/40 dark:text-parchment/40 truncate">{user?.email}</p>
            </div>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-ink/40 dark:text-parchment/40 hover:text-red-500 transition-colors w-full py-1.5"
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
