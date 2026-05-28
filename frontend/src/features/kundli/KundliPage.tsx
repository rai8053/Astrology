import { useState, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Shield, Heart, RefreshCw, User, Calendar, Clock, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold">Birth Chart (Kundli)</h1>
        <p className="text-ink/60 dark:text-parchment/60 mt-1">Discover your Vedic blueprint</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-gold" />
              <h3 className="font-serif text-lg font-semibold">Enter Birth Details</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input id="k_name" label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <Input id="k_date" label="Birth Date" type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} required />
                <Input id="k_time" label="Birth Time" type="time" value={formData.birthTime} onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })} required />
              </div>
              <Input id="k_place" label="Birth Place" value={formData.birthPlace} onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })} required />
              <Button type="submit" loading={mutation.isPending} className="w-full">
                <Sparkles className="w-3.5 h-3.5" /> Generate Chart
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {mutation.isPending ? (
            <Card className="flex items-center justify-center py-20">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-gold animate-spin mx-auto mb-3" />
                <p className="text-sm text-ink/60">Calculating your celestial blueprint...</p>
              </div>
            </Card>
          ) : profile ? (
            <div className="space-y-6">
              <Card>
                <div className="flex flex-wrap justify-between items-start gap-4 border-b border-ink/10 dark:border-white/10 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-gold">Natal Chart</span>
                    <h2 className="text-3xl font-serif font-bold mt-1">{profile.name}</h2>
                    <p className="text-xs text-ink/60 mt-1">{profile.birthDate} • {profile.birthTime} • {profile.birthPlace}</p>
                  </div>
                  <div className="text-center px-4 py-2 border border-gold/30 rounded-lg">
                    <span className="text-[9px] uppercase font-sans font-bold text-gold block">Rashi Lord</span>
                    <span className="font-serif font-semibold">{profile.rashiLord}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Moon Rashi', value: profile.rashi },
                    { label: 'Ascendant', value: profile.lagna },
                    { label: 'Nakshatra', value: profile.nakshatra },
                    { label: 'Nakshatra Lord', value: profile.nakshatraLord },
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-ink/5 dark:bg-white/5 rounded-lg">
                      <span className="text-[9px] uppercase font-sans font-bold text-ink/50 block">{item.label}</span>
                      <span className="font-serif font-semibold text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <p className="text-sm leading-relaxed">{profile.generalReading}</p>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <h3 className="font-serif font-semibold mb-3 flex items-center gap-2"><Shield className="w-4 h-4" /> Strengths</h3>
                  <ul className="space-y-2">
                    {profile.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm"><span className="text-gold">✦</span>{s}</li>
                    ))}
                  </ul>
                </Card>
                <Card>
                  <h3 className="font-serif font-semibold mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-pink-500" /> Challenges</h3>
                  <ul className="space-y-2">
                    {profile.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-2 text-sm"><span className="text-pink-500">✦</span>{w}</li>
                    ))}
                  </ul>
                </Card>
              </div>

              <Card>
                <h3 className="font-serif font-semibold mb-4">Planetary Placements</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-ink/10 dark:border-white/10">
                        <th className="pb-2 font-sans text-[10px] uppercase tracking-wider text-ink/50">Planet</th>
                        <th className="pb-2 font-sans text-[10px] uppercase tracking-wider text-ink/50">Sign</th>
                        <th className="pb-2 font-sans text-[10px] uppercase tracking-wider text-ink/50">House</th>
                        <th className="pb-2 font-sans text-[10px] uppercase tracking-wider text-ink/50">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/5 dark:divide-white/5">
                      {profile.planetaryPlacements.map((p, i) => (
                        <tr key={i}>
                          <td className="py-2 font-medium">{p.planet}</td>
                          <td className="py-2 text-ink/70">{p.sign}</td>
                          <td className="py-2">{p.house}</td>
                          <td className="py-2 text-sm text-ink/60">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="flex items-center justify-center py-20">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-ink/20 mx-auto mb-3" />
                <p className="text-ink/50">Enter your birth details to generate your chart</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


