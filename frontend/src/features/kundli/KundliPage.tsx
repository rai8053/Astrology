import { useState, FormEvent, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Shield, Heart, RefreshCw, Download, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { PremiumButton } from '@/components/PremiumButton';
import { Input } from '@/components/ui/Input';
import { BirthPlaceInput } from '@/components/ui/BirthPlaceInput';
import { PremiumCard } from '@/components/ui/PremiumCard';
import type { BirthDetails, VedicProfile } from '@shared/types/api';

export function KundliPage() {
  const [formData, setFormData] = useState<BirthDetails>({
    name: '', birthDate: '', birthTime: '', birthPlace: '',
  });
  const [birthState, setBirthState] = useState('');
  const [birthCountry, setBirthCountry] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof BirthDetails, string>>>({});
  const chartRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: (data: BirthDetails) => api.post<VedicProfile>('/api/astrology/vedic-profile', data),
    onSuccess: () => setErrors({}),
  });

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.birthDate) errs.birthDate = 'Date is required';
    if (!formData.birthTime) errs.birthTime = 'Time is required';
    if (!formData.birthPlace.trim()) errs.birthPlace = 'Place is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate(formData);
  };

  const handleDownload = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) { window.print(); return; }
    const style = Array.from(document.styleSheets)
      .map(s => {
        try { return Array.from(s.cssRules || []).map(r => r.cssText).join(''); }
        catch { return ''; }
      }).join('');
    printWin.document.write(`<!DOCTYPE html><html><head><title>${profile?.name || 'Birth Chart'} - Soma & Surya</title><style>${style}</style><style>
      @page { margin: 15mm; size: A4 portrait; }
      body { background: #fff !important; color: #1a1a2e !important; padding: 20px; font-family: serif; }
      .no-print, nav, footer, button, iframe { display: none !important; }
      .print-only { display: block !important; }
      [class*="bg-ink\\/"] { background: #f5f0eb !important; }
      [class*="dark:"] { background: #fff !important; color: #1a1a2e !important; }
      table { width: 100%; border-collapse: collapse; }
      td, th { padding: 8px; border-bottom: 1px solid #e0d6cc; text-align: left; }
    </style></head><body>`);
    printWin.document.write(`<div style="max-width:800px;margin:0 auto">`);
    printWin.document.write(chartRef.current?.innerHTML || '');
    printWin.document.write(`</div></body></html>`);
    printWin.document.close();
    printWin.onload = () => { printWin.focus(); printWin.print(); };
  };

  const profile = mutation.data?.data;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-serif font-bold">Birth Chart (Kundli)</h1>
        <p className="text-ink/50 dark:text-parchment/50 mt-1">Discover your Vedic blueprint</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <PremiumCard glass>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-gold" />
              </div>
              <h3 className="font-serif text-lg font-semibold">Enter Birth Details</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input id="k_name" label="Full Name" value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: '' }); }} required placeholder="Your full name" error={errors.name} />
              <div className="grid grid-cols-2 gap-4">
                <Input id="k_date" label="Birth Date" type="date" value={formData.birthDate} onChange={(e) => { setFormData({ ...formData, birthDate: e.target.value }); setErrors({ ...errors, birthDate: '' }); }} required error={errors.birthDate} />
                <Input id="k_time" label="Birth Time" type="time" value={formData.birthTime} onChange={(e) => { setFormData({ ...formData, birthTime: e.target.value }); setErrors({ ...errors, birthTime: '' }); }} required error={errors.birthTime} />
              </div>
              <BirthPlaceInput id="k_place" label="Birth Place" value={formData.birthPlace} onChange={(v) => { setFormData({ ...formData, birthPlace: v }); setErrors({ ...errors, birthPlace: '' }); }} required placeholder="e.g., Sadhaura, Yamunanagar" error={errors.birthPlace} state={birthState} onStateChange={setBirthState} country={birthCountry} onCountryChange={setBirthCountry} />
              <PremiumButton type="submit" loading={mutation.isPending} icon={<Sparkles className="w-3.5 h-3.5" />} className="w-full">
                Generate Chart
              </PremiumButton>
              {mutation.isError && (
                <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Failed to generate chart. Please try again.</p>
              )}
            </form>
          </PremiumCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          {mutation.isPending ? (
            <PremiumCard glass className="flex items-center justify-center py-20">
              <div className="text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <RefreshCw className="w-10 h-10 text-gold mx-auto mb-4" />
                </motion.div>
                <p className="text-sm text-ink/50 dark:text-parchment/50">Calculating your celestial blueprint...</p>
              </div>
            </PremiumCard>
          ) : profile ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-end gap-2 no-print">
                <PremiumButton variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={handleDownload}>
                  Download PDF
                </PremiumButton>
              </div>

              <div ref={chartRef} id="birth-chart-content">
                <PremiumCard glass glow>
                  <div className="flex flex-wrap justify-between items-start gap-4 border-b border-ink/10 dark:border-white/[0.06] pb-4 mb-4">
                    <div>
                      <span className="text-[9px] uppercase font-sans font-bold tracking-[0.2em] text-gold">Natal Chart</span>
                      <h2 className="text-3xl font-serif font-bold mt-1">{profile.name}</h2>
                      <p className="text-xs text-ink/40 dark:text-parchment/40 mt-1">{profile.birthDate} &bull; {profile.birthTime} &bull; {profile.birthPlace}</p>
                    </div>
                    <div className="text-center px-4 py-2 gold-border rounded-lg bg-gold/5">
                      <span className="text-[8px] uppercase font-sans font-bold text-gold block">Rashi Lord</span>
                      <span className="font-serif font-semibold text-gold">{profile.rashiLord}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Moon Rashi', value: profile.rashi },
                      { label: 'Ascendant', value: profile.lagna },
                      { label: 'Nakshatra', value: profile.nakshatra },
                      { label: 'Nakshatra Lord', value: profile.nakshatraLord },
                    ].map((item, i) => (
                      <div key={i} className="p-3 bg-ink/5 dark:bg-white/[0.04] rounded-lg">
                        <span className="text-[8px] uppercase font-sans font-bold text-ink/40 dark:text-parchment/40 block">{item.label}</span>
                        <span className="font-serif font-semibold text-sm">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </PremiumCard>

                <PremiumCard glass>
                  <p className="text-sm leading-relaxed text-ink/70 dark:text-parchment/70">{profile.generalReading}</p>
                </PremiumCard>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PremiumCard glass>
                    <h3 className="font-serif font-semibold mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-gold" /> Strengths</h3>
                    <ul className="space-y-2">
                      {profile.strengths.map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm text-ink/70 dark:text-parchment/70">
                          <span className="text-gold">&bull;</span>{s}
                        </li>
                      ))}
                    </ul>
                  </PremiumCard>
                  <PremiumCard glass>
                    <h3 className="font-serif font-semibold mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-pink-400" /> Challenges</h3>
                    <ul className="space-y-2">
                      {profile.weaknesses.map((w, i) => (
                        <li key={i} className="flex gap-2 text-sm text-ink/70 dark:text-parchment/70">
                          <span className="text-pink-400">&bull;</span>{w}
                        </li>
                      ))}
                    </ul>
                  </PremiumCard>
                </div>

                <PremiumCard glass>
                  <h3 className="font-serif font-semibold mb-4">Planetary Placements</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-ink/10 dark:border-white/[0.06]">
                          <th className="pb-3 font-sans text-[9px] uppercase tracking-wider text-ink/40 dark:text-parchment/40">Planet</th>
                          <th className="pb-3 font-sans text-[9px] uppercase tracking-wider text-ink/40 dark:text-parchment/40">Sign</th>
                          <th className="pb-3 font-sans text-[9px] uppercase tracking-wider text-ink/40 dark:text-parchment/40">House</th>
                          <th className="pb-3 font-sans text-[9px] uppercase tracking-wider text-ink/40 dark:text-parchment/40">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/5 dark:divide-white/[0.03]">
                        {profile.planetaryPlacements.map((p, i) => (
                          <tr key={i} className="hover:bg-ink/5 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 font-medium">{p.planet}</td>
                            <td className="py-3 text-ink/60 dark:text-parchment/60">{p.sign}</td>
                            <td className="py-3">{p.house}</td>
                            <td className="py-3 text-sm text-ink/50 dark:text-parchment/50">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </PremiumCard>
              </div>
            </motion.div>
          ) : (
            <PremiumCard glass className="flex items-center justify-center py-20">
              <div className="text-center">
                <Sparkles className="w-14 h-14 text-gold/20 mx-auto mb-3" />
                <p className="text-ink/40 dark:text-parchment/40">Enter your birth details to generate your chart</p>
              </div>
            </PremiumCard>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
