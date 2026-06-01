import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { User, Sun, Moon, Globe, Save, ExternalLink, CreditCard, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Input } from '@/components/ui/Input';
import { BirthPlaceInput } from '@/components/ui/BirthPlaceInput';
import { PremiumButton } from '@/components/PremiumButton';
import { useAuthStore, useThemeStore } from '@/lib/store';
import { useI18nStore } from '@/lib/i18n/store';
import type { Language } from '@/lib/i18n/translations';
import { useT } from '@/lib/i18n/useT';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  birthDate?: string | null;
  birthTime?: string | null;
  birthPlace?: string | null;
  birthState?: string | null;
  birthCountry?: string | null;
}

interface Subscription {
  plan: string;
  status: string;
  trialEnd?: string | null;
  currentPeriodEnd?: string;
}

function showPremiumToast(type: 'success' | 'error', title: string, message: string) {
  const Icon = type === 'success' ? CheckCircle2 : XCircle;
  const color = type === 'success' ? 'text-emerald-400' : 'text-red-400';
  toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.95 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-xl shadow-2xl border ${
          type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/30'
            : 'bg-red-950/90 border-red-500/30'
        } backdrop-blur-xl max-w-sm`}
        style={{ boxShadow: type === 'success' ? '0 0 40px rgba(52,211,153,0.15)' : '0 0 40px rgba(248,113,113,0.15)' }}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'
        }`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-white/60 mt-0.5">{message}</p>
        </div>
        <button onClick={() => toast.dismiss(t.id)} className="text-white/30 hover:text-white/60 transition-colors">
          <XCircle className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    ),
    { duration: 3000, position: 'top-right' },
  );
}

