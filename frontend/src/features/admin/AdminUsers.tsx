import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

export function AdminUsers() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get<UserRow[]>('/api/admin/users'),
  });

  if (isLoading) return <div className="py-20 text-center text-ink/50">Loading...</div>;

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 dark:border-white/10">
              <th className="pb-3 font-sans text-[10px] uppercase tracking-wider text-ink/50">Name</th>
              <th className="pb-3 font-sans text-[10px] uppercase tracking-wider text-ink/50">Email</th>
              <th className="pb-3 font-sans text-[10px] uppercase tracking-wider text-ink/50">Role</th>
              <th className="pb-3 font-sans text-[10px] uppercase tracking-wider text-ink/50">Verified</th>
              <th className="pb-3 font-sans text-[10px] uppercase tracking-wider text-ink/50">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5 dark:divide-white/5">
            {data?.data?.map((user) => (
              <tr key={user.id} className="hover:bg-ink/5 dark:hover:bg-white/5">
                <td className="py-3 font-medium">{user.name}</td>
                <td className="py-3 text-ink/70">{user.email}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
                      ? 'bg-gold/20 text-gold'
                      : user.role === 'PREMIUM'
                      ? 'bg-green-500/20 text-green-600'
                      : 'bg-ink/10 text-ink/60'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3">{user.emailVerified ? '✓' : '—'}</td>
                <td className="py-3 text-ink/60 text-xs">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
