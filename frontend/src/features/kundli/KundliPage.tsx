import { useState, FormEvent, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Shield, Heart, RefreshCw, Download, AlertCircle, Star, Sun, Moon, Gem, Brain, Briefcase, HeartHandshake, Wallet, Leaf, Compass, CalendarDays, ArrowRight, CheckCircle2 } from 'lucide-react';
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
  'Lagna (Ascendant)': { symbol: 'As', color: '#f59e0b' },
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
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
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
            <stop offset="0%" stopColor="rgba(245,158,11,0.06)" />
            <stop offset="100%" stopColor="rgba(245,158,11,0)" />
          </radialGradient>
        </defs>
        <circle cx={CX} cy={CY} r={R + 20} fill="url(#chart-glow)" />

        {/* House wedges and labels */}
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

          const isLagnaHouse = i === 0;
          const isFirst = i === 0;

          return (
            <g key={i}>
              <line
                x1={CX + 35 * Math.cos(angle)}
                y1={CY + 35 * Math.sin(angle)}
                x2={CX + (R + 10) * Math.cos(angle)}
                y2={CY + (R + 10) * Math.sin(angle)}
                stroke="rgba(245,158,11,0.2)"
                strokeWidth={1}
                className="dark:opacity-30"
              />
              {isFirst && (
                <line
                  x1={CX + 35 * Math.cos(angle)}
                  y1={CY + 35 * Math.sin(angle)}
                  x2={CX + 35 * Math.cos(nextAngle)}
                  y2={CY + 35 * Math.sin(nextAngle)}
                  stroke="rgba(245,158,11,0.2)"
                  strokeWidth={1}
                />
              )}
              <circle cx={CX} cy={CY} r={35} fill="none" stroke="rgba(245,158,11,0.2)" strokeWidth={1} />
              <text x={CX} y={CY + 1.5} textAnchor="middle" fontSize="8" fill="rgba(245,158,11,0.5)" className="font-sans">As</text>
              <text x={labelX} y={labelY} textAnchor="middle" fontSize="7" fill="rgba(107,114,128,0.6)" className="font-sans font-bold">{h.label}</text>
            </g>
          );
        })}

        {/* Planet markers in houses */}
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
                <text x={px} y={py + 1.5} textAnchor="middle" fontSize="5" fill={symbol.color} className="font-sans font-bold">{symbol.symbol}</text>
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
      <PremiumCard glass className="h-full p-4 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${insight.color} bg-opacity-10 flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold font-serif">{insight.score}</span>
            <span className="text-[9px] text-ink/40 dark:text-parchment/40">/100</span>
          </div>
        </div>
        <h4 className="font-serif font-semibold text-sm mb-1.5">{insight.title}</h4>
        <p className="text-xs text-ink/60 dark:text-parchment/60 leading-relaxed">{insight.content}</p>
      </PremiumCard>
    </motion.div>
  );
}

