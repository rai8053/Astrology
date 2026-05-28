import { useState, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Heart, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import type { CompatibilityInput, CompatibilityResult } from '@shared/types/api';

export function CompatibilityPage() {
  const [input, setInput] = useState<CompatibilityInput>({
    partnerA: { name: '', birthDate: '1998-06-15', birthTime: '08:30', birthPlace: 'Mumbai' },
    partnerB: { name: '', birthDate: '1999-07-20', birthTime: '14:15', birthPlace: 'Delhi' },
  });

  const mutation = useMutation({
    mutationFn: (data: CompatibilityInput) => api.post<CompatibilityResult>('/api/astrology/compatibility', data),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.partnerA.name.trim() || !input.partnerB.name.trim()) return;
    mutation.mutate(input);
  };

  const result = mutation.data?.data;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold">Compatibility (Gun Milan)</h1>
        <p className="text-ink/60 dark:text-parchment/60 mt-1">Ashta Koota relationship matching</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-pink-500" />
              <h3 className="font-serif text-lg font-semibold">Partner Details</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h4 className="text-xs uppercase font-sans font-bold text-ink/50 mb-3">Partner A</h4>
                <div className="space-y-3">
                  <Input label="Name" value={input.partnerA.name} onChange={(e) => setInput({ ...input, partnerA: { ...input.partnerA, name: e.target.value } })} required />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Birth Date" type="date" value={input.partnerA.birthDate} onChange={(e) => setInput({ ...input, partnerA: { ...input.partnerA, birthDate: e.target.value } })} required />
                    <Input label="Birth Time" type="time" value={input.partnerA.birthTime} onChange={(e) => setInput({ ...input, partnerA: { ...input.partnerA, birthTime: e.target.value } })} required />
                  </div>
                  <Input label="Birth Place" value={input.partnerA.birthPlace} onChange={(e) => setInput({ ...input, partnerA: { ...input.partnerA, birthPlace: e.target.value } })} required />
                </div>
              </div>
              <div>
                <h4 className="text-xs uppercase font-sans font-bold text-ink/50 mb-3">Partner B</h4>
                <div className="space-y-3">
                  <Input label="Name" value={input.partnerB.name} onChange={(e) => setInput({ ...input, partnerB: { ...input.partnerB, name: e.target.value } })} required />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Birth Date" type="date" value={input.partnerB.birthDate} onChange={(e) => setInput({ ...input, partnerB: { ...input.partnerB, birthDate: e.target.value } })} required />
                    <Input label="Birth Time" type="time" value={input.partnerB.birthTime} onChange={(e) => setInput({ ...input, partnerB: { ...input.partnerB, birthTime: e.target.value } })} required />
                  </div>
                  <Input label="Birth Place" value={input.partnerB.birthPlace} onChange={(e) => setInput({ ...input, partnerB: { ...input.partnerB, birthPlace: e.target.value } })} required />
                </div>
              </div>
              <Button type="submit" loading={mutation.isPending} className="w-full">
                <Heart className="w-3.5 h-3.5" /> Check Compatibility
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {mutation.isPending ? (
            <Card className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 text-gold animate-spin" />
            </Card>
          ) : result ? (
            <div className="space-y-6">
              <Card>
                <div className="flex justify-between items-start border-b border-ink/10 dark:border-white/10 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-sans font-bold text-gold">Result</span>
                    <h2 className="text-2xl font-serif font-bold mt-1">Gun Milan Analysis</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-sans font-bold text-ink/50 block">Score</span>
                    <span className="text-4xl font-serif font-bold text-gold">{result.gunsMatched}/36</span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Compatibility</span>
                    <span className="font-bold">{result.compatibilityScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-ink/10 rounded-full overflow-hidden">
                    <div className="bg-gold h-full rounded-full transition-all" style={{ width: `${result.compatibilityScore}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm bg-ink/5 dark:bg-white/5 p-3 rounded-lg">
                  <div>
                    <span className="text-[10px] uppercase font-sans font-bold text-ink/50 block">Partner A</span>
                    <span className="font-serif font-semibold">{result.partnerA_Rashi}</span>
                    <span className="text-ink/60 block text-xs">{result.partnerA_Nakshatra}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-sans font-bold text-ink/50 block">Partner B</span>
                    <span className="font-serif font-semibold">{result.partnerB_Rashi}</span>
                    <span className="text-ink/60 block text-xs">{result.partnerB_Nakshatra}</span>
                  </div>
                </div>
                <blockquote className="border-l-2 border-gold pl-4 italic mt-4 text-sm">{result.verdict}</blockquote>
                <p className="text-sm mt-4 leading-relaxed">{result.detailedAnalysis}</p>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <span className="text-[10px] uppercase font-sans font-bold text-green-600">Strengths</span>
                  <p className="text-sm mt-2">{result.strengths}</p>
                </Card>
                <Card>
                  <span className="text-[10px] uppercase font-sans font-bold text-amber-600">Challenges</span>
                  <p className="text-sm mt-2">{result.challenges}</p>
                </Card>
              </div>

              <Card className="border-gold/30">
                <span className="text-[10px] uppercase font-sans font-bold text-gold">Remedy</span>
                <p className="text-sm mt-2 italic">{result.remedy}</p>
              </Card>

              {result.gunAnalysis && (
                <Card>
                  <h3 className="font-serif font-semibold mb-4">Guna Breakdown (Ashta Koota)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-ink/10 dark:border-white/10">
                          <th className="pb-2 font-sans text-[10px] uppercase text-ink/50">Koota</th>
                          <th className="pb-2 font-sans text-[10px] uppercase text-ink/50">Description</th>
                          <th className="pb-2 font-sans text-[10px] uppercase text-ink/50 text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/5">
                        {result.gunAnalysis.map((g, i) => (
                          <tr key={i}>
                            <td className="py-2 font-medium">{g.kootaName}</td>
                            <td className="py-2 text-ink/60 text-xs">{g.description}</td>
                            <td className="py-2 text-right">
                              <span className={g.pointsScored === 0 ? 'text-red-500' : 'text-gold font-bold'}>{g.pointsScored}</span>
                              <span className="text-ink/40">/{g.maxPoints}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card className="flex items-center justify-center py-20">
              <div className="text-center">
                <Heart className="w-12 h-12 text-ink/20 mx-auto mb-3" />
                <p className="text-ink/50">Enter both partners' details to check compatibility</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
