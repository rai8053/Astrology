import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Moon, Sun, Heart, MessageCircle, ArrowRight, Sparkles, Star, Zap,
  Flame, Clock, User, Shield, Crown, CalendarDays,
  Gem, Palette, Hash, Globe, ChevronRight, AlertCircle, Orbit
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/PremiumButton';
import { useAuthStore } from '@/lib/store';
import { useT } from '@/lib/i18n/useT';
import { usePersonalDashboard } from './components/usePersonalDashboard';
import { useStreak } from '@/lib/useStreak';
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
  if (h < 12) return { key: 'Good Morning' as const, icon: Sun };
  if (h < 17) return { key: 'Good Afternoon' as const, icon: Sun };
  return { key: 'Good Evening' as const, icon: Moon };
}

function ScoreRing({ value, label, color }: { value: number | null | undefined; label: string; color: string }) {
  const safeVal = typeof value === 'number' && !isNaN(value) ? value : 0;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (safeVal / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="64" height="64" viewBox="0 0 64 64" className="transform -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className={color} style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <span className="text-lg font-bold font-sans text-text-primary dark:text-dark-text-primary -mt-10">{value != null ? safeVal : '—'}</span>
      <span className="text-[9px] font-sans uppercase tracking-wider text-text-secondary dark:text-dark-text-secondary">{label}</span>
    </div>
  );
}

function Shimmer({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Shimmer className="h-10 w-64" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <Shimmer key={i} className="h-28" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Shimmer className="h-64" />
        <Shimmer className="h-64" />
      </div>
    </div>
  );
}

