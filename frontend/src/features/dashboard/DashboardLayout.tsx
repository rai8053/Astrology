import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Home, Moon, Star, Heart, MessageCircle, Settings, BarChart3, Users, LogOut, Menu, X, Sun, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore, useThemeStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';

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
  const { theme, setTheme } = useThemeStore();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const allItems = [...navItems, ...(isAdmin ? adminItems : [])];

  return (
    <div className="min-h-screen bg-parchment dark:bg-cosmic flex">
      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-cosmic-light border-r border-ink/10 dark:border-white/10 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className="p-4 border-b border-ink/10 dark:border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <span className="font-serif text-lg font-semibold">Soma & Surya</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {allItems.map((item) => {
            const active = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-all',
                  active
                    ? 'bg-gold/10 text-gold font-semibold'
                    : 'text-ink/60 dark:text-parchment/60 hover:bg-ink/5 dark:hover:bg-white/5',
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-ink/10 dark:border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
              <User className="w-4 h-4 text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-ink/50 dark:text-parchment/50 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-ink/50 dark:text-parchment/50 hover:text-red-500 transition-colors w-full">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-cosmic/80 backdrop-blur-lg border-b border-ink/10 dark:border-white/10">
          <div className="flex items-center justify-between px-4 h-14">
            <button className="lg:hidden p-2" onClick={() => setSidebarOpen(true)} aria-label="Menu">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 ml-auto">
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 hover:bg-ink/5 dark:hover:bg-white/5 rounded-full" aria-label="Toggle theme">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
