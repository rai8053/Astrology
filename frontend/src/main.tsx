import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import posthog from 'posthog-js';
import App from './app/App';
import { ScrollProgress } from './components/ScrollProgress';
import { useI18nStore } from './lib/i18n/store';
import { initTheme, useThemeStore } from './hooks/useTheme';
import './styles/globals.css';

initTheme();

const { language } = useI18nStore.getState();
const dir = ['ar', 'ur', 'he', 'fa'].includes(language) ? 'rtl' : 'ltr';
document.documentElement.setAttribute('lang', language);
document.documentElement.setAttribute('dir', dir);

if (import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
    person_profiles: 'identified_only',
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.opt_out_capturing();
    },
  });
}

function ThemeObserver() {
  const setTheme = useThemeStore((s) => s.setTheme);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const { theme } = useThemeStore.getState();
      if (theme === 'system') setTheme('system');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [setTheme]);
  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeObserver />
        <ScrollProgress />
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'font-sans text-sm',
            duration: 4000,
            style: { background: '#1a0b3a', color: '#fdfbf7', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
