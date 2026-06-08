import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import posthog from 'posthog-js';
import App from './app/App';
import { ScrollProgress } from './components/ScrollProgress';
import './styles/globals.css';

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
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const stored = localStorage.getItem('theme') as string | null;
      if (stored === 'system' || !stored) {
        document.documentElement.classList.toggle('dark', mq.matches);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
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
