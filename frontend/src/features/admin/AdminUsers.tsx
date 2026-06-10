import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { TableSkeleton } from '@/components/Skeleton';
import { formatDate } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface UserRow {
  id: string; email: string; name: string; role: string; emailVerified: boolean; createdAt: string;
}

export function AdminUsers() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get<UserRow[]>('/api/admin/users'),
  });

  if (isLoading) return <TableSkeleton />;

  return (
    <PremiumCard glass>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 dark:border-white/[0.06]">
              <th className="pb-3 font-sans text-[10px] uppercase tracking-wider text-ink/40 dark:text-parchment/40">{t('admin.tableName')}</th>
              <th className="pb-3 font-sans text-[10px] uppercase tracking-wider text-ink/40 dark:text-parchment/40">{t('admin.tableEmail')}</th>
              <th className="pb-3 font-sans text-[10px] uppercase tracking-wider text-ink/40 dark:text-parchment/40">{t('admin.tableRole')}</th>
              <th className="pb-3 font-sans text-[10px] uppercase tracking-wider text-ink/40 dark:text-parchment/40">{t('admin.tableVerified')}</th>
              <th className="pb-3 font-sans text-[10px] uppercase tracking-wider text-ink/40 dark:text-parchment/40">{t('admin.tableJoined')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5 dark:divide-white/[0.03]">
            {data?.data?.map((user, i) => (
              <motion.tr key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="hover:bg-ink/5 dark:hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-3 font-medium">{user.name}</td>
                <td className="py-3 text-ink/60 dark:text-parchment/60">{user.email}</td>
                <td className="py-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
                      ? 'bg-gold/15 text-gold'
                      : user.role === 'PREMIUM'
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-ink/10 dark:bg-white/[0.06] text-ink/50 dark:text-parchment/50'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3">{user.emailVerified ? <span className="text-green-400 font-bold">✓</span> : <span className="text-ink/30">—</span>}</td>
                <td className="py-3 text-ink/50 dark:text-parchment/50 text-xs">{user.createdAt ? formatDate(user.createdAt) : '—'}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </PremiumCard>
  );
}
