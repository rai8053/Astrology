import { useState, FormEvent, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Shield, Heart, RefreshCw, Download, AlertCircle, Star, Sun, Moon, Gem, Brain, Briefcase, HeartHandshake, Wallet, Leaf, Compass, CalendarDays, ArrowRight, CheckCircle2, User, MapPin, Clock, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { generatePremiumReport } from '@/lib/kundliReport';
import { PremiumButton } from '@/components/PremiumButton';
import { Input } from '@/components/ui/Input';
import { BirthPlaceInput } from '@/components/ui/BirthPlaceInput';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { useT } from '@/lib/i18n/useT';
import type { BirthDetails, VedicProfile, AstroInsight, Remedy, TransitEvent } from '@shared/types/api';

const PLANET_SYMBOLS: Record<string, { symbol: string; color: string }> = {
  'Lagna (Ascendant)': { symbol: 'As', color: '#d4af37' },
  'Moon (Chandra)': { symbol: 'Mo', color: '#a78bfa' },
  'Sun (Surya)': { symbol: 'Su', color: '#ef4444' },
  'Mercury (Budha)': { symbol: 'Me', color: '#10b981' },
  'Venus (Shukra)': { symbol: 'Ve', color: '#ec4899' },
  'Jupiter (Guru)': { symbol: 'Ju', color: '#f97316' },
  'Saturn (Shani)': { symbol: 'Sa', color: '#3b82f6' },
  'Mars (Mangal)': { symbol: 'Ma', color: '#dc2626' },
};

const INSIGHT_ICONS: Record<string, typeof Sparkles> = {
  Personality: Brain,
  Career: Briefcase,
  Relationships: HeartHandshake,
  Finance: Wallet,
  Health: Leaf,
  'Spiritual Path': Compass,
};

const REMEDY_ICONS: Record<string, typeof Sparkles> = {
  gemstone: Gem,
  mantra: Sun,
  color: Star,
  day: CalendarDays,
  remedy: Sparkles,
  donation: Heart,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

function NorthIndianChart({ placements, lagna, rashi }: { placements: VedicProfile['planetaryPlacements']; lagna: string; rashi: string }) {
  const SIZE = 280;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 110;

  type HouseSlot = { a: number; label: string; placements: typeof placements };
  const houses: HouseSlot[] = [
    { a: 0, label: '1', placements: [] },
    { a: 30, label: '2', placements: [] },
    { a: 60, label: '3', placements: [] },
    { a: 90, label: '4', placements: [] },
    { a: 120, label: '5', placements: [] },
    { a: 150, label: '6', placements: [] },
    { a: 180, label: '7', placements: [] },
    { a: 210, label: '8', placements: [] },
    { a: 240, label: '9', placements: [] },
    { a: 270, label: '10', placements: [] },
    { a: 300, label: '11', placements: [] },
    { a: 330, label: '12', placements: [] },
  ];

  placements.forEach((p) => {
    const idx = Math.max(0, Math.min(11, p.house - 1));
    houses[idx]!.placements.push(p);
  });

  return (
    <div className="flex justify-center">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="drop-shadow-lg">
        <defs>
          <radialGradient id="chart-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(212,175,55,0.06)" />
            <stop offset="100%" stopColor="rgba(212,175,55,0)" />
          </radialGradient>
        </defs>
        <circle cx={CX} cy={CY} r={R + 20} fill="url(#chart-glow)" />

        {houses.map((h, i) => {
          const angle = ((h.a - 90) * Math.PI) / 180;
          const outerX = CX + (R + 10) * Math.cos(angle);
          const outerY = CY + (R + 10) * Math.sin(angle);
          const innerX = CX + 35 * Math.cos(angle);
          const innerY = CY + 35 * Math.sin(angle);
          const nextAngle = ((h.a + 30 - 90) * Math.PI) / 180;
          const midAngle = ((h.a + 15 - 90) * Math.PI) / 180;
          const labelX = CX + (R + 32) * Math.cos(midAngle);
          const labelY = CY + (R + 32) * Math.sin(midAngle);

          const midR = R / 2 + 17;
          const planetX = CX + midR * Math.cos(midAngle);
          const planetY = CY + midR * Math.sin(midAngle);

          const isFirst = i === 0;

          return (
            <g key={i}>
              <line
                x1={innerX} y1={innerY}
                x2={outerX} y2={outerY}
                stroke="rgba(212,175,55,0.2)" strokeWidth={1}
              />
              {isFirst && (
                <line
                  x1={CX + 35 * Math.cos(angle)} y1={CY + 35 * Math.sin(angle)}
                  x2={CX + 35 * Math.cos(nextAngle)} y2={CY + 35 * Math.sin(nextAngle)}
                  stroke="rgba(212,175,55,0.2)" strokeWidth={1}
                />
              )}
              <circle cx={CX} cy={CY} r={35} fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth={1} />
              <text x={CX} y={CY + 1.5} textAnchor="middle" fontSize="8" fill="rgba(212,175,55,0.5)" fontFamily="sans-serif">As</text>
              <text x={labelX} y={labelY} textAnchor="middle" fontSize="7" fill="#6b6560" fontFamily="sans-serif" fontWeight="bold">{h.label}</text>
            </g>
          );
        })}

        {houses.map((h) => {
          if (!h.placements.length) return null;
          const midAngle = ((h.a + 15 - 90) * Math.PI) / 180;
          const midR = R / 2 + 17;
          const count = h.placements.length;
          return h.placements.map((p, pi) => {
            const offset = count > 1 ? (pi - (count - 1) / 2) * 16 : 0;
            const perpAngle = midAngle + Math.PI / 2;
            const px = CX + midR * Math.cos(midAngle) + offset * Math.cos(perpAngle);
            const py = CY + midR * Math.sin(midAngle) + offset * Math.sin(perpAngle);
            const symbol = PLANET_SYMBOLS[p.planet];
            if (!symbol) return null;
            return (
              <g key={`${p.planet}-${pi}`}>
                <circle cx={px} cy={py} r={8} fill={symbol.color} opacity={0.15} />
                <text x={px} y={py + 1.5} textAnchor="middle" fontSize="5" fill={symbol.color} fontFamily="sans-serif" fontWeight="bold">{symbol.symbol}</text>
              </g>
            );
          });
        })}
      </svg>
    </div>
  );
}

function InsightCard({ insight }: { insight: AstroInsight }) {
  const Icon = INSIGHT_ICONS[insight.title] || Sparkles;
  return (
    <motion.div variants={itemVariants} className="group relative">
      <PremiumCard glass className="h-full p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-accent" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold font-sans text-text-primary dark:text-dark-text-primary">{insight.score}</span>
            <span className="text-[9px] text-text-tertiary">/100</span>
          </div>
        </div>
        <h4 className="font-sans font-semibold text-sm mb-1.5 text-text-primary dark:text-dark-text-primary">{insight.title}</h4>
        <p className="text-xs text-text-secondary leading-relaxed">{insight.content}</p>
      </PremiumCard>
    </motion.div>
  );
}

function RemedyCard({ remedy }: { remedy: Remedy }) {
  const Icon = REMEDY_ICONS[remedy.type] || Sparkles;
  return (
    <motion.div variants={itemVariants}>
      <PremiumCard glass className="p-5 h-full group">
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
            <Icon className="w-4 h-4 text-accent" />
          </div>
          <div className="min-w-0">
            <h4 className="font-sans font-semibold text-sm mb-1 text-text-primary dark:text-dark-text-primary">{remedy.title}</h4>
            <p className="text-xs text-text-secondary leading-relaxed">{remedy.description}</p>
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  );
}

function TransitCard({ event }: { event: TransitEvent }) {
  const dotColor = event.impact === 'positive' ? 'bg-emerald-500' : event.impact === 'challenging' ? 'bg-red-400' : 'bg-amber-400';
  return (
    <motion.div variants={itemVariants}>
      <PremiumCard glass className="p-5 flex gap-4 items-start group">
        <div className="flex flex-col items-center gap-1">
          <div className={`w-2.5 h-2.5 rounded-full ${dotColor} shadow-sm`} />
          <div className="w-px h-full bg-border-primary dark:bg-dark-border-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-sans font-semibold text-sm text-text-primary dark:text-dark-text-primary">{event.title}</h4>
            <span className="text-[10px] font-sans font-medium text-text-tertiary whitespace-nowrap">{event.date}</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">{event.description}</p>
          <span className={`inline-block mt-1.5 text-[9px] font-sans font-bold uppercase px-1.5 py-0.5 rounded ${
            event.impact === 'positive' ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20' :
            event.impact === 'challenging' ? 'text-red-500 bg-red-50 dark:text-red-400 dark:bg-red-900/20' :
            'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20'
          }`}>{event.impact}</span>
        </div>
      </PremiumCard>
    </motion.div>
  );
}

export function KundliPage() {
  const { t } = useT();
  const [formData, setFormData] = useState<BirthDetails>({
    name: '', birthDate: '', birthTime: '', birthPlace: '',
  });
  const [birthState, setBirthState] = useState('');
  const [birthCountry, setBirthCountry] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof BirthDetails, string>>>({});
  const [activeSection, setActiveSection] = useState<string>('chart');
  const sectionRefs: Record<string, React.RefObject<HTMLDivElement | null>> = {
    chart: useRef<HTMLDivElement>(null),
    insights: useRef<HTMLDivElement>(null),
    remedies: useRef<HTMLDivElement>(null),
    transit: useRef<HTMLDivElement>(null),
  };

  const scrollToSection = useCallback((key: string) => {
    setActiveSection(key);
    sectionRefs[key]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const mutation = useMutation({
    mutationFn: (data: BirthDetails) => api.post<VedicProfile>('/api/astrology/vedic-profile', data),
    onSuccess: () => setErrors({}),
  });

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!formData.name.trim()) errs.name = t('kundli.nameRequired');
    if (!formData.birthDate) errs.birthDate = t('kundli.dateRequired');
    if (!formData.birthTime) errs.birthTime = t('kundli.timeRequired');
    if (!formData.birthPlace.trim()) errs.birthPlace = t('kundli.placeRequired');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate(formData);
  };

  const profile = mutation.data?.data;

  const handleDownloadPDF = () => {
    if (profile) generatePremiumReport(profile);
  };

  const sections = [
    { key: 'chart', label: t('kundli.chart'), icon: Star },
    { key: 'insights', label: t('kundli.insights'), icon: Brain },
    { key: 'remedies', label: t('kundli.remedies'), icon: Gem },
    { key: 'transit', label: t('kundli.transits'), icon: CalendarDays },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Star className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-tight text-text-primary dark:text-dark-text-primary">{t('kundli.title')}</h1>
            <p className="text-text-secondary mt-0.5 text-sm">{t('kundli.subtitle')}</p>
          </div>
        </div>
        {profile && (
          <PremiumButton onClick={handleDownloadPDF} icon={<Download className="w-3.5 h-3.5" />} size="sm">
            {t('kundli.downloadPdf')}
          </PremiumButton>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-4"
        >
          <PremiumCard glass className="sticky top-20">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <h3 className="font-sans text-lg font-semibold tracking-tight">{t('kundli.birthDetails')}</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input id="k_name" label={t('kundli.name')} value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: '' }); }} required placeholder={t('kundli.namePlaceholder')} error={errors.name} />
              <div className="grid grid-cols-2 gap-4">
                <Input id="k_date" label={t('kundli.date')} type="date" value={formData.birthDate} onChange={(e) => { setFormData({ ...formData, birthDate: e.target.value }); setErrors({ ...errors, birthDate: '' }); }} required error={errors.birthDate} />
                <Input id="k_time" label={t('kundli.time')} type="time" value={formData.birthTime} onChange={(e) => { setFormData({ ...formData, birthTime: e.target.value }); setErrors({ ...errors, birthTime: '' }); }} required error={errors.birthTime} />
              </div>
              <BirthPlaceInput id="k_place" label={t('kundli.place')} value={formData.birthPlace} onChange={(v) => { setFormData({ ...formData, birthPlace: v }); setErrors({ ...errors, birthPlace: '' }); }} required placeholder={t('kundli.placePlaceholder')} error={errors.birthPlace} state={birthState} onStateChange={setBirthState} country={birthCountry} onCountryChange={setBirthCountry} />
              <PremiumButton type="submit" loading={mutation.isPending} icon={<Sparkles className="w-3.5 h-3.5" />} className="w-full">
                {profile ? t('kundli.regenerate') : t('kundli.generate')}
              </PremiumButton>
              {mutation.isError && (
                <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {t('kundli.generateError')}</p>
              )}
            </form>

            {profile && (
              <div className="mt-4 pt-4 border-t border-border-primary dark:border-dark-border-primary">
                <nav className="flex flex-wrap gap-1.5">
                  {sections.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => scrollToSection(s.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all ${
                        activeSection === s.key
                          ? 'bg-accent/10 text-accent premium-shadow-sm'
                          : 'text-text-tertiary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      <s.icon className="w-3 h-3" />
                      {s.label}
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </PremiumCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 space-y-6"
        >
          {mutation.isPending ? (
            <PremiumCard glass className="flex items-center justify-center py-24">
              <div className="text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <RefreshCw className="w-10 h-10 text-accent mx-auto mb-4" />
                </motion.div>
                <p className="text-sm text-text-secondary">{t('kundli.loading')}</p>
              </div>
            </PremiumCard>
          ) : profile ? (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {/* Premium Summary Header - FIXED: Name now prominently visible */}
              <motion.div variants={itemVariants}>
                <PremiumCard glass glow className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] via-transparent to-accent/[0.02]" />
                  <div className="relative">
                    <div className="flex flex-wrap justify-between items-start gap-4 border-b border-border-primary dark:border-dark-border-primary pb-5 mb-5">
                      <div className="flex-1 min-w-0">
                        <span className="text-caption mb-2 block">{t('kundli.chart')}</span>
                        <h2 className="kundli-name mb-1">{profile.name}</h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                          <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <Calendar className="w-3 h-3 text-accent/60" /> {profile.birthDate}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <Clock className="w-3 h-3 text-accent/60" /> {profile.birthTime}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <MapPin className="w-3 h-3 text-accent/60" /> {profile.birthPlace}
                          </span>
                        </div>
                      </div>
                      <div className="text-center px-5 py-3 gold-border-premium rounded-2xl bg-accent/5 min-w-[110px] shrink-0">
                        <span className="text-caption block">{t('kundli.nakshatraLordLabel')}</span>
                        <span className="font-sans font-semibold text-accent text-sm">{profile.rashiLord}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: t('kundli.moonRashi'), value: profile.rashi, icon: Moon },
                        { label: t('kundli.ascendantLabel'), value: profile.lagna, icon: Sun },
                        { label: t('kundli.nakshatraLabel'), value: profile.nakshatra, icon: Star },
                        { label: t('kundli.nakshatraLordLabel'), value: profile.nakshatraLord, icon: Shield },
                      ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <motion.div
                            key={i}
                            whileHover={{ y: -2 }}
                            className="p-3.5 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl hover:bg-accent/5 transition-colors"
                          >
                            <Icon className="w-3.5 h-3.5 text-accent/60 mb-1.5" />
                            <span className="text-caption block mb-0.5">{item.label}</span>
                            <span className="font-sans font-semibold text-sm text-text-primary dark:text-dark-text-primary">{item.value}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>

              {/* Chart Visualization */}
              <motion.div variants={itemVariants} id="chart-section" ref={sectionRefs.chart}>
                <PremiumCard glass>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-sans font-semibold flex items-center gap-2 text-text-primary dark:text-dark-text-primary">
                      <Star className="w-4 h-4 text-accent" /> {t('kundli.chart')}
                    </h3>
                    <span className="text-caption">{t('kundli.northChart')}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NorthIndianChart placements={profile.planetaryPlacements} lagna={profile.lagna} rashi={profile.rashi} />
                    <div className="space-y-3">
                      <p className="text-sm text-text-secondary leading-relaxed">{profile.generalReading}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: t('kundli.elementLabel'), value: profile.element, color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' },
                          { label: t('kundli.dosha'), value: profile.doshaDominance, color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' },
                          { label: `${profile.luckyNumber}`, value: t('kundli.luckyNum'), color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' },
                        ].map((tag, i) => (
                          <span key={i} className={`px-2.5 py-1 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider ${tag.color}`}>
                            {tag.value} {tag.label}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-text-tertiary font-mono">
                        {t('kundli.infoText', { color: profile.luckyColor, gemstone: profile.gemstone })}
                      </p>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>

              {/* Planetary Placements */}
              <motion.div variants={itemVariants}>
                <PremiumCard glass>
                  <h3 className="font-sans font-semibold mb-4 flex items-center gap-2 text-text-primary dark:text-dark-text-primary">
                    <Moon className="w-4 h-4 text-accent" /> {t('kundli.planetaryPlacements')}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border-primary dark:border-dark-border-primary">
                          <th className="pb-3 text-caption">{t('kundli.planet')}</th>
                          <th className="pb-3 text-caption">{t('kundli.sign')}</th>
                          <th className="pb-3 text-caption">{t('kundli.house')}</th>
                          <th className="pb-3 text-caption">{t('kundli.description')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.03]">
                        {profile.planetaryPlacements.map((p, i) => (
                          <motion.tr
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-3 font-medium flex items-center gap-2 text-text-primary dark:text-dark-text-primary">
                              <span className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[7px] font-bold" style={{ backgroundColor: `${PLANET_SYMBOLS[p.planet]?.color || '#999'}15`, color: PLANET_SYMBOLS[p.planet]?.color || '#999' }}>
                                {PLANET_SYMBOLS[p.planet]?.symbol || '?'}
                              </span>
                              {p.planet}
                            </td>
                            <td className="py-3 text-text-secondary">{p.sign}</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 bg-accent/10 text-accent rounded text-[10px] font-mono font-bold">{p.house}</span>
                            </td>
                            <td className="py-3 text-sm text-text-secondary">{p.description}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </PremiumCard>
              </motion.div>

              {/* Strengths & Challenges */}
              <motion.div variants={itemVariants}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PremiumCard glass>
                    <h3 className="font-sans font-semibold mb-3 flex items-center gap-2 text-text-primary dark:text-dark-text-primary"><Shield className="w-4 h-4 text-accent" /> {t('kundli.strengths')}</h3>
                    <ul className="space-y-2.5">
                      {profile.strengths.map((s, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex gap-2.5 text-sm text-text-secondary"
                        >
                          <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </PremiumCard>
                  <PremiumCard glass>
                    <h3 className="font-sans font-semibold mb-3 flex items-center gap-2 text-text-primary dark:text-dark-text-primary"><Heart className="w-4 h-4 text-pink-400" /> {t('kundli.challenges')}</h3>
                    <ul className="space-y-2.5">
                      {profile.weaknesses.map((w, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex gap-2.5 text-sm text-text-secondary"
                        >
                          <ArrowRight className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </PremiumCard>
                </div>
              </motion.div>

              {/* Astrology Insights */}
              {profile.insights?.length > 0 && (
                <motion.div variants={itemVariants} ref={sectionRefs.insights}>
                  <PremiumCard glass>
                    <h3 className="font-sans font-semibold mb-5 flex items-center gap-2 text-text-primary dark:text-dark-text-primary">
                      <Brain className="w-4 h-4 text-accent" /> {t('kundli.insightsTitle')}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profile.insights.map((ins, i) => (
                        <InsightCard key={i} insight={ins} />
                      ))}
                    </div>
                  </PremiumCard>
                </motion.div>
              )}

              {/* Remedies */}
              {profile.remedies?.length > 0 && (
                <motion.div variants={itemVariants} ref={sectionRefs.remedies}>
                  <PremiumCard glass>
                    <h3 className="font-sans font-semibold mb-5 flex items-center gap-2 text-text-primary dark:text-dark-text-primary">
                      <Gem className="w-4 h-4 text-accent" /> {t('kundli.remediesTitle')}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profile.remedies.map((rem, i) => (
                        <RemedyCard key={i} remedy={rem} />
                      ))}
                    </div>
                  </PremiumCard>
                </motion.div>
              )}

              {/* Transit Timeline */}
              {profile.transitTimeline?.length > 0 && (
                <motion.div variants={itemVariants} ref={sectionRefs.transit}>
                  <PremiumCard glass>
                    <h3 className="font-sans font-semibold mb-5 flex items-center gap-2 text-text-primary dark:text-dark-text-primary">
                      <CalendarDays className="w-4 h-4 text-accent" /> {t('kundli.transitsTitle')}
                    </h3>
                    <div className="space-y-3">
                      {profile.transitTimeline.map((evt, i) => (
                        <TransitCard key={i} event={evt} />
                      ))}
                    </div>
                  </PremiumCard>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <PremiumCard glass className="flex items-center justify-center py-24">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Star className="w-8 h-8 text-accent/40" />
                </div>
                <p className="text-text-tertiary text-sm mb-1">{t('kundli.emptyTitle')}</p>
                <p className="text-xs text-text-tertiary/60">{t('kundli.emptyDesc')}</p>
              </div>
            </PremiumCard>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
