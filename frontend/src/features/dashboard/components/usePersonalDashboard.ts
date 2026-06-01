import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
type Language = 'en' | 'hi' | 'bn' | 'es' | 'pt' | 'fr' | 'de' | 'ar' | 'ja' | 'zh';

import { translations } from '@/lib/i18n/translations';
import type { PersonalDashboardData } from '@shared/types/api';

function ts(key: string): string {
  let lang: Language = 'en';
  if (typeof window !== 'undefined') {
    try { const raw = localStorage.getItem('lang'); if (raw) lang = JSON.parse(raw) as Language; } catch { /* fall back */ }
  }
  return translations[lang]?.[key] || translations.en?.[key] || key;
}

type Period = 'today' | 'tomorrow' | 'week' | 'month';

interface CacheEntry {
  data: PersonalDashboardData;
  expiry: number;
}

function getExpiry(period: Period): number {
  const now = new Date();
  switch (period) {
    case 'today': {
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return end.getTime();
    }
    case 'tomorrow': {
      const end = new Date(now);
      end.setDate(end.getDate() + 1);
      end.setHours(23, 59, 59, 999);
      return end.getTime();
    }
    case 'week': {
      const end = new Date(now);
      end.setDate(end.getDate() + (7 - end.getDay()));
      end.setHours(23, 59, 59, 999);
      return end.getTime();
    }
    case 'month': {
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return end.getTime();
    }
  }
}

function getCached(period: Period): PersonalDashboardData | null {
  try {
    const raw = localStorage.getItem(`dashboard_${period}`);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() > entry.expiry) {
      localStorage.removeItem(`dashboard_${period}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache(period: Period, data: PersonalDashboardData): void {
  try {
    const entry: CacheEntry = { data, expiry: getExpiry(period) };
    localStorage.setItem(`dashboard_${period}`, JSON.stringify(entry));
  } catch {
  }
}

export function usePersonalDashboard(initialPeriod: Period = 'today') {
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [data, setData] = useState<PersonalDashboardData | null>(() => getCached(initialPeriod));
  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (p: Period) => {
    const cached = getCached(p);
    if (cached) {
      setData(cached);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<PersonalDashboardData>(`/api/astrology/personal-dashboard?period=${p}`);
      if (res.data) {
        setCache(p, res.data);
        setData(res.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : ts('errors.loadDashboard'));
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
