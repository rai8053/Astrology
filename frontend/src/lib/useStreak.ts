import { useState, useEffect } from 'react';

const STREAK_KEY = 'soma_streak';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string;
}

function getStreakData(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { currentStreak: 0, longestStreak: 0, lastVisitDate: '' };
}

function saveStreakData(data: StreakData) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

function getDateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastVisitDate: '' });

  useEffect(() => {
    const data = getStreakData();
    const today = getDateKey(new Date());
    const yesterday = getDateKey(new Date(Date.now() - 86400000));

    if (data.lastVisitDate === today) {
      setStreak(data);
      return;
    }

    const newData = { ...data };
    if (data.lastVisitDate === yesterday) {
      newData.currentStreak += 1;
    } else if (data.lastVisitDate && data.lastVisitDate !== today) {
      newData.currentStreak = 1;
    } else if (!data.lastVisitDate) {
      newData.currentStreak = 1;
    }
    newData.lastVisitDate = today;
    if (newData.currentStreak > newData.longestStreak) {
      newData.longestStreak = newData.currentStreak;
    }
    saveStreakData(newData);
    setStreak(newData);
  }, []);

  return streak;
}