export function DashboardHome() {
  const { t } = useT();
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

  const reports = reportsData?.data || [];
  const d = dash;

  if (dashLoading) return <DashboardSkeleton />;

  if (dashError && dashError.includes('Birth details')) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
            <greeting.icon className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-tight text-text-primary dark:text-dark-text-primary">
              {greeting.key}
            </h1>
            <p className="text-text-secondary dark:text-dark-text-secondary mt-1">Welcome to your cosmic dashboard</p>
          </div>
        </div>
        <PremiumCard glass className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-xl font-sans font-bold mb-2">Set Up Your Birth Chart</h2>
          <p className="text-text-secondary dark:text-dark-text-secondary max-w-md mx-auto mb-6 text-sm">
            Enter your birth details to unlock personalized horoscopes, planetary positions,
            Dasha periods, and cosmic insights tailored to your unique chart.
          </p>
          <Link to="/dashboard/settings">
            <PremiumButton icon={<User className="w-4 h-4" />}>Add Birth Details</PremiumButton>
          </Link>
        </PremiumCard>
      </motion.div>
    );
  }

  if (dashError) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
            <greeting.icon className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-sans font-bold">{greeting.key}</h1>
          </div>
        </div>
        <PremiumCard glass className="!border-red-500/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{dashError}</p>
          </div>
        </PremiumCard>
      </motion.div>
    );
  }

  if (!d) return <DashboardSkeleton />;

  const { snapshot, horoscope, cosmicEnergy, planets, dasha, tithi } = d;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <motion.div
          animate={{ rotate: [0, 5, 0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0"
        >
          <greeting.icon className="w-6 h-6 text-accent" />
        </motion.div>
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-sans font-bold tracking-tight text-text-primary dark:text-dark-text-primary">
            {greeting.key}
          </h1>
          <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5 flex items-center gap-2 flex-wrap">
            <span>{snapshot.moonRashi || '—'} &middot; {snapshot.nakshatra || '—'}</span>
            {sub?.data?.plan && sub.data.plan !== 'FREE' && (
              <>
                <span className="w-1 h-1 rounded-full bg-accent/40" />
                <span className="text-accent text-[10px] font-semibold uppercase tracking-wider">{sub.data.plan}</span>
              </>
            )}
          </p>
        </div>
      </motion.div>

      {/* Section 1: Astrology Profile */}
      <motion.div variants={stagger} initial="initial" animate="animate">
        <SectionHeader icon={User} title="Your Astrology Profile" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <ProfileCard label="Moon Sign (Rashi)" value={snapshot.moonRashi || '—'} icon={Moon} color="text-blue-400" />
          <ProfileCard label="Birth Star (Nakshatra)" value={snapshot.nakshatra && snapshot.nakshatraLord ? `${snapshot.nakshatra} — ${snapshot.nakshatraLord}` : '—'} icon={Star} color="text-purple-400" />
          <ProfileCard label="Ascendant (Lagna)" value={snapshot.ascendant || '—'} icon={Sun} color="text-amber-400" />
          <ProfileCard label="Lunar Day (Tithi)" value={tithi ? `${tithi.name} (${tithi.paksha})` : '—'} icon={Moon} color="text-sky-400" />
        </div>
      </motion.div>

      {/* Section 2: Today's Horoscope & Cosmic Energy */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SectionHeader icon={Sparkles} title="Today's Horoscope" />
          <PremiumCard glass>
            <p className="text-sm text-text-primary dark:text-dark-text-primary leading-relaxed mb-4">
              {horoscope.prediction || 'The stars are aligning in your favor today.'}
            </p>
            <div className="grid grid-cols-4 gap-2">
              <ScoreRing value={horoscope.love} label="Love" color="text-pink-400" />
              <ScoreRing value={horoscope.career} label="Career" color="text-blue-400" />
              <ScoreRing value={horoscope.health} label="Health" color="text-emerald-400" />
              <ScoreRing value={horoscope.finance} label="Wealth" color="text-amber-400" />
            </div>
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-xs text-text-secondary dark:text-dark-text-secondary italic">"{horoscope.dailyAdvice || 'Stay mindful of the cosmic energies today.'}"</p>
            </div>
          </PremiumCard>
        </div>
        <div>
          <SectionHeader icon={Zap} title="Cosmic Energy" />
          <PremiumCard glass className="text-center h-full flex flex-col items-center justify-center">
            <div className={`text-5xl font-bold font-sans mb-1 ${
              cosmicEnergy.level === 'Excellent' ? 'text-emerald-400' :
              cosmicEnergy.level === 'High' ? 'text-blue-400' :
              cosmicEnergy.level === 'Moderate' ? 'text-amber-400' : 'text-red-400'
            }`}>{cosmicEnergy.score ?? '—'}</div>
            <div className="text-xs uppercase tracking-wider font-semibold text-text-secondary dark:text-dark-text-secondary mb-2">{cosmicEnergy.level || '—'}</div>
            <div className="w-full bg-white/5 rounded-full h-1.5 mb-2">
              <div className={`h-1.5 rounded-full transition-all duration-1000 ${
                (cosmicEnergy.level || '') === 'Excellent' ? 'bg-emerald-400 w-11/12' :
                (cosmicEnergy.level || '') === 'High' ? 'bg-blue-400 w-3/4' :
                (cosmicEnergy.level || '') === 'Moderate' ? 'bg-amber-400 w-1/2' : 'bg-red-400 w-1/4'
              }`} />
            </div>
            <p className="text-[10px] text-text-secondary dark:text-dark-text-secondary">{cosmicEnergy.description || '—'}</p>
          </PremiumCard>
        </div>
      </motion.div>

      {/* Section 3: Planetary Snapshot */}
      {planets && planets.length > 0 && (
        <motion.div variants={stagger} initial="initial" animate="animate">
          <SectionHeader icon={Orbit} title="Planetary Positions" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {planets.slice(0, 7).map((p, i) => (
              <motion.div key={p.name} variants={itemAnim}>
                <PremiumCard glass>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold font-sans text-text-primary">{p.name || '—'}</span>
                    <span className={`text-[10px] font-mono font-bold ${
                      ['Mars','Sun'].some(s => p.name?.includes(s)) ? 'text-red-400' :
                      ['Venus'].some(s => p.name?.includes(s)) ? 'text-pink-400' :
                      ['Jupiter'].some(s => p.name?.includes(s)) ? 'text-amber-400' :
                      ['Saturn'].some(s => p.name?.includes(s)) ? 'text-indigo-400' :
                      ['Moon'].some(s => p.name?.includes(s)) ? 'text-blue-400' :
                      ['Mercury'].some(s => p.name?.includes(s)) ? 'text-emerald-400' : 'text-text-secondary dark:text-dark-text-secondary'
                    }`}>{p.sign || '—'}</span>
                  </div>
                  <p className="text-[10px] text-text-secondary dark:text-dark-text-secondary">
                    {p.signFull?.split('(')[1]?.replace(')','') || p.signFull || '—'}
                    &nbsp;&middot;&nbsp;House {p.house ?? '—'}
                    &nbsp;&middot;&nbsp;{p.degrees ?? '—'}°{p.minutes ?? '—'}'
                  </p>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Section 4: Current Dasha */}
      {dasha && (
        <motion.div variants={stagger} initial="initial" animate="animate">
          <SectionHeader icon={CalendarDays} title="Current Dasha Period" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PremiumCard glass>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-secondary dark:text-dark-text-secondary">Mahadasha</p>
                  <p className="text-base font-bold font-sans text-text-primary">{dasha.mahadasha || '—'}</p>
                  <p className="text-[10px] text-text-secondary dark:text-dark-text-secondary">
                    {dasha.mahadashaStart ? new Date(dasha.mahadashaStart).toLocaleDateString() : '—'} — {dasha.mahadashaEnd ? new Date(dasha.mahadashaEnd).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
            </PremiumCard>
            <PremiumCard glass>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-secondary dark:text-dark-text-secondary">Antardasha</p>
                  <p className="text-base font-bold font-sans text-text-primary">{dasha.antardasha || '—'}</p>
                  <p className="text-[10px] text-text-secondary dark:text-dark-text-secondary">
                    {dasha.antardashaStart ? new Date(dasha.antardashaStart).toLocaleDateString() : '—'} — {dasha.antardashaEnd ? new Date(dasha.antardashaEnd).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
            </PremiumCard>
          </div>
        </motion.div>
      )}

      {/* Section 5: Cosmic Insights */}
      <motion.div variants={stagger} initial="initial" animate="animate">
        <SectionHeader icon={Gem} title="Cosmic Insights" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <InsightCard icon={Hash} label="Lucky Number" value={horoscope.luckyNumber != null ? `${horoscope.luckyNumber}` : '—'} color="text-amber-400" />
          <InsightCard icon={Palette} label="Lucky Color" value={horoscope.luckyColor || '—'} color="text-pink-400" />
          <InsightCard icon={Globe} label="Element" value={snapshot.element || '—'} color="text-blue-400" />
          <InsightCard icon={Heart} label="Dosha" value={snapshot.doshaDominance || '—'} color="text-emerald-400" />
        </div>
      </motion.div>

      {/* Section 6: Quick Actions */}
      <motion.div variants={stagger} initial="initial" animate="animate">
        <SectionHeader icon={Zap} title="Quick Actions" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          <ActionCard to="/dashboard/kundli" icon={Star} label="Birth Chart" desc="Full Kundli analysis" color="text-purple-400" />
          <ActionCard to="/dashboard/compatibility" icon={Heart} label="Compatibility" desc="Gun Milan matching" color="text-pink-400" />
          <ActionCard to="/dashboard/chat" icon={MessageCircle} label="AI Astrologer" desc="Ask any question" color="text-amber-400" />
          <ActionCard to="/dashboard/horoscope" icon={Moon} label="Horoscope" desc="Daily predictions" color="text-blue-400" />
          <ActionCard to="/dashboard/moon" icon={Moon} label="Moon Phase" desc="Lunar tracker" color="text-sky-400" />
          <ActionCard to="/dashboard/settings" icon={User} label="Settings" desc="Update profile" color="text-accent" />
        </div>
      </motion.div>

      {/* Section 7: Recent Reports + Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <motion.div variants={stagger} initial="initial" animate="animate">
            <SectionHeader icon={Clock} title="Recent Reports" />
            <PremiumCard glass>
              {reportsLoading ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <Shimmer key={i} className="h-10 w-full" />)}
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary">No reports yet. Generate your first birth chart!</p>
                  <Link to="/dashboard/kundli">
                    <PremiumButton size="sm" className="mt-3" icon={<Star className="w-3 h-3" />}>
                      Create Birth Chart
                    </PremiumButton>
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  {reports.slice(0, 5).map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center">
                          <FileIcon type={r.type} />
                        </div>
                        <div>
                          <p className="text-xs font-medium font-sans capitalize text-text-primary">{r.type.replace(/_/g, ' ')}</p>
                          <p className="text-[9px] text-text-secondary dark:text-dark-text-secondary">{new Date(r.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3 h-3 text-text-tertiary dark:text-dark-text-tertiary" />
                    </div>
                  ))}
                </div>
              )}
            </PremiumCard>
          </motion.div>
        </div>

        <div>
          <motion.div variants={stagger} initial="initial" animate="animate">
            <SectionHeader icon={Flame} title="Streak" />
            <PremiumCard glass className="text-center">
              <div className="text-5xl font-bold font-sans text-accent mb-1">{streak.currentStreak}</div>
              <p className="text-xs text-text-secondary dark:text-dark-text-secondary mb-2">
                {streak.currentStreak === 0 ? 'Start your cosmic journey today' :
                  `${streak.currentStreak} day${streak.currentStreak > 1 ? 's' : ''} of connection`}
              </p>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="h-1 rounded-full bg-accent transition-all duration-500" style={{ width: `${Math.min(100, (streak.currentStreak / 30) * 100)}%` }} />
              </div>
              <p className="text-[9px] text-text-tertiary dark:text-dark-text-tertiary mt-1.5">Best: {streak.longestStreak} days</p>
            </PremiumCard>
          </motion.div>
        </div>
      </div>

      {/* Upgrade prompt */}
      {sub?.data?.plan === 'FREE' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <PremiumCard glow glass className="!border-accent/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/[0.02] via-transparent to-accent/[0.02]" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2.5, repeat: Infinity }} className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Crown className="w-5 h-5 text-accent" />
                </motion.div>
                <div>
                  <h3 className="font-sans text-base font-semibold text-accent">Unlock Premium Insights</h3>
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Get unlimited AI consultations, detailed Dasha analysis, and advanced chart comparisons.</p>
                </div>
              </div>
              <Link to="/pricing">
                <PremiumButton icon={<ArrowRight className="w-3 h-3" />}>Upgrade Now</PremiumButton>
              </Link>
            </div>
          </PremiumCard>
        </motion.div>
      )}
    </motion.div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
        <Icon className="w-3 h-3 text-accent" />
      </div>
      <h2 className="text-sm font-sans font-semibold tracking-tight text-text-primary dark:text-dark-text-primary">{title}</h2>
    </div>
  );
}

function ProfileCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <motion.div variants={itemAnim}>
      <PremiumCard glass>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color}/10 to-transparent flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-widest text-text-secondary dark:text-dark-text-secondary">{label}</p>
            <p className="text-xs font-semibold font-sans text-text-primary truncate">{value}</p>
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  );
}

function InsightCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <motion.div variants={itemAnim}>
      <PremiumCard glass>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color}/10 to-transparent flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-text-secondary dark:text-dark-text-secondary">{label}</p>
            <p className="text-sm font-bold font-sans text-text-primary">{value}</p>
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
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color}/10 to-transparent flex items-center justify-center ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold font-sans group-hover:text-accent transition-colors text-text-primary">{label}</p>
              <p className="text-[10px] text-text-secondary dark:text-dark-text-secondary">{desc}</p>
            </div>
          </div>
        </PremiumCard>
      </Link>
    </motion.div>
  );
}

function FileIcon({ type }: { type: string }) {
  switch (type) {
    case 'vedic_profile': return <Star className="w-3 h-3 text-accent" />;
    case 'daily_horoscope': return <Sun className="w-3 h-3 text-amber-400" />;
    case 'compatibility': return <Heart className="w-3 h-3 text-pink-400" />;
    case 'moon_phase': return <Moon className="w-3 h-3 text-blue-400" />;
    default: return <Sparkles className="w-3 h-3 text-text-secondary dark:text-dark-text-secondary" />;
  }
}
