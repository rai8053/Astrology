import { create } from 'zustand';
import { api } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  plan?: string;
  avatar?: string;
  gender?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  country?: string;
  language?: string;
  timezone?: string;
  astrologyProfile?: {
    rashi?: string;
    nakshatra?: string;
    nakshatraLord?: string;
    lagna?: string;
    rashiLord?: string;
    element?: string;
    doshaDominance?: string;
  };
}

interface RegisterOptions {
  gender?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  country?: string;
  language?: string;
  timezone?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, options?: RegisterOptions) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const res = await api.post<{ user: User; accessToken: string }>('/api/auth/login', { email, password });
    const { user, accessToken } = res.data;
    localStorage.setItem('accessToken', accessToken);
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
  },

  register: async (name, email, password, options = {}) => {
    const res = await api.post<{ user: User; accessToken: string }>('/api/auth/register', { name, email, password, ...options });
    const { user, accessToken } = res.data;
    localStorage.setItem('accessToken', accessToken);
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
  },

  loginWithGoogle: async (credential: string) => {
    const res = await api.post<{ user: User; accessToken: string }>('/api/auth/google', { credential });
    const { user, accessToken } = res.data;
    localStorage.setItem('accessToken', accessToken);
    try {
      const payload = JSON.parse(atob(credential.split('.')[1]!));
      if (payload.name) localStorage.setItem('googleName', payload.name);
    } catch { /* ignore */ }
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try { await api.post('/api/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('googleName');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { set({ isLoading: false }); return; }
    try {
      const res = await api.get<User>('/api/auth/me');
      const user = res.data;
      if (!user.name) {
        const googleName = localStorage.getItem('googleName');
        if (googleName) user.name = googleName;
      }
      set({ user, accessToken: token, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('accessToken');
      set({ isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
}));

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolved: 'light' | 'dark';
}

function getResolved(theme: Theme): 'light' | 'dark' {
  if (theme === 'dark') return 'dark';
  if (theme === 'light') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

const storedTheme = (localStorage.getItem('theme') as Theme) || 'system';
applyTheme(getResolved(storedTheme));

export const useThemeStore = create<ThemeState>((set) => ({
  theme: storedTheme,
  resolved: getResolved(storedTheme),
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    const resolved = getResolved(theme);
    applyTheme(resolved);
    set({ theme, resolved });
  },
}));
