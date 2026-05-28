import { useState, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Shield, Heart, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { PremiumButton } from '@/components/PremiumButton';
import { Input } from '@/components/ui/Input';
import { PremiumCard } from '@/components/ui/PremiumCard';
import type { BirthDetails, VedicProfile } from '@shared/types/api';

export function KundliPage() {
  const [formData, setFormData] = useState<BirthDetails>({
    name: '', birthDate: '1998-06-15', birthTime: '08:30', birthPlace: 'Mumbai, India',
  });

  const mutation = useMutation({
    mutationFn: (data: BirthDetails) => api.post<VedicProfile>('/api/astrology/vedic-profile', data),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.birthPlace.trim()) return;
    mutation.mutate(formData);
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
              <Input id="k_name" label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Your full name" />
              <div className="grid grid-cols-2 gap-4">
                <Input id="k_date" label="Birth Date" type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} required />
                <Input id="k_time" label="Birth Time" type="time" value={formData.birthTime} onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })} required />
              </div>
              <Input id="k_place" label="Birth Place" value={formData.birthPlace} onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })} required placeholder="City, Country" />
              <PremiumButton type="submit" loading={mutation.isPending} icon={<Sparkles className="w-3.5 h-3.5" />} className="w-full">
                Generate Chart
              </PremiumButton>
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
              <PremiumCard glass glow>
                <div className="flex flex-wrap justify-between items-start gap-4 border-b border-ink/10 dark:border-white/[0.06] pb-4 mb-4">
                  <div>
                    <span className="text-[9px] uppercase font-sans font-bold tracking-[0.2em] text-gold">Natal Chart</span>
                    <h2 className="text-3xl font-serif font-bold mt-1">{profile.name}</h2>
                    <p className="text-xs text-ink/40 dark:text-parchment/40 mt-1">{profile.birthDate} • {profile.birthTime} • {profile.birthPlace}</p>
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
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="p-3 bg-ink/5 dark:bg-white/[0.04] rounded-lg"
                    >
                      <span className="text-[8px] uppercase font-sans font-bold text-ink/40 dark:text-parchment/40 block">{item.label}</span>
                      <span className="font-serif font-semibold text-sm">{item.value}</span>
                    </motion.div>
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
                      <motion.li key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className="flex gap-2 text-sm text-ink/70 dark:text-parchment/70"
                      >
                        <span className="text-gold">✦</span>{s}
                      </motion.li>
                    ))}
                  </ul>
                </PremiumCard>
                <PremiumCard glass>
                  <h3 className="font-serif font-semibold mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-pink-400" /> Challenges</h3>
                  <ul className="space-y-2">
                    {profile.weaknesses.map((w, i) => (
                      <motion.li key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className="flex gap-2 text-sm text-ink/70 dark:text-parchment/70"
                      >
                        <span className="text-pink-400">✦</span>{w}
                      </motion.li>
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
                        <motion.tr key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.05 * i }}
                          className="hover:bg-ink/5 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3 font-medium">{p.planet}</td>
                          <td className="py-3 text-ink/60 dark:text-parchment/60">{p.sign}</td>
                          <td className="py-3">{p.house}</td>
                          <td className="py-3 text-sm text-ink/50 dark:text-parchment/50">{p.description}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </PremiumCard>
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
