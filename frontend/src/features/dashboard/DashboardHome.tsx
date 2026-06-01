import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Moon, Sun, Heart, MessageCircle, ArrowRight, Sparkles, Star, Zap, Hash, Palette, Gem, Flame, Calendar, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/PremiumButton';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { useAuthStore } from '@/lib/store';
import { useT } from '@/lib/i18n/useT';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { StatsSkeleton } from '@/components/Skeleton';
import { usePersonalDashboard } from './components/usePersonalDashboard';
import { useStreak } from '@/lib/useStreak';
import { AstrologySnapshotCard } from './components/AstrologySnapshot';
import { HoroscopeSection } from './components/HoroscopeSection';
import { CosmicEnergyCard } from './components/CosmicEnergyScore';
import { TransitAlertsCard } from './components/TransitAlerts';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { key: 'dashboard.greetingMorning' as const, icon: Sun };
  if (h < 17) return { key: 'dashboard.greetingAfternoon' as const, icon: Sun };
  return { key: 'dashboard.greetingEvening' as const, icon: Moon };
}

export function DashboardHome() {
  const { t } = useT();
  const { user } = useAuthStore();
  const greeting = getGreeting();
  const { data: dashData, isLoading: dashLoading, error: dashError, period, changePeriod } = usePersonalDashboard();
  const [showMoreActions, setShowMoreActions] = useState(false);
  const streak = useStreak();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => api.get<{ reportsGenerated: number; chatSessions: number; totalCost: number }>('/api/user/analytics'),
  });

  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.get<{ plan: string; status: string }>('/api/payments/subscription'),
  });

  const previewActions = [
    { path: '/dashboard/kundli', icon: Star, label: t('dashboard.actionBirthChart'), desc: t('dashboard.actionBirthChartDesc'), color: 'text-purple-400', gradient: 'from-purple-500/20 to-transparent' },
    { path: '/dashboard/compatibility', icon: Heart, label: t('dashboard.actionCompatibility'), desc: t('dashboard.actionCompatibilityDesc'), color: 'text-pink-400', gradient: 'from-pink-500/20 to-transparent' },
  ];

  const allActions = [
    { path: '/dashboard/horoscope', icon: Moon, label: t('dashboard.actionHoroscope'), desc: t('dashboard.actionHoroscopeDesc'), color: 'text-blue-400', gradient: 'from-blue-500/20 to-transparent' },
    { path: '/dashboard/chat', icon: MessageCircle, label: t('dashboard.actionAiAstrologer'), desc: t('dashboard.actionAiAstrologerDesc'), color: 'text-amber-400', gradient: 'from-amber-500/20 to-transparent' },
    { path: '/dashboard/moon', icon: Moon, label: t('dashboard.actionMoonPhase'), desc: t('dashboard.actionMoonPhaseDesc'), color: 'text-sky-400', gradient: 'from-sky-500/20 to-transparent' },
    { path: '/dashboard/settings', icon: Sun, label: t('dashboard.actionSettings'), desc: t('dashboard.actionSettingsDesc'), color: 'text-gold', gradient: 'from-gold/20 to-transparent' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-4">
        <motion.div
          animate={{ rotate: [0, 5, 0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold/20 to-amber-400/20 flex items-center justify-center"
        >
          <greeting.icon className="w-6 h-6 text-gold" />
        </motion.div>
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">{t(greeting.key)}, <span className="text-gradient">{user?.name?.split(' ')[0] ?? t('common.seekerFallback')}</span></h1>
          <p className="text-ink/50 dark:text-parchment/50 mt-1 flex items-center gap-2">
            <span>{t('dashboard.subtitle')}</span>
            {sub?.data?.plan && sub.data.plan !== 'FREE' && (
              <>
                <span className="w-1 h-1 rounded-full bg-gold/40" />
                <span className="text-gold text-xs font-sans font-semibold uppercase tracking-wider">{sub.data.plan}</span>
              </>
            )}
          </p>
        </div>
      </motion.div>

      {dashError ? (
        <PremiumCard glass className="border-red-500/30">
          <p className="text-sm text-red-400 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {dashError}
          </p>
          {dashError.includes('Birth details') && (
            <Link to="/dashboard/settings" className="text-xs text-gold hover:underline mt-2 inline-block">
              {t('dashboard.updateProfile')}
            </Link>
          )}
        </PremiumCard>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <HoroscopeSection data={dashData?.horoscope} isLoading={dashLoading} period={period} onPeriodChange={changePeriod} />
          <TransitAlertsCard data={dashData?.transitAlerts} isLoading={dashLoading} />
        </div>
        <div className="space-y-6">
          <AstrologySnapshotCard data={dashData?.snapshot} isLoading={dashLoading} />
          <CosmicEnergyCard data={dashData?.cosmicEnergy} isLoading={dashLoading} />

          {/* Lucky Elements */}
          {dashData?.horoscope && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <PremiumCard glass>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Gem className="w-3.5 h-3.5 text-gold" />
                  </div>
                  <h3 className="font-serif text-base font-semibold">{t('dashboard.luckyElements')}</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-ink/[0.02] dark:bg-white/[0.02] text-center">
                    <Hash className="w-4 h-4 text-gold/60 mx-auto mb-1" />
                    <p className="text-[10px] uppercase tracking-wider font-sans font-bold text-ink/40 dark:text-parchment/40">{t('dashboard.luckyNumber')}</p>
                    <p className="text-lg font-bold font-serif text-gold">{dashData.horoscope.luckyNumber}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-ink/[0.02] dark:bg-white/[0.02] text-center">
                    <Palette className="w-4 h-4 text-gold/60 mx-auto mb-1" />
                    <p className="text-[10px] uppercase tracking-wider font-sans font-bold text-ink/40 dark:text-parchment/40">{t('dashboard.luckyColor')}</p>
                    <p className="text-xs font-bold font-serif text-gold truncate">{dashData.horoscope.luckyColor.split('/')[0]?.trim()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-ink/[0.02] dark:bg-white/[0.02] text-center">
                    <Gem className="w-4 h-4 text-gold/60 mx-auto mb-1" />
                    <p className="text-[10px] uppercase tracking-wider font-sans font-bold text-ink/40 dark:text-parchment/40">{t('dashboard.luckyGemstone')}</p>
                    <p className="text-xs font-bold font-serif text-gold truncate">{dashData?.snapshot?.element === 'Fire' ? t('dashboard.gemstoneRuby') : dashData?.snapshot?.element === 'Water' ? t('dashboard.gemstonePearl') : dashData?.snapshot?.element === 'Air' ? t('dashboard.gemstoneEmerald') : t('dashboard.gemstoneSapphire')}</p>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          )}

          {/* Daily Streak */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <PremiumCard glass>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Flame className="w-3.5 h-3.5 text-gold" />
                </div>
                <h3 className="font-serif text-base font-semibold">{t('dashboard.streak')}</h3>
              </div>
              <div className="flex items-center gap-4">
                <motion.div
                  key={streak.currentStreak}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  className="text-4xl font-bold font-serif text-gold"
                >
                  {streak.currentStreak}
                </motion.div>
                <div>
                  <p className="text-xs text-ink/60 dark:text-parchment/60 leading-snug">{streak.currentStreak === 0 ? t('dashboard.streakStart') : `${streak.currentStreak === 1 ? t('dashboard.streakDays') : t('dashboard.streakConsecutive')} ${t('dashboard.ofCosmicConnection')}`}</p>
                  <p className="text-[9px] text-ink/40 dark:text-parchment/40 mt-0.5">{t('dashboard.streakBest')} {streak.longestStreak} {t('dashboard.streakDays')}</p>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        </div>
      </div>

      {analyticsLoading ? (
        <StatsSkeleton />
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: t('dashboard.statReports'), value: analytics?.data?.reportsGenerated ?? 0, icon: Sparkles, color: 'text-gold' },
            { label: t('dashboard.statChatSessions'), value: analytics?.data?.chatSessions ?? 0, icon: MessageCircle, color: 'text-blue-400' },
            { label: t('dashboard.statActivePlan'), value: sub?.data?.plan ?? 'Free', icon: Zap, color: 'text-purple-400', isString: true },
            { label: t('dashboard.statWeeklyScore'), value: dashData?.cosmicEnergy?.score ?? 0, icon: BarChart3, color: 'text-emerald-400', suffix: t('common.of100') },
          ].map((stat, i) => (
            <motion.div key={i} variants={staggerItem}>
              <PremiumCard glass>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}/10 to-transparent ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <motion.p className="text-2xl font-bold font-serif">
                      {stat.isString ? stat.value : <AnimatedCounter to={stat.value as number} duration={2} delay={i * 0.15} />}
                    </motion.p>
                    <p className="text-xs text-ink/50 dark:text-parchment/50">{stat.label} {stat.suffix || ''}</p>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-serif font-semibold">{t('dashboard.quickActions')}</h2>
          <button onClick={() => setShowMoreActions(!showMoreActions)} className="text-xs text-gold hover:underline font-sans">
            {showMoreActions ? t('common.showLess') : t('common.showAll')}
          </button>
        </div>
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {previewActions.map((action, i) => (
            <motion.div key={i} variants={staggerItem}>
              <Link to={action.path}>
                <PremiumCard hover glass className="group relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${action.color}/10 to-transparent flex items-center justify-center ${action.color}`}>
                      <action.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-sm group-hover:text-gold transition-colors">{action.label}</h3>
                      <p className="text-[11px] text-ink/50 dark:text-parchment/50">{action.desc}</p>
                    </div>
                  </div>
                </PremiumCard>
              </Link>
            </motion.div>
          ))}
          {showMoreActions && allActions.map((action, i) => (
            <motion.div key={i + 2} variants={staggerItem}>
              <Link to={action.path}>
                <PremiumCard hover glass className="group relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${action.color}/10 to-transparent flex items-center justify-center ${action.color}`}>
                      <action.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-sm group-hover:text-gold transition-colors">{action.label}</h3>
                      <p className="text-[11px] text-ink/50 dark:text-parchment/50">{action.desc}</p>
                    </div>
                  </div>
                </PremiumCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <PremiumCard glass>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-gold" />
            </div>
            <h3 className="font-serif text-base font-semibold">{t('dashboard.recentActivity')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link to="/dashboard/kundli" className="p-3 rounded-lg bg-ink/[0.02] dark:bg-white/[0.02] hover:bg-ink/[0.04] dark:hover:bg-white/[0.04] transition-colors group">
              <Star className="w-4 h-4 text-gold/60 mb-1.5" />
              <p className="text-xs font-semibold font-serif group-hover:text-gold transition-colors">{t('dashboard.activityBirthChart')}</p>
              <p className="text-[10px] text-ink/40 dark:text-parchment/40">{t('dashboard.activityBirthChartDesc')}</p>
            </Link>
            <Link to="/dashboard/chat" className="p-3 rounded-lg bg-ink/[0.02] dark:bg-white/[0.02] hover:bg-ink/[0.04] dark:hover:bg-white/[0.04] transition-colors group">
              <MessageCircle className="w-4 h-4 text-gold/60 mb-1.5" />
              <p className="text-xs font-semibold font-serif group-hover:text-gold transition-colors">{t('dashboard.activityAiChat')}</p>
              <p className="text-[10px] text-ink/40 dark:text-parchment/40">{t('dashboard.activityAiChatDesc')}</p>
            </Link>
            <Link to="/dashboard/compatibility" className="p-3 rounded-lg bg-ink/[0.02] dark:bg-white/[0.02] hover:bg-ink/[0.04] dark:hover:bg-white/[0.04] transition-colors group">
              <Heart className="w-4 h-4 text-gold/60 mb-1.5" />
              <p className="text-xs font-semibold font-serif group-hover:text-gold transition-colors">{t('dashboard.activityCompatibility')}</p>
              <p className="text-[10px] text-ink/40 dark:text-parchment/40">{t('dashboard.activityCompatibilityDesc')}</p>
            </Link>
          </div>
        </PremiumCard>
      </motion.div>

      {sub?.data?.plan === 'FREE' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <PremiumCard glow glass className="border-gold/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gold/[0.03] via-transparent to-gold/[0.03]" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2.5, repeat: Infinity }} className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-gold" />
                </motion.div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-gold">{t('dashboard.upsellTitle')}</h3>
                  <p className="text-sm text-ink/50 dark:text-parchment/50">{t('dashboard.upsellDesc')}</p>
                </div>
              </div>
              <Link to="/pricing">
                <motion.span whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(212,175,55,0.3)' }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold to-amber-400 text-cosmic text-xs font-sans font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-gold/20 hover:shadow-gold/30 transition-all cursor-pointer">
                  {t('dashboard.upsellCta')} <ArrowRight className="w-3 h-3" />
                </motion.span>
              </Link>
            </div>
          </PremiumCard>
        </motion.div>
      )}
    </motion.div>
  );
}
