import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PersonalDashboardData } from '@shared/types/api';

type Period = 'today' | 'tomorrow' | 'week' | 'month';

export function usePersonalDashboard() {
  const [period, setPeriod] = useState<Period>('today');

  const { data, isLoading, error } = useQuery({
    queryKey: ['personal-dashboard', period],
    queryFn: () =>
      api.get<PersonalDashboardData>(`/api/astrology/personal-dashboard?period=${period}`)
        .then(res => res.data),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const changePeriod = useCallback((p: Period) => {
    setPeriod(p);
  }, []);

  return {
    data: data ?? null,
    isLoading,
    error: error instanceof Error ? error.message : null,
    period,
    changePeriod,
  };
}