function RemedyCard({ remedy }: { remedy: Remedy }) {
  const Icon = REMEDY_ICONS[remedy.type] || Sparkles;
  return (
    <motion.div variants={itemVariants}>
      <PremiumCard glass className="p-4 h-full group hover:shadow-md transition-all duration-300">
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
            <Icon className="w-4 h-4 text-gold" />
          </div>
          <div className="min-w-0">
            <h4 className="font-serif font-semibold text-sm mb-1">{remedy.title}</h4>
            <p className="text-xs text-ink/50 dark:text-parchment/50 leading-relaxed">{remedy.description}</p>
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
      <PremiumCard glass className="p-4 flex gap-4 items-start group hover:shadow-md transition-all duration-300">
        <div className="flex flex-col items-center gap-1">
          <div className={`w-2.5 h-2.5 rounded-full ${dotColor} shadow-sm`} />
          <div className="w-px h-full bg-ink/10 dark:bg-white/[0.06]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-serif font-semibold text-sm">{event.title}</h4>
            <span className="text-[10px] font-sans font-medium text-ink/40 dark:text-parchment/40 whitespace-nowrap">{event.date}</span>
          </div>
          <p className="text-xs text-ink/50 dark:text-parchment/50 leading-relaxed">{event.description}</p>
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
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-amber-400/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold bg-gradient-to-r from-gold to-amber-400 bg-clip-text text-transparent">{t('kundli.title')}</h1>
            <p className="text-ink/50 dark:text-parchment/50 mt-0.5 text-sm">{t('kundli.subtitle')}</p>
          </div>
        </div>
        {profile && (
          <PremiumButton onClick={handleDownloadPDF} icon={<Download className="w-3.5 h-3.5" />} size="sm">
            {t('kundli.downloadPdf')}
          </PremiumButton>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sidebar Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-4"
        >
          <PremiumCard glass className="sticky top-20">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-gold" />
              </div>
              <h3 className="font-serif text-lg font-semibold">{t('kundli.birthDetails')}</h3>
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
                <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {t('kundli.generateError')}</p>
              )}
            </form>

            {profile && (
              <div className="mt-4 pt-4 border-t border-ink/10 dark:border-white/[0.06]">
                <nav className="flex flex-wrap gap-1.5">
                  {sections.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => scrollToSection(s.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
                        activeSection === s.key
                          ? 'bg-gold/10 text-gold shadow-sm'
                          : 'text-ink/40 dark:text-parchment/40 hover:text-ink dark:hover:text-parchment hover:bg-ink/5 dark:hover:bg-white/[0.04]'
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

        {/* Main Content */}
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
                  <RefreshCw className="w-10 h-10 text-gold mx-auto mb-4" />
                </motion.div>
                <p className="text-sm text-ink/50 dark:text-parchment/50">{t('kundli.loading')}</p>
              </div>
            </PremiumCard>
          ) : profile ? (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {/* Summary Card */}
              <motion.div variants={itemVariants}>
                <PremiumCard glass glow>
                  <div className="flex flex-wrap justify-between items-start gap-4 border-b border-ink/10 dark:border-white/[0.06] pb-5 mb-5">
                    <div>
                      <span className="text-[9px] uppercase font-sans font-bold tracking-[0.2em] text-gold">{t('kundli.chart')}</span>
                      <h2 className="text-3xl font-serif font-bold mt-1 bg-gradient-to-r from-ink dark:to-parchment to-ink/80 bg-clip-text text-transparent">{profile.name}</h2>
                      <p className="text-xs text-ink/40 dark:text-parchment/40 mt-1 font-mono">{profile.birthDate} &bull; {profile.birthTime} &bull; {profile.birthPlace}</p>
                    </div>
                    <div className="text-center px-4 py-2.5 gold-border rounded-lg bg-gold/5 min-w-[100px]">
                      <span className="text-[8px] uppercase font-sans font-bold text-gold block tracking-wider">{t('kundli.nakshatraLordLabel')}</span>
                      <span className="font-serif font-semibold text-gold text-sm">{profile.rashiLord}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
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
                          className="p-3.5 bg-ink/5 dark:bg-white/[0.04] rounded-xl hover:bg-gold/5 dark:hover:bg-gold/5 transition-colors"
                        >
                          <Icon className="w-3.5 h-3.5 text-gold/60 mb-1.5" />
                          <span className="text-[8px] uppercase font-sans font-bold text-ink/40 dark:text-parchment/40 block tracking-wider">{item.label}</span>
                          <span className="font-serif font-semibold text-sm mt-0.5 block">{item.value}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </PremiumCard>
              </motion.div>

              {/* Chart Visualization */}
              <motion.div variants={itemVariants} id="chart-section" ref={sectionRefs.chart}>
                <PremiumCard glass>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif font-semibold flex items-center gap-2">
                      <Star className="w-4 h-4 text-gold" /> {t('kundli.chart')}
                    </h3>
                    <span className="text-[9px] uppercase font-sans font-bold text-ink/30 dark:text-parchment/30 tracking-wider">{t('kundli.northChart')}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NorthIndianChart placements={profile.planetaryPlacements} lagna={profile.lagna} rashi={profile.rashi} />
                    <div className="space-y-3">
                      <p className="text-sm text-ink/70 dark:text-parchment/70 leading-relaxed">{profile.generalReading}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: t('kundli.elementLabel'), value: profile.element, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
                          { label: t('kundli.dosha'), value: profile.doshaDominance, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
                          { label: `${profile.luckyNumber}`, value: t('kundli.luckyNum'), color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
                        ].map((tag, i) => (
                          <span key={i} className={`px-2.5 py-1 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider ${tag.color}`}>
                            {tag.value} {tag.label}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-ink/30 dark:text-parchment/30 font-mono">
                        {t('kundli.infoText', { color: profile.luckyColor, gemstone: profile.gemstone })}
                      </p>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>

              {/* Planetary Placements */}
              <motion.div variants={itemVariants}>
                <PremiumCard glass>
                  <h3 className="font-serif font-semibold mb-4 flex items-center gap-2">
                    <Moon className="w-4 h-4 text-gold" /> {t('kundli.planetaryPlacements')}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-ink/10 dark:border-white/[0.06]">
                          <th className="pb-3 font-sans text-[9px] uppercase tracking-wider text-ink/40 dark:text-parchment/40 font-bold">{t('kundli.planet')}</th>
                          <th className="pb-3 font-sans text-[9px] uppercase tracking-wider text-ink/40 dark:text-parchment/40 font-bold">{t('kundli.sign')}</th>
                          <th className="pb-3 font-sans text-[9px] uppercase tracking-wider text-ink/40 dark:text-parchment/40 font-bold">{t('kundli.house')}</th>
                          <th className="pb-3 font-sans text-[9px] uppercase tracking-wider text-ink/40 dark:text-parchment/40 font-bold">{t('kundli.description')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/5 dark:divide-white/[0.03]">
                        {profile.planetaryPlacements.map((p, i) => (
                          <motion.tr
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="hover:bg-ink/5 dark:hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-3 font-medium flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[7px] font-bold" style={{ backgroundColor: `${PLANET_SYMBOLS[p.planet]?.color || '#999'}20`, color: PLANET_SYMBOLS[p.planet]?.color || '#999' }}>
                                {PLANET_SYMBOLS[p.planet]?.symbol || '?'}
                              </span>
                              {p.planet}
                            </td>
                            <td className="py-3 text-ink/60 dark:text-parchment/60">{p.sign}</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 bg-gold/10 text-gold rounded text-[10px] font-mono font-bold">{p.house}</span>
                            </td>
                            <td className="py-3 text-sm text-ink/50 dark:text-parchment/50">{p.description}</td>
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
                    <h3 className="font-serif font-semibold mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-gold" /> {t('kundli.strengths')}</h3>
                    <ul className="space-y-2.5">
                      {profile.strengths.map((s, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex gap-2.5 text-sm text-ink/70 dark:text-parchment/70"
                        >
                          <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </PremiumCard>
                  <PremiumCard glass>
                    <h3 className="font-serif font-semibold mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-pink-400" /> {t('kundli.challenges')}</h3>
                    <ul className="space-y-2.5">
                      {profile.weaknesses.map((w, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex gap-2.5 text-sm text-ink/70 dark:text-parchment/70"
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
                    <h3 className="font-serif font-semibold mb-5 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-gold" /> {t('kundli.insightsTitle')}
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
                    <h3 className="font-serif font-semibold mb-5 flex items-center gap-2">
                      <Gem className="w-4 h-4 text-gold" /> {t('kundli.remediesTitle')}
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
                    <h3 className="font-serif font-semibold mb-5 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-gold" /> {t('kundli.transitsTitle')}
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
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold/15 to-amber-400/15 flex items-center justify-center">
                  <Star className="w-8 h-8 text-gold/40" />
                </div>
                <p className="text-ink/40 dark:text-parchment/40 text-sm mb-1">{t('kundli.emptyTitle')}</p>
                <p className="text-xs text-ink/30 dark:text-parchment/30">{t('kundli.emptyDesc')}</p>
              </div>
            </PremiumCard>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
