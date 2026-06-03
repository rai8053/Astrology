import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { PersonalDashboardData } from '@shared/types/api';

type Period = 'today' | 'tomorrow' | 'week' | 'month';

export function usePersonalDashboard(initialPeriod: Period = 'today') {
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [data, setData] = useState<PersonalDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    for (const p of ['today', 'tomorrow', 'week', 'month'] as Period[]) {
      localStorage.removeItem(`dashboard_${p}`);
    }
  }, []);

  const fetchData = useCallback(async (p: Period) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<PersonalDashboardData>(`/api/astrology/personal-dashboard?period=${p}`);
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
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
