import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, Moon, Sun, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/Button';
import { useAuthStore, useThemeStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const isLanding = location.pathname === '/';

  const links = isLanding
    ? [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'FAQ', href: '#faq' },
      ]
    : [];

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isLanding ? 'bg-transparent' : 'bg-white/80 dark:bg-cosmic/80 backdrop-blur-lg border-b border-ink/5 dark:border-white/5',
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <span className="font-serif text-xl font-semibold">Soma & Surya</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-sans text-ink/70 dark:text-parchment/70 hover:text-gold transition-colors">
                {l.label}
              </a>
            ))}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 hover:bg-ink/5 dark:hover:bg-white/5 rounded-full transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <User className="w-3.5 h-3.5" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
                <Link to="/register"><Button size="sm">Get Started</Button></Link>
              </div>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white dark:bg-cosmic border-t border-ink/5 dark:border-white/5">
          <div className="px-4 py-4 space-y-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-sm py-2">{l.label}</a>
            ))}
            {isAuthenticated ? (
              <Link to="/dashboard" onClick={() => setOpen(false)}><Button className="w-full">Dashboard</Button></Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}><Button variant="secondary" className="w-full">Sign In</Button></Link>
                <Link to="/register" onClick={() => setOpen(false)}><Button className="w-full">Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
