import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { useT } from '@/lib/i18n/useT';

export function AdminReportsPage() {
  const { t } = useT();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => api.get<{ id: string; type: string; createdAt: string; user: { name: string; email: string } }[]>('/api/admin/reports'),
  });

  return (
    <PremiumCard glass>
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-ink/5 dark:bg-white/[0.04]">
            <FileText className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="font-sans font-semibold">{t('admin.reports')}</h3>
            <p className="text-xs text-ink/40 dark:text-parchment/40">{t('admin.subtitle')}</p>
          </div>
        </div>
        {isLoading ? (
          <div className="text-sm text-ink/40 dark:text-parchment/40 py-8 text-center">{t('common.loading')}</div>
        ) : data?.data?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 dark:border-white/[0.06]">
                  <th className="pb-3 font-sans text-[10px] uppercase tracking-wider text-ink/40 dark:text-parchment/40">{t('admin.tableName')}</th>
                  <th className="pb-3 font-sans text-[10px] uppercase tracking-wider text-ink/40 dark:text-parchment/40">{t('admin.tableEmail')}</th>
                  <th className="pb-3 font-sans text-[10px] uppercase tracking-wider text-ink/40 dark:text-parchment/40">{t('admin.tableFeature')}</th>
                  <th className="pb-3 font-sans text-[10px] uppercase tracking-wider text-ink/40 dark:text-parchment/40">{t('admin.tableJoined')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5 dark:divide-white/[0.03]">
                {data.data.map((report, i) => (
                  <motion.tr key={report.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-ink/5 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 font-medium">{report.user.name}</td>
                    <td className="py-3 text-ink/60 dark:text-parchment/60">{report.user.email}</td>
                    <td className="py-3 capitalize">{report.type}</td>
                    <td className="py-3 text-ink/50 dark:text-parchment/50 text-xs">{new Date(report.createdAt).toLocaleDateString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-ink/40 dark:text-parchment/40 py-8 text-center">{t('common.noData')}</p>
        )}
      </div>
    </PremiumCard>
  );
}
