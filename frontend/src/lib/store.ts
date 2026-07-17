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
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const res = await api.post<{ user: User; accessToken: string }>('/api/auth/login', { email, password });
    const { user } = res.data;
    if (user.name) localStorage.setItem('googleName', user.name);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  register: async (name, email, password, options = {}) => {
    const res = await api.post<{ user: User; accessToken: string }>('/api/auth/register', { name, email, password, ...options });
    const { user } = res.data;
    if (user.name) localStorage.setItem('googleName', user.name);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  loginWithGoogle: async (credential: string) => {
    const res = await api.post<{ user: User }>('/api/auth/google', { credential });
    const { user } = res.data;
    if (user.name) localStorage.setItem('googleName', user.name);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try { await api.post('/api/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('googleName');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const res = await api.get<User>('/api/auth/me');
      const user = res.data;
      if (user.name) {
        localStorage.setItem('googleName', user.name);
      } else {
        const googleName = localStorage.getItem('googleName');
        if (googleName) user.name = googleName;
      }
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
}));

