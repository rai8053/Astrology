import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { PremiumCard } from '@/components/ui/PremiumCard';

interface UsageRow {
  feature: string;
  _sum: { tokensIn: number; tokensOut: number; cost: number };
  _count: number;
}

export function AdminAnalytics() {
  const { data } = useQuery({
    queryKey: ['admin-usage'],
    queryFn: () => api.get<UsageRow[]>('/api/admin/usage'),
  });

  return (
    <div className="space-y-6">
      <PremiumCard glass>
        <h3 className="font-serif text-lg font-semibold mb-4">AI Usage by Feature (30 days)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 dark:border-white/[0.06]">
                <th className="pb-3 font-sans text-[9px] uppercase text-ink/40 dark:text-parchment/40 tracking-wider">Feature</th>
                <th className="pb-3 font-sans text-[9px] uppercase text-ink/40 dark:text-parchment/40 tracking-wider text-right">Calls</th>
                <th className="pb-3 font-sans text-[9px] uppercase text-ink/40 dark:text-parchment/40 tracking-wider text-right">Tokens In</th>
                <th className="pb-3 font-sans text-[9px] uppercase text-ink/40 dark:text-parchment/40 tracking-wider text-right">Tokens Out</th>
                <th className="pb-3 font-sans text-[9px] uppercase text-ink/40 dark:text-parchment/40 tracking-wider text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5 dark:divide-white/[0.03]">
              {data?.data?.map((row, i) => (
                <motion.tr key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-ink/5 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 font-medium capitalize">{row.feature}</td>
                  <td className="py-3 text-right">{row._count}</td>
                  <td className="py-3 text-right text-ink/60 dark:text-parchment/60">{row._sum.tokensIn.toLocaleString()}</td>
                  <td className="py-3 text-right text-ink/60 dark:text-parchment/60">{row._sum.tokensOut.toLocaleString()}</td>
                  <td className="py-3 text-right font-medium text-gold">${row._sum.cost.toFixed(4)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </PremiumCard>
    </div>
  );
}
