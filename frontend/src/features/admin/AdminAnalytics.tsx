import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { useT } from '@/lib/i18n/useT';

interface UsageRow {
  feature: string;
  _sum: { tokensIn: number; tokensOut: number; cost: number };
  _count: number;
}

export function AdminAnalytics() {
  const { t } = useT();
  const { data } = useQuery({
    queryKey: ['admin-usage'],
    queryFn: () => api.get<UsageRow[]>('/api/admin/usage'),
  });

  return (
    <div className="space-y-6">
      <PremiumCard glass>
        <h3 className="font-serif text-lg font-semibold mb-4">{t('admin.aiUsageTitle' as any)}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 dark:border-white/[0.06]">
                <th className="pb-3 font-sans text-[9px] uppercase text-ink/40 dark:text-parchment/40 tracking-wider">{t('admin.tableFeature' as any)}</th>
                <th className="pb-3 font-sans text-[9px] uppercase text-ink/40 dark:text-parchment/40 tracking-wider text-right">{t('admin.tableCalls' as any)}</th>
                <th className="pb-3 font-sans text-[9px] uppercase text-ink/40 dark:text-parchment/40 tracking-wider text-right">{t('admin.tableTokensIn' as any)}</th>
                <th className="pb-3 font-sans text-[9px] uppercase text-ink/40 dark:text-parchment/40 tracking-wider text-right">{t('admin.tableTokensOut' as any)}</th>
                <th className="pb-3 font-sans text-[9px] uppercase text-ink/40 dark:text-parchment/40 tracking-wider text-right">{t('admin.tableCost' as any)}</th>
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
                  <td className="py-3 text-right text-ink/60 dark:text-parchment/60">{row._sum?.tokensIn?.toLocaleString() ?? '0'}</td>
                  <td className="py-3 text-right text-ink/60 dark:text-parchment/60">{row._sum?.tokensOut?.toLocaleString() ?? '0'}</td>
                  <td className="py-3 text-right font-medium text-gold">${row._sum?.cost?.toFixed(4) ?? '0.0000'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </PremiumCard>
    </div>
  );
}
