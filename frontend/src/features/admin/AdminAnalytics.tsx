import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';

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
      <Card>
        <h3 className="font-serif text-lg font-semibold mb-4">AI Usage by Feature (30 days)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 dark:border-white/10">
                <th className="pb-3 font-sans text-[10px] uppercase text-ink/50">Feature</th>
                <th className="pb-3 font-sans text-[10px] uppercase text-ink/50 text-right">Calls</th>
                <th className="pb-3 font-sans text-[10px] uppercase text-ink/50 text-right">Tokens In</th>
                <th className="pb-3 font-sans text-[10px] uppercase text-ink/50 text-right">Tokens Out</th>
                <th className="pb-3 font-sans text-[10px] uppercase text-ink/50 text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5 dark:divide-white/5">
              {data?.data?.map((row, i) => (
                <tr key={i}>
                  <td className="py-3 font-medium capitalize">{row.feature}</td>
                  <td className="py-3 text-right">{row._count}</td>
                  <td className="py-3 text-right">{row._sum.tokensIn.toLocaleString()}</td>
                  <td className="py-3 text-right">{row._sum.tokensOut.toLocaleString()}</td>
                  <td className="py-3 text-right">${row._sum.cost.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
