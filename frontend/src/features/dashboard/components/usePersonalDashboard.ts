import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { PersonalDashboardData } from '@shared/types/api';

type Period = 'today' | 'tomorrow' | 'week' | 'month';

export function usePersonalDashboard() {
  const [period, setPeriod] = useState<Period>('today');
  const [data, setData] = useState<PersonalDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (p: Period) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<PersonalDashboardData>(`/api/astrology/personal-dashboard?period=${p}`);
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  const changePeriod = useCallback((p: Period) => {
    setPeriod(p);
  }, []);

  return { data, isLoading, error, period, changePeriod };
}
