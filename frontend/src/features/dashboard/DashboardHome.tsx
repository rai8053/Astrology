import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Moon, Sun, Heart, MessageCircle, ArrowRight, Sparkles, Star, Zap,
  Flame, Clock, User, Shield, Crown, CalendarDays,
  Gem, Palette, Hash, Globe, ChevronRight, AlertCircle, Orbit, Compass,
  Layers, Sunrise, ArrowUp, ArrowDown, Wind,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/PremiumButton';
import { useAuthStore } from '@/lib/store';
import { useT } from '@/lib/i18n/useT';
import { usePersonalDashboard } from './components/usePersonalDashboard';
import { useStreak } from '@/lib/useStreak';
import { StatCard } from '@/components/astrology/StatCard';
import { ScoreRing } from '@/components/astrology/ScoreRing';
import { PlanetCard } from '@/components/astrology/PlanetCard';
import { HoroscopeCard } from '@/components/astrology/HoroscopeCard';
import type { PersonalDashboardData } from '@shared/types/api';

const stagger = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemAnim = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { key: 'dashboard.greetingMorning' as const, icon: Sun };
  if (h < 17) return { key: 'dashboard.greetingAfternoon' as const, icon: Sun };
  return { key: 'dashboard.greetingEvening' as const, icon: Moon };
}

function safeFormatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString();
  } catch {
    return '—';
  }
}

function Shimmer({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Shimmer className="h-10 w-64" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => <Shimmer key={i} className="h-28" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Shimmer className="h-64" />
        <Shimmer className="h-64" />
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-3 w-3 text-primary" />
      </div>
      <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
    </div>
  );
}

function InsightCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <motion.div variants={itemAnim}>
      <PremiumCard glass>
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="text-sm font-bold text-foreground">{value}</p>
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  );
}

function ActionCard({ to, icon: Icon, label, desc, color }: { to: string; icon: any; label: string; desc: string; color: string }) {
  return (
    <motion.div variants={itemAnim}>
      <Link to={to}>
        <PremiumCard hover glass className="group">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground transition-colors group-hover:text-primary">{label}</p>
              <p className="text-[10px] text-muted-foreground">{desc}</p>
            </div>
          </div>
        </PremiumCard>
      </Link>
    </motion.div>
  );
}

function FileIcon({ type }: { type: string }) {
  switch (type) {
    case 'vedic_profile': return <Star className="h-3 w-3 text-primary" />;
    case 'daily_horoscope': return <Sun className="h-3 w-3 text-amber-400" />;
    case 'compatibility': return <Heart className="h-3 w-3 text-pink-400" />;
    case 'moon_phase': return <Moon className="h-3 w-3 text-blue-400" />;
    default: return <Sparkles className="h-3 w-3 text-muted-foreground" />;
  }
}

