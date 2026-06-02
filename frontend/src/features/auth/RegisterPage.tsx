import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { PremiumButton } from '@/components/PremiumButton';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/store';
import { useT } from '@/lib/i18n/useT';
import { fetchGoogleClientId } from '@/lib/google';
import toast from 'react-hot-toast';

function calcStrength(password: string, t: any): { score: number; label: string; color: string; width: string } {
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
  const { register, loginWithGoogle, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useT();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');

  useEffect(() => { fetchGoogleClientId().then(setGoogleClientId); }, []);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const pw = calcStrength(password, t);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) { setError(t('auth.allFieldsRequired')); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-bg-primary dark:bg-dark-bg-primary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <Sparkles className="w-6 h-6 text-accent" />
          <span className="font-sans text-2xl font-semibold bg-gradient-to-r from-accent to-amber-400 bg-clip-text text-transparent">Soma & Surya</span>
        </Link>

        <PremiumCard glass>
          <h1 className="font-sans text-xl font-bold tracking-tight mb-1">{t('auth.createAccount')}</h1>
          <p className="text-sm text-text-secondary mb-5">{t('auth.freeAccess')}</p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input id="name" label={t('auth.name')} type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder={t('auth.namePlaceholder')} icon={<User className="w-4 h-4" />} />
            <Input id="email" label={t('auth.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={t('auth.emailPlaceholder')} icon={<Mail className="w-4 h-4" />} />
            <div>
              <Input id="password" label={t('auth.password')} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder={t('auth.passwordPlaceholder')} icon={<Lock className="w-4 h-4" />} trailingIcon={password ? (showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />) : undefined} onTrailingIconClick={() => setShowPassword(!showPassword)} />
              {password && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-border-primary dark:bg-dark-border-primary rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pw.color} ${pw.width}`} />
                  </div>
                  <span className="text-[10px] font-medium text-text-tertiary">{pw.label}</span>
                </div>
              )}
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-500/10 rounded-lg p-2.5">{error}</p>
            )}

            <PremiumButton type="submit" loading={loading} icon={<ArrowRight className="w-4 h-4" />} className="w-full">
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
                    } catch { toast.error(t('auth.googleSignUpFailed')); }
                  }
                }}
                onError={() => toast.error(t('auth.googleSignUpFailed'))}
                size="large"
                shape="pill"
                text="signup_with"
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
