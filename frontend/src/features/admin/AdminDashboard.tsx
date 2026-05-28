import { useQuery } from '@tanstack/react-query';
import { Users, CreditCard, FileText, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { StatsSkeleton } from '@/components/Skeleton';

export function AdminDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get<{ totalUsers: number; activeSubscriptions: number; reportsThisMonth: number; revenueThisMonth: number }>('/api/admin/analytics'),
  });

  const stats = [
    { label: 'Total Users', value: analytics?.data?.totalUsers ?? 0, icon: Users, color: 'text-blue-400', gradient: 'from-blue-500/20' },
    { label: 'Active Subscriptions', value: analytics?.data?.activeSubscriptions ?? 0, icon: CreditCard, color: 'text-green-400', gradient: 'from-green-500/20' },
    { label: 'Reports This Month', value: analytics?.data?.reportsThisMonth ?? 0, icon: FileText, color: 'text-purple-400', gradient: 'from-purple-500/20' },
    { label: 'Revenue (est.)', value: `$${(analytics?.data?.revenueThisMonth ?? 0).toFixed(2)}`, icon: TrendingUp, color: 'text-gold', gradient: 'from-gold/20' },
  ];

  if (isLoading) return <StatsSkeleton />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <PremiumCard glass className="relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} to-transparent opacity-30`} />
              <div className="relative flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-ink/5 dark:bg-white/[0.04] ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-serif">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                  <p className="text-xs text-ink/40 dark:text-parchment/40">{stat.label}</p>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
