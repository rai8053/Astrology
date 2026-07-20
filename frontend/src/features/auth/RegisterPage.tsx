import { useState, useEffect, useMemo } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
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

interface RegisterForm { name: string; email: string; password: string; confirmPassword: string }

function createRegisterSchema(t: (k: string) => string) {
  return z.object({
    name: z.string().min(2, t('auth.nameMinLength')),
    email: z.string().email(t('auth.invalidEmail')),
    password: z.string().min(8, t('auth.passwordMinLength8')),
    confirmPassword: z.string(),
  }).refine((d) => d.password === d.confirmPassword, {
    message: t('auth.passwordsNoMatch'),
    path: ['confirmPassword'],
  });
}

function calcStrength(password: string, t: (k: string) => string): { score: number; label: string; color: string; width: string } {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 10;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[a-z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;
  if (password.length >= 16) score += 10;
  if (score >= 80) return { score, label: t('password.strong'), color: 'bg-emerald-500', width: 'w-3/4' };
  if (score >= 50) return { score, label: t('password.medium'), color: 'bg-amber-500', width: 'w-1/2' };
  return { score, label: t('password.weak'), color: 'bg-red-500', width: 'w-1/4' };
}

export function RegisterPage() {
  const { register: registerUser, loginWithGoogle, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const registerSchema = useMemo(() => createRegisterSchema(t), [t]);
  const { register, handleSubmit, watch, setError, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => { fetchGoogleClientId().then(setGoogleClientId); }, []);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const watchedPassword = watch('password');
  const pw = watchedPassword ? calcStrength(watchedPassword, t) : null;

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success(t('auth.registrationSuccess') || 'Account created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      setError('root', { message: err?.message || t('auth.registrationFailed') });
      toast.error(err?.message || t('auth.registrationFailed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-bg-primary dark:bg-dark-bg-primary">
      <SEO title={t('auth.createAccount')} description={t('auth.freeAccess')} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <Sparkles className="w-6 h-6 text-accent" />
          <span className="font-sans text-2xl font-semibold bg-gradient-to-r from-accent to-amber-400 bg-clip-text text-transparent">Soma & Surya</span>
        </Link>
        <PremiumCard glass>
          <h1 className="font-sans text-xl font-bold tracking-tight mb-1">{t('auth.createAccount')}</h1>
          <p className="text-sm text-text-secondary mb-5">{t('auth.freeAccess')}</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
            <div>
              <Input id="name" label={t('auth.name')} type="text" {...register('name')} required placeholder={t('auth.namePlaceholder')} icon={<User className="w-4 h-4" />} />
              {errors.name && <p className="text-[10px] text-red-400 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Input id="email" label={t('auth.email')} type="email" {...register('email')} required placeholder={t('auth.emailPlaceholder')} icon={<Mail className="w-4 h-4" />} />
              {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Input id="password" label={t('auth.password')} type={showPassword ? 'text' : 'password'} {...register('password')} required minLength={8} placeholder={t('auth.passwordPlaceholder')} icon={<Lock className="w-4 h-4" />} trailingIcon={watchedPassword ? (showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />) : undefined} onTrailingIconClick={() => setShowPassword(!showPassword)} />
              {errors.password && <p className="text-[10px] text-red-400 mt-1">{errors.password.message}</p>}
              {pw && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-border-primary dark:bg-dark-border-primary rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-[width] ${pw.color} ${pw.width}`} />
                  </div>
                  <span className="text-[10px] font-medium text-text-tertiary">{pw.label}</span>
                </div>
              )}
            </div>
            <div>
              <Input id="confirmPassword" label={t('auth.confirmPassword')} type={showPassword ? 'text' : 'password'} {...register('confirmPassword')} required placeholder={t('auth.confirmPassword')} icon={<Lock className="w-4 h-4" />} />
              {errors.confirmPassword && <p className="text-[10px] text-red-400 mt-1">{errors.confirmPassword.message}</p>}
            </div>
            {errors.root && (
              <p className="text-xs text-red-500 bg-red-500/10 rounded-lg p-2.5">{errors.root.message}</p>
            )}
            <PremiumButton type="submit" loading={isSubmitting} icon={<ArrowRight className="w-4 h-4" />} className="w-full">
              {t('auth.signUp')}
            </PremiumButton>
          </form>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-primary dark:border-dark-border-primary" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-bg-primary dark:bg-dark-bg-secondary px-2 text-text-tertiary">{t('auth.or')}</span>
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
                    } catch (e) {
                      console.error('Google sign-up failed', e);
                      toast.error(e instanceof Error ? e.message : t('auth.googleSignUpFailed'));
                    }
                  }
                }}
                onError={() => toast.error(t('auth.googleSignUpFailed'))}
                size="large" shape="pill" text="signup_with"
              />
            ) : (
              <p className="text-xs text-text-tertiary">{t('auth.googleUnavailable')}</p>
            )}
          </div>
          <p className="text-xs text-center mt-5 text-text-tertiary">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-accent hover:underline font-medium">{t('auth.signIn')}</Link>
          </p>
        </PremiumCard>
        <p className="text-[10px] text-center mt-4 text-text-tertiary">
          {t('auth.termsAgree')}{' '}
          <Link to="/terms" className="underline hover:text-accent">{t('auth.terms')}</Link> and{' '}
          <Link to="/privacy" className="underline hover:text-accent">{t('auth.privacy')}</Link>
        </p>
      </motion.div>
    </div>
  );
}
