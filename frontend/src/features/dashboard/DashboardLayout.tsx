import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Home, Moon, Star, Heart, MessageCircle, Settings, BarChart3, Users, LogOut, Menu, X, Sun, User } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthStore, useThemeStore } from '@/lib/store';
import { PremiumButton } from '@/components/PremiumButton';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Overview' },
  { path: '/dashboard/horoscope', icon: Moon, label: 'Horoscope' },
  { path: '/dashboard/kundli', icon: Star, label: 'Birth Chart' },
  { path: '/dashboard/compatibility', icon: Heart, label: 'Compatibility' },
  { path: '/dashboard/moon', icon: Moon, label: 'Moon Phase' },
  { path: '/dashboard/chat', icon: MessageCircle, label: 'AI Chat' },
  { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

const adminItems = [
  { path: '/admin', icon: BarChart3, label: 'Admin' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { setTheme, resolved } = useThemeStore();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const allItems = [...navItems, ...(isAdmin ? adminItems : [])];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-parchment dark:bg-cosmic flex">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-cosmic-light/90 backdrop-blur-2xl border-r border-ink/10 dark:border-white/[0.06] transform transition-none lg:translate-x-0 lg:static lg:z-auto',
        )}
        style={{ boxShadow: sidebarOpen ? '20px 0 40px rgba(0,0,0,0.1)' : 'none' }}
      >
        <div className="p-5 border-b border-ink/10 dark:border-white/[0.06]">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <span className="font-serif text-lg font-semibold bg-gradient-to-r from-gold to-amber-400 bg-clip-text text-transparent">Soma & Surya</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {allItems.map((item) => {
            const active = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <motion.div key={item.path} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={item.path}
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
              </motion.div>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-ink/10 dark:border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <motion.div whileHover={{ scale: 1.1 }} className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/20 to-amber-400/20 flex items-center justify-center">
              <User className="w-4 h-4 text-gold" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-ink/40 dark:text-parchment/40 truncate">{user?.email}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ x: 3 }}
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-ink/40 dark:text-parchment/40 hover:text-red-500 transition-colors w-full py-1.5"
          >
            <LogOut className="w-4 h-4" /> Logout
          </motion.button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 glass border-b border-ink/5 dark:border-white/[0.04]">
          <div className="flex items-center justify-between px-4 h-14 md:h-16">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="lg:hidden p-2"
              onClick={() => setSidebarOpen(true)}
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
            <div className="flex items-center gap-3 ml-auto">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
                className="p-2 hover:bg-ink/5 dark:hover:bg-white/5 rounded-full transition-colors"
                aria-label="Toggle theme"
              >
                {resolved === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
