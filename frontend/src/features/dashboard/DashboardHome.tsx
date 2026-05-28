import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Moon, Star, Heart, MessageCircle, ArrowRight, Sparkles, TrendingUp, FileText, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/store';

export function DashboardHome() {
  const { user } = useAuthStore();
  const { data: analytics } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => api.get<{ reportsGenerated: number; chatSessions: number; totalCost: number }>('/api/user/analytics'),
  });

  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.get<{ plan: string; status: string }>('/api/payments/subscription'),
  });

  const quickActions = [
    { path: '/dashboard/horoscope', icon: Moon, label: 'Daily Horoscope', desc: 'Check your celestial forecast', color: 'text-blue-500' },
    { path: '/dashboard/kundli', icon: Star, label: 'Birth Chart', desc: 'Your Vedic blueprint', color: 'text-purple-500' },
    { path: '/dashboard/compatibility', icon: Heart, label: 'Compatibility', desc: 'Gun Milan analysis', color: 'text-pink-500' },
    { path: '/dashboard/chat', icon: MessageCircle, label: 'AI Astrologer', desc: 'Ask anything', color: 'text-amber-500' },
  ];

  const stats = [
    { label: 'Reports Generated', value: analytics?.data?.reportsGenerated ?? 0, icon: FileText, color: 'text-gold' },
    { label: 'Chat Sessions', value: analytics?.data?.chatSessions ?? 0, icon: MessageCircle, color: 'text-blue-500' },
    { label: 'Active Plan', value: sub?.data?.plan ?? 'Free', icon: Sparkles, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold">Welcome, {user?.name}</h1>
        <p className="text-ink/60 dark:text-parchment/60 mt-1">Your cosmic dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-ink/5 dark:bg-white/5 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-serif">{stat.value}</p>
              <p className="text-xs text-ink/60 dark:text-parchment/60">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-serif font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <Link key={i} to={action.path}>
              <Card className="group hover:border-gold/50 transition-all cursor-pointer h-full">
                <action.icon className={`w-8 h-8 mb-3 ${action.color}`} />
                <h3 className="font-serif font-semibold mb-1">{action.label}</h3>
                <p className="text-xs text-ink/60 dark:text-parchment/60">{action.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {sub?.data?.plan === 'FREE' && (
        <Card className="border-gold/30 bg-gold/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-semibold">Upgrade to Pro</h3>
              <p className="text-sm text-ink/60 dark:text-parchment/60">Get AI chat, compatibility analysis, and more.</p>
            </div>
            <Link to="/pricing">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-cosmic text-xs font-sans font-bold uppercase tracking-widest rounded-lg hover:bg-gold/90 transition-colors">
                View Plans <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
