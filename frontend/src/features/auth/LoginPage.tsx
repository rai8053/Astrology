import { useEffect, useState, useMemo } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, AlertCircle, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PremiumButton } from '@/components/PremiumButton';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { fetchGoogleClientId } from '@/lib/google';
import toast from 'react-hot-toast';
import { SEO } from '@/components/SEO';

interface LoginForm { email: string; password: string }

function createLoginSchema(t: (k: string) => string) {
  return z.object({
    email: z.string().email(t('auth.invalidEmail')),
    password: z.string().min(6, t('auth.passwordMinLength')),
  });
}

export function LoginPage() {
  const [googleClientId, setGoogleClientId] = useState('');
  const { login, loginWithGoogle, isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loginSchema = useMemo(() => createLoginSchema(t), [t]);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => { fetchGoogleClientId().then(setGoogleClientId); }, []);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError('root', { message: err?.message || t('auth.loginFailed') });
      toast.error(err?.message || t('auth.loginFailed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary dark:bg-dark-bg-primary p-4 relative overflow-hidden">
      <SEO title="Sign In" description={t('auth.signInSubtitle')} />
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]" style={{
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(212,175,55,0.5) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(212,175,55,0.3) 0%, transparent 40%)',
      }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <Sparkles className="w-6 h-6 text-accent" />
          <span className="font-sans text-2xl font-semibold bg-gradient-to-r from-accent to-amber-400 bg-clip-text text-transparent">Soma & Surya</span>
        </Link>
        <PremiumCard glass>
          <h1 className="font-sans text-3xl font-bold tracking-tight mb-1">{t('auth.welcomeBack')}</h1>
          <p className="text-sm text-text-secondary mb-7">{t('auth.signInSubtitle')}</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {errors.root && (
              <p className="text-xs text-red-500 flex items-center gap-1.5 bg-red-500/10 p-3 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.root.message}
              </p>
            )}
            <div>
              <Input id="email" label={t('auth.email')} type="email" {...register('email')} required placeholder={t('auth.emailPlaceholder')} icon={<Mail className="w-4 h-4" />} />
              {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Input id="password" label={t('auth.password')} type="password" {...register('password')} required placeholder="••••••••" icon={<Lock className="w-4 h-4" />} />
              {errors.password && <p className="text-[10px] text-red-400 mt-1">{errors.password.message}</p>}
            </div>
            <PremiumButton type="submit" loading={isSubmitting} icon={<ArrowRight className="w-4 h-4" />} className="w-full">
              {t('auth.signIn')}
            </PremiumButton>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-primary dark:border-dark-border-primary" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-bg-primary dark:bg-dark-bg-secondary px-2 text-text-tertiary">{t('auth.orContinueWith')}</span>
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
                    } catch { toast.error(t('auth.googleSignInFailed')); }
                  }
                }}
                onError={() => toast.error(t('auth.googleSignInFailed'))}
                size="large" shape="pill" text="signin_with"
              />
            ) : (
              <p className="text-xs text-text-tertiary">{t('auth.googleUnavailable')}</p>
            )}
          </div>
          <p className="text-sm text-center mt-6 text-text-tertiary">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-accent hover:underline font-medium">{t('auth.createOne')}</Link>
          </p>
        </PremiumCard>
      </motion.div>
    </div>
  );
}