export function SettingsPage() {
  const { t } = useT();
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { language, setLanguage } = useI18nStore();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthState, setBirthState] = useState('');
  const [birthCountry, setBirthCountry] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);

  const { data: profileData } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => api.get<UserProfile>('/api/auth/me'),
  });

  const { data: subData } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.get<Subscription>('/api/payments/subscription'),
  });

  const languageMutation = useMutation({
    mutationFn: (lang: Language) => api.patch('/api/user/profile', { language: lang }),
  });

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    languageMutation.mutate(lang);
  };

  const billingPortalMutation = useMutation({
    mutationFn: () => api.post<{ url: string }>('/api/payments/create-portal'),
    onSuccess: (data) => {
      if (data.data?.url?.startsWith('https://')) window.location.href = data.data.url;
      else toast.error(t('settings.invalidPortal'));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t('settings.billingUnavailable'));
    },
  });

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const p = profileData?.data;
    if (p && !initializedRef.current) {
      initializedRef.current = true;
      setName(p.name ?? '');
      setBirthDate(p.birthDate ?? '');
      setBirthTime(p.birthTime ?? '');
      setBirthPlace(p.birthPlace ?? '');
      setBirthState(p.birthState ?? '');
      setBirthCountry(p.birthCountry ?? '');
    }
  }, [profileData]);

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; birthDate: string; birthTime: string; birthPlace: string; birthState?: string; birthCountry?: string }) =>
      api.patch<{ message: string } & UserProfile>('/api/user/profile', data),
    onSuccess: (res) => {
      setSaveState('success');
      setUser({ ...user!, name: res.data?.name ?? name });
      showPremiumToast('success', t('settings.profileUpdated'), t('settings.profileUpdatedMsg'));
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSaveState('idle'), 2000);
    },
    onError: () => {
      setSaveState('error');
      showPremiumToast('error', t('settings.saveFailed'), t('settings.saveFailedMsg'));
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSaveState('idle'), 3000);
    },
  });

  const handleSave = () => {
    if (saveState === 'loading') return;
    setSaveState('loading');
    updateMutation.mutate({ name, birthDate, birthTime, birthPlace, birthState, birthCountry });
  };

  const hasChanges =
    name !== (profileData?.data?.name ?? '') ||
    birthDate !== (profileData?.data?.birthDate ?? '') ||
    birthTime !== (profileData?.data?.birthTime ?? '') ||
    birthPlace !== (profileData?.data?.birthPlace ?? '') ||
    birthState !== (profileData?.data?.birthState ?? '') ||
    birthCountry !== (profileData?.data?.birthCountry ?? '');

  const getButtonStyle = () => {
    switch (saveState) {
      case 'loading':
        return {
          label: t('settings.saving'),
          icon: <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>,
          disabled: true,
          variant: 'primary' as const,
        };
      case 'success':
        return {
          label: t('settings.savedSuccess'),
          icon: <CheckCircle2 className="w-4 h-4" />,
          disabled: true,
          variant: 'primary' as const,
        };
      case 'error':
        return {
          label: t('settings.tryAgain'),
          icon: <XCircle className="w-4 h-4" />,
          disabled: false,
          variant: 'outline' as const,
        };
      default:
        return {
          label: t('settings.saveChanges'),
          icon: <Save className="w-3.5 h-3.5" />,
          disabled: false,
          variant: 'primary' as const,
        };
    }
  };

  const btn = getButtonStyle();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-serif font-bold">{t('settings.title')}</h1>
        <p className="text-ink/50 dark:text-parchment/50 mt-1">{t('settings.subtitle')}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <PremiumCard glass>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                <User className="w-4 h-4 text-gold" />
              </div>
              <h3 className="font-serif text-lg font-semibold">{t('settings.profile')}</h3>
            </div>
            <div className="space-y-4">
              <Input label={t('settings.nameLabel')} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('settings.namePlaceholder')} />
              <Input label={t('auth.email')} value={user?.email ?? ''} disabled />
              <Input label={t('onboarding.dob')} type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Input label={t('onboarding.birthTime')} type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} />
                <BirthPlaceInput label={t('onboarding.birthPlace')} value={birthPlace} onChange={(v) => setBirthPlace(v)} placeholder={t('settings.placeExample')} state={birthState} onStateChange={setBirthState} country={birthCountry} onCountryChange={setBirthCountry} />
              </div>
              <PremiumButton
                onClick={handleSave}
                disabled={btn.disabled}
                variant={btn.variant}
                icon={btn.icon}
                className={`w-full transition-all duration-300 ${
                  saveState === 'success'
                    ? '!bg-emerald-500/20 !text-emerald-400 !border-emerald-500/30'
                    : saveState === 'error'
                    ? '!bg-red-500/10 !text-red-400 !border-red-500/30'
                    : ''
                }`}
              >
                {btn.label}
              </PremiumButton>
              <AnimatePresence>
                {hasChanges && saveState === 'idle' && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-[10px] text-ink/40 dark:text-parchment/40 text-center font-sans"
                  >
                    {t('settings.unsavedChanges')}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </PremiumCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          <PremiumCard glass>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                <Sun className="w-4 h-4 text-gold" />
              </div>
              <h3 className="font-serif text-lg font-semibold">{t('settings.theme')}</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'dark', 'system'] as const).map((themeOption) => (
                <motion.button
                  key={themeOption}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setTheme(themeOption)}
                  className={`p-4 rounded-xl text-center transition-all duration-300 ${
                    theme === themeOption
                      ? 'gold-border bg-gold/10 cosmic-glow'
                      : 'border border-ink/10 dark:border-white/10 hover:border-gold/30 bg-white dark:bg-cosmic-light/30'
                  }`}
                >
                  {themeOption === 'light' ? <Sun className="w-5 h-5 mx-auto mb-1.5 text-gold" /> : themeOption === 'dark' ? <Moon className="w-5 h-5 mx-auto mb-1.5 text-gold" /> : <Globe className="w-5 h-5 mx-auto mb-1.5 text-gold" />}
                  <span className="text-xs capitalize font-medium">{themeOption === 'light' ? t('settings.themeLight') : themeOption === 'dark' ? t('settings.themeDark') : t('settings.themeSystem')}</span>
                </motion.button>
              ))}
            </div>
          </PremiumCard>

          <PremiumCard glass>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-gold" />
              </div>
              <h3 className="font-serif text-lg font-semibold">{t('settings.language')}</h3>
            </div>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="w-full bg-transparent border border-ink/20 dark:border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold transition-colors appearance-none cursor-pointer"
              >
                {[
                  { code: 'en' as Language, label: '🇬🇧 English' },
                  { code: 'hi' as Language, label: '🇮🇳 हिन्दी' },
                  { code: 'bn' as Language, label: '🇧🇩 বাংলা' },
                  { code: 'es' as Language, label: '🇪🇸 Español' },
                  { code: 'pt' as Language, label: '🇵🇹 Português' },
                  { code: 'fr' as Language, label: '🇫🇷 Français' },
                  { code: 'de' as Language, label: '🇩🇪 Deutsch' },
                  { code: 'ar' as Language, label: '🇸🇦 العربية' },
                  { code: 'ja' as Language, label: '🇯🇵 日本語' },
                  { code: 'zh' as Language, label: '🇨🇳 中文' },
                ].map((opt) => (
                  <option key={opt.code} value={opt.code}>{opt.label}</option>
                ))}
              </select>
              <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40 dark:text-parchment/40 pointer-events-none" />
            </div>
          </PremiumCard>

          <PremiumCard glass>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-gold" />
              </div>
              <h3 className="font-serif text-lg font-semibold">{t('settings.subscription')}</h3>
            </div>
            <p className="text-sm text-ink/50 dark:text-parchment/50">
              {t('settings.onPlan', { plan: subData?.data?.plan || 'Free' })}
            </p>
            {subData?.data?.trialEnd && new Date(subData.data.trialEnd) > new Date() && (
              <p className="text-xs text-ink/40 dark:text-parchment/40 mt-1">
                {t('settings.trialEnds', { date: new Date(subData.data.trialEnd).toLocaleDateString() })}
              </p>
            )}
            {subData?.data?.plan === 'FREE' ? (
              <p className="text-xs text-ink/40 dark:text-parchment/40 mt-1">{t('settings.upgradePrompt')}</p>
            ) : (
              <PremiumButton
                variant="ghost"
                size="sm"
                className="w-full mt-3"
                onClick={() => billingPortalMutation.mutate()}
                loading={billingPortalMutation.isPending}
                icon={<ExternalLink className="w-3 h-3" />}
              >
                {t('billing.manage')}
              </PremiumButton>
            )}
          </PremiumCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