export function DashboardHome() {
  const { t } = useT();
  const { user } = useAuthStore();
  const greeting = getGreeting();
  const { data: dash, isLoading: dashLoading, error: dashError } = usePersonalDashboard();
  const streak = useStreak();

  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.get<{ plan: string; status: string }>('/api/payments/subscription').catch(() => ({ success: true, data: { plan: 'FREE', status: 'active' } })),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['dashboard-reports'],
    queryFn: () => api.get<{ id: string; type: string; createdAt: string }[]>('/api/user/reports').catch(() => ({ success: true, data: [] })),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const displayName = user?.name?.trim() || localStorage.getItem('googleName') || '';
  const dashErrMsg = dashError ? (typeof dashError === 'object' && 'message' in dashError ? (dashError as Error).message : String(dashError)) : '';
  const hasBirthDetails = !dashError || !dashErrMsg.toLowerCase().includes('birth details');
  const reports = reportsData?.data || [];
  const d = dash;

  if (dashLoading) return <DashboardSkeleton />;

  if (dashError && dashErrMsg.includes('Birth details')) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <greeting.icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{t(greeting.key)}</h1>
            <p className="mt-1 text-muted-foreground">{t('dashboard.subtitle')}</p>
          </div>
        </div>
        <PremiumCard glass className="text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Star className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 text-xl font-bold">{t('dashboard.setupBirthChart')}</h2>
          <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
            {t('dashboard.setupBirthChartDesc')}
          </p>
          <Link to="/dashboard/settings">
            <PremiumButton icon={<User className="h-4 w-4" />}>{t('dashboard.addBirthDetails')}</PremiumButton>
          </Link>
        </PremiumCard>
      </motion.div>
    );
  }

  if (dashError) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <greeting.icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{t(greeting.key)}</h1>
          </div>
        </div>
        <PremiumCard glass className="!border-red-500/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <p className="text-sm text-red-400">{dashError}</p>
          </div>
        </PremiumCard>
      </motion.div>
    );
  }

  if (!d) return <DashboardSkeleton />;

  const { snapshot, horoscope, cosmicEnergy, planets, dasha, tithi, yoga, transitAlerts, moonPhase } = d;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <motion.div
          animate={{ rotate: [0, 5, 0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10"
        >
          <greeting.icon className="h-6 w-6 text-primary" />
        </motion.div>
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{t(greeting.key)}</h1>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{snapshot.moonRashi || '—'} &middot; {snapshot.nakshatra || '—'}</span>
            {sub?.data?.plan && sub.data.plan !== 'FREE' && (
              <>
                <span className="h-1 w-1 rounded-full bg-primary/40" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{sub.data.plan}</span>
              </>
            )}
          </p>
        </div>
      </motion.div>

      {/* Section 1: Astrology Profile */}
      <motion.div variants={stagger} initial="initial" animate="animate">
        <SectionHeader icon={User} title={t('dashboard.astrologyProfile')} />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <StatCard icon={<Moon className="h-4 w-4 text-blue-400" />} label={t('kundli.moonRashi')} value={snapshot.moonRashi || '—'} />
          <StatCard
            icon={<Star className="h-4 w-4 text-purple-400" />}
            label={t('dashboard.birthStar')}
            value={snapshot.nakshatra && snapshot.nakshatraLord ? `${snapshot.nakshatra} — ${snapshot.nakshatraLord}` : '—'}
          />
          <StatCard icon={<Sun className="h-4 w-4 text-amber-400" />} label={t('kundli.ascendantLabel')} value={snapshot.ascendant || '—'} />
          <StatCard icon={<Shield className="h-4 w-4 text-rose-400" />} label={t('dashboard.lagnaLord')} value={snapshot.lagnaLord || '—'} />
          <StatCard
            icon={<CalendarDays className="h-4 w-4 text-sky-400" />}
            label={t('dashboard.lunarDay')}
            value={tithi?.name ? `${tithi.name} (${tithi.paksha || '—'})` : '—'}
          />
          <StatCard icon={<Compass className="h-4 w-4 text-cyan-400" />} label={t('dashboard.yoga')} value={yoga?.name || '—'} />
          <StatCard
            icon={<Layers className="h-4 w-4 text-indigo-400" />}
            label={t('moon.title')}
            value={moonPhase ? `${moonPhase.phaseName} ${moonPhase.illumination}%` : '—'}
          />
        </div>
      </motion.div>

      {/* Section 2: Today's Horoscope & Cosmic Energy */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SectionHeader icon={Sparkles} title={t('dashboard.todaysHoroscope')} />
          <HoroscopeCard
            prediction={horoscope.prediction}
            dailyAdvice={horoscope.dailyAdvice}
            love={horoscope.love}
            career={horoscope.career}
            health={horoscope.health}
            finance={horoscope.finance}
          />
        </div>
        <div>
          <SectionHeader icon={Zap} title={t('dashboard.cosmicEnergy')} />
          <PremiumCard glass className="flex h-full flex-col items-center justify-center text-center">
            <div className={`mb-1 text-5xl font-bold ${
              cosmicEnergy.level === 'Excellent' ? 'text-emerald-400' :
              cosmicEnergy.level === 'High' ? 'text-blue-400' :
              cosmicEnergy.level === 'Moderate' ? 'text-amber-400' : 'text-red-400'
            }`}>{cosmicEnergy.score ?? '—'}</div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cosmicEnergy.level || '—'}</div>
            <div className="mb-2 h-1.5 w-full rounded-full bg-muted">
              <div className={`h-1.5 rounded-full transition-all duration-1000 ${
                cosmicEnergy.level === 'Excellent' ? 'w-11/12 bg-emerald-400' :
                cosmicEnergy.level === 'High' ? 'w-3/4 bg-blue-400' :
                cosmicEnergy.level === 'Moderate' ? 'w-1/2 bg-amber-400' : 'w-1/4 bg-red-400'
              }`} />
            </div>
            <p className="text-[10px] text-muted-foreground">{cosmicEnergy.description || '—'}</p>
          </PremiumCard>
        </div>
      </motion.div>

      {/* Section 3: Planetary Snapshot */}
      {planets && planets.length > 0 && (
        <motion.div variants={stagger} initial="initial" animate="animate">
          <SectionHeader icon={Orbit} title={t('dashboard.planetaryPositions')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {planets.slice(0, 9).map((p, i) => (
              <motion.div key={p.name} variants={itemAnim}>
                <PlanetCard
                  name={p.name || '—'}
                  sign={p.sign || '—'}
                  signFull={p.signFull}
                  house={p.house}
                  degrees={p.degrees}
                  minutes={p.minutes}
                  interpretation={p.interpretation}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Section 4: Transit Alerts */}
      {transitAlerts && transitAlerts.length > 0 && (
        <motion.div variants={stagger} initial="initial" animate="animate">
          <SectionHeader icon={CalendarDays} title={t('dashboard.transitAlerts')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {transitAlerts.slice(0, 4).map((alert, i) => (
              <motion.div key={i} variants={itemAnim}>
                <PremiumCard glass>
                  <p className="text-[10px] font-mono text-muted-foreground">{safeFormatDate(alert.date)}</p>
                  <p className={`mt-0.5 text-xs font-semibold ${
                    alert.impact === 'positive' ? 'text-emerald-400' :
                    alert.impact === 'challenging' ? 'text-red-400' : 'text-amber-400'
                  }`}>{alert.event || '—'}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-2">{alert.description || '—'}</p>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Section 5: Current Dasha */}
      {dasha && (
        <motion.div variants={stagger} initial="initial" animate="animate">
          <SectionHeader icon={CalendarDays} title={t('dashboard.currentDashaPeriod')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PremiumCard glass>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t('dashboard.mahadasha')}</p>
                  <p className="text-base font-bold text-foreground">{dasha.mahadasha || '—'}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {safeFormatDate(dasha.mahadashaStart)} — {safeFormatDate(dasha.mahadashaEnd)}
                    {dasha.remainingDuration ? <span className="ml-1">({dasha.remainingDuration} {t('dashboard.remaining')})</span> : ''}
                  </p>
                </div>
              </div>
              {dasha.meaning && (
                <p className="mt-2 border-t border-border pt-2 text-[10px] italic text-muted-foreground">{dasha.meaning}</p>
              )}
            </PremiumCard>
            <PremiumCard glass>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                  <Clock className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t('dashboard.antardasha')}</p>
                  <p className="text-base font-bold text-foreground">{dasha.antardasha || '—'}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {safeFormatDate(dasha.antardashaStart)} — {safeFormatDate(dasha.antardashaEnd)}
                  </p>
                </div>
              </div>
            </PremiumCard>
          </div>
        </motion.div>
      )}

      {/* Section 6: Cosmic Insights */}
      <motion.div variants={stagger} initial="initial" animate="animate">
        <SectionHeader icon={Gem} title={t('dashboard.cosmicInsights')} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InsightCard icon={Hash} label={t('dashboard.luckyNumber')} value={horoscope.luckyNumber != null ? `${horoscope.luckyNumber}` : '—'} color="text-amber-400" />
          <InsightCard icon={Palette} label={t('dashboard.luckyColor')} value={horoscope.luckyColor || '—'} color="text-pink-400" />
          <InsightCard icon={Compass} label={t('dashboard.luckyDirection')} value={horoscope.luckyDirection || '—'} color="text-blue-400" />
          <InsightCard icon={CalendarDays} label={t('dashboard.luckyDay')} value={horoscope.luckyDay || '—'} color="text-purple-400" />
          <InsightCard icon={Wind} label={t('kundli.elementLabel')} value={snapshot.element || '—'} color="text-emerald-400" />
          <InsightCard icon={Heart} label={t('kundli.dosha')} value={snapshot.doshaDominance || '—'} color="text-red-400" />
          <InsightCard icon={Sunrise} label={t('dashboard.favorableActivity')} value={horoscope.favorableActivity || '—'} color="text-yellow-400" />
          <InsightCard icon={ArrowDown} label={t('dashboard.avoidToday')} value={horoscope.avoidToday || '—'} color="text-orange-400" />
        </div>
      </motion.div>

      {/* Section 7: Quick Actions */}
      <motion.div variants={stagger} initial="initial" animate="animate">
        <SectionHeader icon={Zap} title={t('dashboard.quickActions')} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <ActionCard to="/dashboard/kundli" icon={Star} label={t('dashboard.actionBirthChart')} desc={t('dashboard.actionBirthChartDesc')} color="text-purple-400" />
          <ActionCard to="/dashboard/compatibility" icon={Heart} label={t('dashboard.actionCompatibility')} desc={t('dashboard.actionCompatibilityDesc')} color="text-pink-400" />
          <ActionCard to="/dashboard/chat" icon={MessageCircle} label={t('dashboard.actionAiAstrologer')} desc={t('dashboard.actionAiAstrologerDesc')} color="text-amber-400" />
          <ActionCard to="/dashboard/horoscope" icon={Moon} label={t('dashboard.actionHoroscope')} desc={t('dashboard.actionHoroscopeDesc')} color="text-blue-400" />
          <ActionCard to="/dashboard/moon" icon={Moon} label={t('dashboard.actionMoonPhase')} desc={t('dashboard.actionMoonPhaseDesc')} color="text-sky-400" />
          <ActionCard to="/dashboard/settings" icon={User} label={t('dashboard.actionSettings')} desc={t('dashboard.actionSettingsDesc')} color="text-primary" />
        </div>
      </motion.div>

      {/* Section 8: Recent Reports + Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <motion.div variants={stagger} initial="initial" animate="animate">
            <SectionHeader icon={Clock} title={t('dashboard.recentReports')} />
            <PremiumCard glass>
              {reportsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Shimmer key={i} className="h-10 w-full" />)}
                </div>
              ) : reports.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-xs text-muted-foreground">{t('dashboard.noReports')}</p>
                  <Link to="/dashboard/kundli">
                    <PremiumButton size="sm" className="mt-3" icon={<Star className="h-3 w-3" />}>{t('dashboard.createBirthChart')}</PremiumButton>
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  {reports.slice(0, 5).map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-muted">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                          <FileIcon type={r.type} />
                        </div>
                        <div>
                          <p className="text-xs font-medium capitalize text-foreground">{r.type.replace(/_/g, ' ')}</p>
                          <p className="text-[11px] text-muted-foreground">{safeFormatDate(r.createdAt)}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </PremiumCard>
          </motion.div>
        </div>

        <div>
          <motion.div variants={stagger} initial="initial" animate="animate">
            <SectionHeader icon={Flame} title={t('dashboard.streak')} />
            <PremiumCard glass className="text-center">
              <div className="mb-1 text-5xl font-bold text-primary">{streak.currentStreak}</div>
              <p className="mb-2 text-xs text-muted-foreground">
                {streak.currentStreak === 0 ? t('dashboard.streakStart') :
                  t('dashboard.streakMessage', { n: streak.currentStreak })}
              </p>
              <div className="h-1 w-full rounded-full bg-muted">
                <div className="h-1 rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.min(100, (streak.currentStreak / 30) * 100)}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">{t('dashboard.streakBest', { n: streak.longestStreak })}</p>
            </PremiumCard>
          </motion.div>
        </div>
      </div>

      {/* Upgrade prompt */}
      {sub?.data?.plan === 'FREE' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <PremiumCard glow glass className="!border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02]" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10"
                >
                  <Crown className="h-5 w-5 text-primary" />
                </motion.div>
                <div>
                  <h3 className="text-base font-semibold text-primary">{t('dashboard.upsellTitle')}</h3>
                  <p className="text-xs text-muted-foreground">{t('dashboard.upsellDesc')}</p>
                </div>
              </div>
              <Link to="/pricing">
                <PremiumButton icon={<ArrowRight className="h-3 w-3" />}>{t('dashboard.upgradeNow')}</PremiumButton>
              </Link>
            </div>
          </PremiumCard>
        </motion.div>
      )}
    </motion.div>
  );
}
