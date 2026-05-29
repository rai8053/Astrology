import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Moon, Star, Heart, MessageCircle, ArrowRight, Sparkles, FileText, Sun, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { useAuthStore } from '@/lib/store';
import { staggerContainer, staggerItem, easeOut } from '@/lib/animations';
import { StatsSkeleton } from '@/components/Skeleton';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', icon: Sun };
  if (h < 17) return { text: 'Good Afternoon', icon: Sun };
  return { text: 'Good Evening', icon: Moon };
}

export function DashboardHome() {
  const { user } = useAuthStore();
  const greeting = getGreeting();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => api.get<{ reportsGenerated: number; chatSessions: number; totalCost: number }>('/api/user/analytics'),
  });

  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.get<{ plan: string; status: string }>('/api/payments/subscription'),
  });

  const quickActions = [
    { path: '/dashboard/horoscope', icon: Moon, label: 'Daily Horoscope', desc: 'Check your celestial forecast', color: 'text-blue-400', gradient: 'from-blue-500/20 to-transparent' },
    { path: '/dashboard/kundli', icon: Star, label: 'Birth Chart', desc: 'Your Vedic blueprint', color: 'text-purple-400', gradient: 'from-purple-500/20 to-transparent' },
    { path: '/dashboard/compatibility', icon: Heart, label: 'Compatibility', desc: 'Gun Milan analysis', color: 'text-pink-400', gradient: 'from-pink-500/20 to-transparent' },
    { path: '/dashboard/chat', icon: MessageCircle, label: 'AI Astrologer', desc: 'Ask anything', color: 'text-amber-400', gradient: 'from-amber-500/20 to-transparent' },
  ];

  const stats = [
    { label: 'Reports Generated', value: analytics?.data?.reportsGenerated ?? 0, icon: FileText, color: 'text-gold' },
    { label: 'Chat Sessions', value: analytics?.data?.chatSessions ?? 0, icon: MessageCircle, color: 'text-blue-400' },
    { label: 'Active Plan', value: sub?.data?.plan ?? 'Free', icon: Sparkles, color: 'text-purple-400', isString: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <motion.div
          animate={{ rotate: [0, 5, 0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold/20 to-amber-400/20 flex items-center justify-center"
        >
          <greeting.icon className="w-6 h-6 text-gold" />
        </motion.div>
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">
            {greeting.text}, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-ink/50 dark:text-parchment/50 mt-1 flex items-center gap-2">
            <span>Your cosmic dashboard</span>
            {sub?.data?.plan && sub.data.plan !== 'FREE' && (
              <>
                <span className="w-1 h-1 rounded-full bg-gold/40" />
                <span className="text-gold text-xs font-sans font-semibold uppercase tracking-wider">{sub.data.plan}</span>
              </>
            )}
          </p>
        </div>
      </motion.div>

      {analyticsLoading ? (
        <StatsSkeleton />
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={i} variants={staggerItem}>
              <PremiumCard glass>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}/10 to-transparent ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <motion.p className="text-2xl font-bold font-serif">
                      {stat.isString ? (
                        stat.value
                      ) : (
                        <AnimatedCounter to={stat.value as number} duration={2} delay={i * 0.15} />
                      )}
                    </motion.p>
                    <p className="text-xs text-ink/50 dark:text-parchment/50">{stat.label}</p>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-serif font-semibold">Quick Actions</h2>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="w-6 h-6"
          >
            <Sparkles className="w-4 h-4 text-gold/40" />
          </motion.div>
        </div>
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <motion.div key={i} variants={staggerItem}>
              <Link to={action.path}>
                <PremiumCard hover glass className="group h-full relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color}/10 to-transparent flex items-center justify-center mb-3 ${action.color}`}
                    >
                      <action.icon className="w-5 h-5" />
                    </motion.div>
                    <h3 className="font-serif font-semibold mb-1 group-hover:text-gold transition-colors">{action.label}</h3>
                    <p className="text-xs text-ink/50 dark:text-parchment/50">{action.desc}</p>
                  </div>
                </PremiumCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {sub?.data?.plan === 'FREE' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PremiumCard glow glass className="border-gold/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gold/[0.03] via-transparent to-gold/[0.03]" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0"
                >
                  <Zap className="w-5 h-5 text-gold" />
                </motion.div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-gold">Unlock Premium Features</h3>
                  <p className="text-sm text-ink/50 dark:text-parchment/50">Get AI chat, compatibility analysis, and more.</p>
                </div>
              </div>
              <Link to="/pricing">
                <motion.span
                  whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(212,175,55,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold to-amber-400 text-cosmic text-xs font-sans font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-gold/20 hover:shadow-gold/30 transition-all cursor-pointer"
                >
                  View Plans <ArrowRight className="w-3 h-3" />
                </motion.span>
              </Link>
            </div>
          </PremiumCard>
        </motion.div>
      )}
    </motion.div>
  );
}
