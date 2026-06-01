import { useState, FormEvent, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { PremiumButton } from '@/components/PremiumButton';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/store';
import { useT } from '@/lib/i18n/useT';
import { fetchGoogleClientId } from '@/lib/google';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const { login, loginWithGoogle, isAuthenticated } = useAuthStore();
  const { t } = useT();
  const navigate = useNavigate();

  useEffect(() => { fetchGoogleClientId().then(setGoogleClientId); }, []);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || t('auth.loginFailed'));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-parchment to-amber-50 dark:from-cosmic dark:to-cosmic-deeper p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]" style={{
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(212,175,55,0.5) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(212,175,55,0.3) 0%, transparent 40%)',
      }} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <Sparkles className="w-6 h-6 text-gold" />
          <span className="font-serif text-2xl font-semibold bg-gradient-to-r from-gold to-amber-400 bg-clip-text text-transparent">Soma & Surya</span>
        </Link>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 rounded-2xl"
        >
          <h1 className="font-serif text-3xl font-bold mb-1">{t('auth.welcomeBack')}</h1>
          <p className="text-sm text-ink/50 dark:text-parchment/50 mb-7">{t('auth.signInSubtitle')}</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-xs text-red-500 flex items-center gap-1.5 bg-red-500/10 p-3 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
              </p>
            )}
            <Input id="email" label={t('auth.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={t('auth.emailPlaceholder')} />
            <Input id="password" label={t('auth.password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            <PremiumButton type="submit" loading={loading} icon={<ArrowRight className="w-4 h-4" />} className="w-full">
              {t('auth.signIn')}
            </PremiumButton>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink/10 dark:border-parchment/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-cosmic-deeper px-2 text-ink/40 dark:text-parchment/40">{t('auth.orContinueWith')}</span>
            </div>
          </div>
          <div className="flex justify-center">
            {googleClientId ? (
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (credentialResponse.credential) {
                    try {
                      await loginWithGoogle(credentialResponse.credential);
                      navigate('/dashboard');
                    } catch { /* handled by API client */ }
                  }
                }}
                onError={() => toast.error(t('auth.googleSignInFailed'))}
                size="large"
                shape="pill"
                text="signin_with"
              />
            ) : (
              <p className="text-xs text-ink/40 dark:text-parchment/40">{t('auth.googleUnavailable')}</p>
            )}
          </div>
          <p className="text-sm text-center mt-6 text-ink/40 dark:text-parchment/40">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-gold hover:underline font-medium">{t('auth.createOne')}</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
