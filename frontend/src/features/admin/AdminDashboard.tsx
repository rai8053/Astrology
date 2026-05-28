import { useQuery } from '@tanstack/react-query';
import { Users, CreditCard, FileText, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';

export function AdminDashboard() {
  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get<{ totalUsers: number; activeSubscriptions: number; reportsThisMonth: number; revenueThisMonth: number }>('/api/admin/analytics'),
  });

  const stats = [
    { label: 'Total Users', value: analytics?.data?.totalUsers ?? 0, icon: Users, color: 'text-blue-500' },
    { label: 'Active Subscriptions', value: analytics?.data?.activeSubscriptions ?? 0, icon: CreditCard, color: 'text-green-500' },
    { label: 'Reports This Month', value: analytics?.data?.reportsThisMonth ?? 0, icon: FileText, color: 'text-purple-500' },
    { label: 'Revenue (est.)', value: `$${(analytics?.data?.revenueThisMonth ?? 0).toFixed(2)}`, icon: TrendingUp, color: 'text-gold' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-ink/5 dark:bg-white/5 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-serif">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
              <p className="text-xs text-ink/60 dark:text-parchment/60">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
