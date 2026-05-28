import { Outlet, Link, useLocation } from 'react-router-dom';
import { BarChart3, Users, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const adminLinks = [
  { path: '/admin', icon: BarChart3, label: 'Overview' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
];

export function AdminLayout() {
  const location = useLocation();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">Admin Panel</h1>
          <p className="text-ink/50 dark:text-parchment/50 mt-1">Manage your platform</p>
        </motion.div>
        <motion.div whileHover={{ x: -3 }}>
          <Link to="/dashboard" className="flex items-center gap-1 text-sm text-ink/40 dark:text-parchment/40 hover:text-gold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </motion.div>
      </div>

      <div className="flex gap-1 border-b border-ink/10 dark:border-white/[0.06] pb-1">
        {adminLinks.map((link) => (
          <Link key={link.path} to={link.path}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-sans transition-colors border-b-2 -mb-[1px]',
              location.pathname === link.path
                ? 'border-gold text-gold'
                : 'border-transparent text-ink/40 dark:text-parchment/40 hover:text-ink dark:hover:text-parchment',
            )}>
            <link.icon className="w-4 h-4" /> {link.label}
          </Link>
        ))}
      </div>

      <Outlet />
    </motion.div>
  );
}
