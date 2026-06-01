import { useState, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Heart, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { PremiumButton } from '@/components/PremiumButton';
import { Input } from '@/components/ui/Input';
import { BirthPlaceInput } from '@/components/ui/BirthPlaceInput';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { useT } from '@/lib/i18n/useT';
import type { CompatibilityInput, CompatibilityResult } from '@shared/types/api';

interface PartnerErrors {
  name?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
}

function validatePartner(name: string, date: string, time: string, place: string, t: (...args: any[]) => string): PartnerErrors {
  const errs: PartnerErrors = {};
  if (!name.trim()) errs.name = t('compatibility.nameRequired');
  if (!date) errs.birthDate = t('compatibility.dateRequired');
  else {
    const d = new Date(date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d > tomorrow) errs.birthDate = t('compatibility.futureDate');
  }
  if (!time) errs.birthTime = t('compatibility.timeRequired');
  if (!place.trim()) errs.birthPlace = t('compatibility.placeRequired');
  return errs;
}

export function CompatibilityPage() {
  const { t } = useT();
  const [input, setInput] = useState<CompatibilityInput & {
    partnerA: { birthState: string; birthCountry: string };
    partnerB: { birthState: string; birthCountry: string };
  }>({
    partnerA: { name: '', birthDate: '', birthTime: '', birthPlace: '', birthState: '', birthCountry: '' },
    partnerB: { name: '', birthDate: '', birthTime: '', birthPlace: '', birthState: '', birthCountry: '' },
  });
  const [errors, setErrors] = useState<{ partnerA?: PartnerErrors; partnerB?: PartnerErrors }>({});

  const mutation = useMutation({
    mutationFn: (data: CompatibilityInput) => api.post<CompatibilityResult>('/api/astrology/compatibility', data),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errA = validatePartner(input.partnerA.name, input.partnerA.birthDate, input.partnerA.birthTime, input.partnerA.birthPlace, t);
    const errB = validatePartner(input.partnerB.name, input.partnerB.birthDate, input.partnerB.birthTime, input.partnerB.birthPlace, t);
    setErrors({ partnerA: errA, partnerB: errB });
    if (Object.keys(errA).length > 0 || Object.keys(errB).length > 0) return;
    mutation.mutate(input);
  };

  const result = mutation.data?.data;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-serif font-bold">{t('compatibility.title')}</h1>
        <p className="text-ink/50 dark:text-parchment/50 mt-1">{t('compatibility.subtitle')}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
          <PremiumCard glass>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Heart className="w-4 h-4 text-pink-400" />
              </div>
              <h3 className="font-serif text-lg font-semibold">{t('compatibility.partnerDetails')}</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h4 className="text-[10px] uppercase font-sans font-bold text-ink/40 dark:text-parchment/40 mb-3 tracking-wider">{t('compatibility.partnerA')}</h4>
                <div className="space-y-3">
                  <Input label={t('compatibility.name')} value={input.partnerA.name} onChange={(e) => { setInput({ ...input, partnerA: { ...input.partnerA, name: e.target.value } }); setErrors({ ...errors, partnerA: { ...errors.partnerA, name: '' } }); }} required placeholder={t('compatibility.namePlaceholder')} error={errors.partnerA?.name} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label={t('compatibility.date')} type="date" value={input.partnerA.birthDate} onChange={(e) => { setInput({ ...input, partnerA: { ...input.partnerA, birthDate: e.target.value } }); setErrors({ ...errors, partnerA: { ...errors.partnerA, birthDate: '' } }); }} required error={errors.partnerA?.birthDate} />
                    <Input label={t('compatibility.time')} type="time" value={input.partnerA.birthTime} onChange={(e) => { setInput({ ...input, partnerA: { ...input.partnerA, birthTime: e.target.value } }); setErrors({ ...errors, partnerA: { ...errors.partnerA, birthTime: '' } }); }} required error={errors.partnerA?.birthTime} />
                  </div>
                  <BirthPlaceInput label={t('compatibility.place')} value={input.partnerA.birthPlace} onChange={(v) => setInput({ ...input, partnerA: { ...input.partnerA, birthPlace: v } })} required placeholder={t('compatibility.placePlaceholder')} state={input.partnerA.birthState} onStateChange={(v) => setInput({ ...input, partnerA: { ...input.partnerA, birthState: v } })} country={input.partnerA.birthCountry} onCountryChange={(v) => setInput({ ...input, partnerA: { ...input.partnerA, birthCountry: v } })} />
                </div>
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-sans font-bold text-ink/40 dark:text-parchment/40 mb-3 tracking-wider">{t('compatibility.partnerB')}</h4>
                <div className="space-y-3">
                  <Input label={t('compatibility.name')} value={input.partnerB.name} onChange={(e) => { setInput({ ...input, partnerB: { ...input.partnerB, name: e.target.value } }); setErrors({ ...errors, partnerB: { ...errors.partnerB, name: '' } }); }} required placeholder={t('compatibility.namePlaceholder')} error={errors.partnerB?.name} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label={t('compatibility.date')} type="date" value={input.partnerB.birthDate} onChange={(e) => { setInput({ ...input, partnerB: { ...input.partnerB, birthDate: e.target.value } }); setErrors({ ...errors, partnerB: { ...errors.partnerB, birthDate: '' } }); }} required error={errors.partnerB?.birthDate} />
                    <Input label={t('compatibility.time')} type="time" value={input.partnerB.birthTime} onChange={(e) => { setInput({ ...input, partnerB: { ...input.partnerB, birthTime: e.target.value } }); setErrors({ ...errors, partnerB: { ...errors.partnerB, birthTime: '' } }); }} required error={errors.partnerB?.birthTime} />
                  </div>
                  <BirthPlaceInput label={t('compatibility.place')} value={input.partnerB.birthPlace} onChange={(v) => setInput({ ...input, partnerB: { ...input.partnerB, birthPlace: v } })} required placeholder={t('compatibility.placePlaceholder')} state={input.partnerB.birthState} onStateChange={(v) => setInput({ ...input, partnerB: { ...input.partnerB, birthState: v } })} country={input.partnerB.birthCountry} onCountryChange={(v) => setInput({ ...input, partnerB: { ...input.partnerB, birthCountry: v } })} />
                </div>
              </div>
              <PremiumButton type="submit" loading={mutation.isPending} icon={<Heart className="w-3.5 h-3.5" />} className="w-full">
                {t('compatibility.check')}
              </PremiumButton>
              {mutation.isError && (
                <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {t('compatibility.error')}</p>
              )}
            </form>
          </PremiumCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3">
          {mutation.isPending ? (
            <PremiumCard glass className="flex items-center justify-center py-20">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                <RefreshCw className="w-10 h-10 text-gold" />
              </motion.div>
            </PremiumCard>
          ) : result ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <PremiumCard glass glow>
                <div className="flex justify-between items-start border-b border-ink/10 dark:border-white/[0.06] pb-4 mb-4">
                  <div>
                    <span className="text-[9px] uppercase font-sans font-bold text-gold tracking-[0.2em]">{t('compatibility.result')}</span>
                    <h2 className="text-2xl font-serif font-bold mt-1">{t('compatibility.gunMilan')}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-sans font-bold text-ink/40 dark:text-parchment/40 block">{t('compatibility.score')}</span>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="text-4xl font-serif font-bold text-gold"
                    >
                      {result.gunsMatched}/36
                    </motion.span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink/60 dark:text-parchment/60">{t('compatibility.score')}</span>
                    <span className="font-bold">{result.compatibilityScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-ink/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.compatibilityScore}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-gold to-amber-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm bg-ink/5 dark:bg-white/[0.04] p-3 rounded-lg">
                  <div>
                    <span className="text-[9px] uppercase font-sans font-bold text-ink/40 dark:text-parchment/40 block">{t('compatibility.partnerA')}</span>
                    <span className="font-serif font-semibold">{result.partnerA_Rashi}</span>
                    <span className="text-ink/40 dark:text-parchment/40 block text-xs">{result.partnerA_Nakshatra}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-sans font-bold text-ink/40 dark:text-parchment/40 block">{t('compatibility.partnerB')}</span>
                    <span className="font-serif font-semibold">{result.partnerB_Rashi}</span>
                    <span className="text-ink/40 dark:text-parchment/40 block text-xs">{result.partnerB_Nakshatra}</span>
                  </div>
                </div>
                <blockquote className="border-l-2 border-gold pl-4 italic mt-4 text-sm text-ink/70 dark:text-parchment/70">{result.verdict}</blockquote>
                <p className="text-sm mt-4 leading-relaxed text-ink/70 dark:text-parchment/70">{result.detailedAnalysis}</p>
              </PremiumCard>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PremiumCard glass>
                  <span className="text-[9px] uppercase font-sans font-bold text-green-400 tracking-wider">{t('compatibility.strengths')}</span>
                  <p className="text-sm mt-2 text-ink/70 dark:text-parchment/70">{result.strengths}</p>
                </PremiumCard>
                <PremiumCard glass>
                  <span className="text-[9px] uppercase font-sans font-bold text-amber-400 tracking-wider">{t('compatibility.challenges')}</span>
                  <p className="text-sm mt-2 text-ink/70 dark:text-parchment/70">{result.challenges}</p>
                </PremiumCard>
              </div>

              <PremiumCard glass className="gold-border">
                <span className="text-[9px] uppercase font-sans font-bold text-gold tracking-wider">{t('compatibility.remedy')}</span>
                <p className="text-sm mt-2 italic text-ink/70 dark:text-parchment/70">{result.remedy}</p>
              </PremiumCard>

              {result.gunAnalysis && (
                <PremiumCard glass>
                  <h3 className="font-serif font-semibold mb-4">{t('compatibility.koota')}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-ink/10 dark:border-white/[0.06]">
                          <th className="pb-3 font-sans text-[9px] uppercase text-ink/40 dark:text-parchment/40 tracking-wider">{t('compatibility.koota')}</th>
                          <th className="pb-3 font-sans text-[9px] uppercase text-ink/40 dark:text-parchment/40 tracking-wider">{t('compatibility.kootaDescription')}</th>
                          <th className="pb-3 font-sans text-[9px] uppercase text-ink/40 dark:text-parchment/40 tracking-wider text-right">{t('compatibility.kootaScore')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/5 dark:divide-white/[0.03]">
                        {result.gunAnalysis.map((g, i) => (
                          <motion.tr key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.03 * i }}
                            className="hover:bg-ink/5 dark:hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-3 font-medium">{g.kootaName}</td>
                            <td className="py-3 text-ink/50 dark:text-parchment/50 text-xs">{g.description}</td>
                            <td className="py-3 text-right">
                              <span className={g.pointsScored === 0 ? 'text-red-400' : 'text-gold font-bold'}>{g.pointsScored}</span>
                              <span className="text-ink/30 dark:text-parchment/30">/{g.maxPoints}</span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </PremiumCard>
              )}
            </motion.div>
          ) : (
            <PremiumCard glass className="flex items-center justify-center py-20">
              <div className="text-center">
                <Heart className="w-14 h-14 text-gold/20 mx-auto mb-3" />
                <p className="text-ink/40 dark:text-parchment/40">{t('compatibility.empty')}</p>
              </div>
            </PremiumCard>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
