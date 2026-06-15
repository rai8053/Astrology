import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  resolved: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = 'astronova-theme';
const OLD_KEY = 'theme';

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'dark') return 'dark';
  if (theme === 'light') return 'light';
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

function applyThemeToDOM(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
}

function migrateOldTheme() {
  if (typeof window === 'undefined') return;
  const old = localStorage.getItem(OLD_KEY);
  if (old && !localStorage.getItem(STORAGE_KEY)) {
    const theme: Theme = old === 'dark' || old === 'light' || old === 'system' ? old : 'system';
    const payload = JSON.stringify({ state: { theme }, version: 0 });
    localStorage.setItem(STORAGE_KEY, payload);
    localStorage.removeItem(OLD_KEY);
  }
}

migrateOldTheme();

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolved: resolveTheme('system'),
      setTheme: (theme: Theme) => {
        const resolved = resolveTheme(theme);
        applyThemeToDOM(resolved);
        set({ theme, resolved });
      },
    }),
    {
      name: STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = resolveTheme(state.theme);
          applyThemeToDOM(resolved);
          state.resolved = resolved;
        }
      },
    },
  ),
);

export function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const resolved = useThemeStore((s) => s.resolved);
  const setTheme = useThemeStore((s) => s.setTheme);

  const toggleTheme = () => {
    setTheme(resolved === 'dark' ? 'light' : 'dark');
  };

  return { theme, resolved, setTheme, toggleTheme };
}

export function initTheme() {
  const state = useThemeStore.getState();
  const resolved = resolveTheme(state.theme);
  applyThemeToDOM(resolved);
  if (state.resolved !== resolved) {
    useThemeStore.setState({ resolved });
  }
}
