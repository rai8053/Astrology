import { Component, type ErrorInfo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <TWrapper>
          {(t: (key: string) => string) => (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertTriangle className="w-14 h-14 text-amber-400 mb-4" />
              </motion.div>
              <h2 className="text-2xl font-serif font-bold mb-2">{t('common.somethingWentWrong')}</h2>
              <p className="text-sm text-ink/50 dark:text-parchment/50 mb-6 max-w-md">
                {this.state.error?.message || t('common.unexpectedError')}
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold to-amber-400 text-cosmic text-xs font-sans font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-gold/20 hover:shadow-gold/30 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> {t('common.reloadPage')}
              </motion.button>
            </motion.div>
          )}
        </TWrapper>
      );
    }

    return this.props.children;
  }
}

function TWrapper({ children }: { children: (t: (...args: any[]) => string) => ReactNode }) {
  const { t } = useT();
  return <>{children(t as any)}</>;
}
