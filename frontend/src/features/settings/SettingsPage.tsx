import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User, Sun, Moon, Globe, Save, ExternalLink, CreditCard, CheckCircle2, XCircle, Trash2, AlertTriangle, DollarSign, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Input } from '@/components/ui/Input';
import { BirthPlaceInput } from '@/components/ui/BirthPlaceInput';
import { PremiumButton } from '@/components/PremiumButton';
import { useAuthStore } from '@/lib/store';
import { useThemeStore } from '@/hooks/useTheme';
import { useI18nStore } from '@/lib/i18n';
import { type Language } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { REGIONAL_PRICING, setManualCountryOverride, getDetectedCountry } from '@/lib/pricing';
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

const FLAGS: Record<string, string> = {
  en: '=��=��', hi: '=��=��', bn: '=��=��', es: '=��=��+', pt: '=��=��',
  fr: '=��=��+', de: '=��=��', ar: '=��+=��', ja: '=��=��', zh: '=��=��',
};
const LANG_NAMES: Record<string, string> = {
  en: 'English', hi: 'a�a�+a�a��a�a��', bn: 'a��a�+a��a�a�+', es: 'Espa+�ol', pt: 'Portugu+�s',
  fr: 'Fran+�ais', de: 'Deutsch', ar: '+�+�+�+�+�+�+�', ja: '��ѵ��F�P', zh: 'S+����',
};
const LANG_LIST = Object.entries(FLAGS).map(([code, flag]) => ({ code: code as Language, flag, label: LANG_NAMES[code] }));

const profileSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  birthDate: z.string().optional(),
  birthTime: z.string().optional(),
  birthPlace: z.string().optional(),
  birthState: z.string().optional(),
  birthCountry: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

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
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { language, setLanguage } = useI18nStore();
  const [langOpen, setLangOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const [saveFeedback, setSaveFeedback] = useState<'success' | 'error' | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { register, handleSubmit, formState: { isDirty, isSubmitting, errors }, watch, setValue, reset, getValues } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      birthDate: '',
      birthTime: '',
      birthPlace: '',
      birthState: '',
      birthCountry: '',
    },
  });

  const { data: profileData } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => api.get<UserProfile>('/api/auth/me'),
  });

  const { data: subData } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.get<Subscription>('/api/payments/subscription'),
  });

  const hasBirthData = !!(profileData?.data?.birthDate && profileData?.data?.birthTime && profileData?.data?.birthPlace);

  useEffect(() => {
    const p = profileData?.data;
    if (p) {
      reset({
        name: p.name ?? '',
        email: p.email ?? '',
        birthDate: p.birthDate ?? '',
        birthTime: p.birthTime ?? '',
        birthPlace: p.birthPlace ?? '',
        birthState: p.birthState ?? '',
        birthCountry: p.birthCountry ?? '',
      });
    }
  }, [profileData, reset]);

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
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setCurrencyOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: { name?: string; email?: string; birthDate: string; birthTime: string; birthPlace: string; birthState?: string; birthCountry?: string }) =>
      api.patch<{ message: string } & UserProfile>('/api/user/profile', data),
    onSuccess: (res) => {
      setSaveFeedback('success');
      const saved = res.data;
      if (saved) {
        setUser({ ...user!, name: saved.name ?? user!.name, birthDate: saved.birthDate ?? user!.birthDate, birthTime: saved.birthTime ?? user!.birthTime, birthPlace: saved.birthPlace ?? user!.birthPlace });
        if (saved.name) localStorage.setItem('googleName', saved.name);
      }
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      showPremiumToast('success', t('settings.profileUpdated'), t('settings.profileUpdatedMsg'));
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => setSaveFeedback(null), 2000);
    },
    onError: (err) => {
      setSaveFeedback('error');
      showPremiumToast('error', t('settings.saveFailed'), err instanceof Error ? err.message : t('settings.saveFailedMsg'));
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => setSaveFeedback(null), 3000);
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    const payload = {
      name: data.name,
      email: data.email,
      birthDate: data.birthDate ?? getValues('birthDate') ?? '',
      birthTime: data.birthTime ?? getValues('birthTime') ?? '',
      birthPlace: data.birthPlace ?? getValues('birthPlace') ?? '',
      birthState: data.birthState ?? getValues('birthState') ?? '',
      birthCountry: data.birthCountry ?? getValues('birthCountry') ?? '',
    };
    updateMutation.mutate(payload);
  };

  const [detectedCountry, setDetectedCountry] = useState('US');

  const currencyMutation = useMutation({
    mutationFn: (currencyCode: string) => api.patch('/api/user/profile', { currency: REGIONAL_PRICING[currencyCode as keyof typeof REGIONAL_PRICING]?.currency.code || 'USD', country: detectedCountry }),
  });

  const handleCurrencyChange = (countryCode: string) => {
    setDetectedCountry(countryCode);
    setManualCountryOverride(countryCode);
    const currencyCode = REGIONAL_PRICING[countryCode as keyof typeof REGIONAL_PRICING]?.currency.code || 'USD';
    currencyMutation.mutate(currencyCode);
    toast.success(t('settings.currencyUpdated'));
  };

  useEffect(() => {
    getDetectedCountry().then(setDetectedCountry);
  }, []);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const resetMutation = useMutation({
    mutationFn: () => api.post('/api/user/reset-profile'),
    onSuccess: () => {
      setShowResetConfirm(false);
      reset({
        name: '',
        email: '',
        birthDate: '',
        birthTime: '',
        birthPlace: '',
        birthState: '',
        birthCountry: '',
      });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      showPremiumToast('success', t('settings.resetDataSuccess'), '');
    },
    onError: () => {
      showPremiumToast('error', t('settings.resetDataError'), '');
    },
  });

  const loading = isSubmitting || updateMutation.isPending;
  const btnLabel = loading ? t('settings.saving') : saveFeedback === 'success' ? t('settings.savedSuccess') : saveFeedback === 'error' ? t('settings.tryAgain') : t('settings.saveChanges');
  const btnIcon = loading ? (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ) : saveFeedback === 'success' ? (
    <CheckCircle2 className="w-4 h-4" />
  ) : saveFeedback === 'error' ? (
    <XCircle className="w-4 h-4" />
  ) : (
    <Save className="w-3.5 h-3.5" />
  );
  const btnDisabled = loading || saveFeedback === 'success';
  const btnVariant = saveFeedback === 'error' ? 'outline' as const : 'primary' as const;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-ink/50 dark:text-parchment/50 mt-1">{t('settings.subtitle')}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <PremiumCard glass>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                <User className="w-4 h-4 text-gold" />
              </div>
              <h3 className="font-sans text-lg font-semibold">{t('settings.profile')}</h3>
            </div>
            <div className="space-y-4">
              <Input label={t('settings.nameLabel')} {...register('name')} placeholder={t('settings.namePlaceholder')} error={errors.name?.message} />
              <Input label={t('auth.email')} {...register('email')} placeholder={t('auth.emailPlaceholder')} error={errors.email?.message} />
              {hasBirthData ? (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-text-secondary dark:text-dark-text-secondary">{t('onboarding.dob')}</label>
                    <p className="input-glass py-2 px-3 text-sm text-text-primary dark:text-dark-text-primary">{getValues('birthDate') || 'G��'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-text-secondary dark:text-dark-text-secondary">{t('onboarding.birthTime')}</label>
                      <p className="input-glass py-2 px-3 text-sm text-text-primary dark:text-dark-text-primary">{getValues('birthTime') || 'G��'}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-text-secondary dark:text-dark-text-secondary">{t('onboarding.birthPlace')}</label>
                      <p className="input-glass py-2 px-3 text-sm text-text-primary dark:text-dark-text-primary">{getValues('birthPlace') || 'G��'}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Input label={t('onboarding.dob')} type="date" {...register('birthDate')} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label={t('onboarding.birthTime')} type="time" {...register('birthTime')} />
                    <BirthPlaceInput label={t('onboarding.birthPlace')} value={watch('birthPlace') || ''} onChange={(v) => setValue('birthPlace', v, { shouldDirty: true })} placeholder={t('settings.placeExample')} state={watch('birthState') || ''} onStateChange={(v) => setValue('birthState', v, { shouldDirty: true })} country={watch('birthCountry') || ''} onCountryChange={(v) => setValue('birthCountry', v, { shouldDirty: true })} />
                  </div>
                </>
              )}
              <PremiumButton
                onClick={handleSubmit(onSubmit)}
                disabled={btnDisabled}
                variant={btnVariant}
                icon={btnIcon}
                className={`w-full transition-all duration-300 ${
                  saveFeedback === 'success'
                    ? '!bg-emerald-500/20 !text-emerald-400 !border-emerald-500/30'
                    : saveFeedback === 'error'
                    ? '!bg-red-500/10 !text-red-400 !border-red-500/30'
                    : ''
                }`}
              >
                {btnLabel}
              </PremiumButton>
              <AnimatePresence>
                {isDirty && saveFeedback === null && (
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

              <div className="pt-4 mt-4 border-t border-border-primary dark:border-dark-border-primary">
                <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink/30 dark:text-parchment/30 mb-2">{t('settings.resetData')}</p>
                <p className="text-xs text-ink/40 dark:text-parchment/40 mb-3">{t('settings.resetDataDesc')}</p>
                <PremiumButton
                  variant="outline"
                  size="sm"
                  className="!border-red-400/30 !text-red-400 hover:!bg-red-500/10 w-full"
                  onClick={() => setShowResetConfirm(true)}
                  icon={<Trash2 className="w-3 h-3" />}
                >
                  {t('settings.resetData')}
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>

          <AnimatePresence>
            {showResetConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={() => setShowResetConfirm(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl border border-border-primary dark:border-dark-border-primary p-6 max-w-sm w-full"
                >
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-lg font-sans font-semibold text-center text-text-primary dark:text-dark-text-primary mb-2">{t('settings.resetData')}</h3>
                  <p className="text-sm text-text-secondary text-center mb-6">{t('settings.resetDataConfirm')}</p>
                  <div className="flex gap-3">
                    <PremiumButton
                      variant="ghost"
                      className="flex-1"
                      onClick={() => setShowResetConfirm(false)}
                    >
                      {t('common.cancel')}
                    </PremiumButton>
                    <PremiumButton
                      variant="primary"
                      className="flex-1 !bg-red-500 !text-white hover:!bg-red-600"
                      onClick={() => resetMutation.mutate()}
                      loading={resetMutation.isPending}
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      {t('common.confirm')}
                    </PremiumButton>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          <PremiumCard glass>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                <Sun className="w-4 h-4 text-gold" />
              </div>
              <h3 className="font-sans text-lg font-semibold">{t('settings.theme')}</h3>
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
              <h3 className="font-sans text-lg font-semibold">{t('settings.language')}</h3>
            </div>
            <div ref={langRef} className="relative">
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="w-full flex items-center gap-2 px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground hover:bg-muted transition-colors"
              >
                <span>{FLAGS[language]}</span>
                <span className="flex-1 text-left">{LANG_NAMES[language]}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {LANG_LIST.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => { handleLanguageChange(l.code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${
                        language === l.code
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </PremiumCard>

          <PremiumCard glass>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-gold" />
              </div>
              <h3 className="font-sans text-lg font-semibold">{t('settings.currency')}</h3>
            </div>
            <p className="text-xs text-ink/40 dark:text-parchment/40 mb-3">{t('settings.currencyDesc')}</p>
            <div ref={currencyRef} className="relative">
              <button
                type="button"
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="w-full flex items-center gap-2 px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground hover:bg-muted transition-colors"
              >
                <span>{REGIONAL_PRICING[detectedCountry]?.flag}</span>
                <span className="flex-1 text-left">
                  {REGIONAL_PRICING[detectedCountry]?.currency.code} ({REGIONAL_PRICING[detectedCountry]?.currency.symbol}) G�� {REGIONAL_PRICING[detectedCountry]?.currency.locale}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${currencyOpen ? 'rotate-180' : ''}`} />
              </button>
              {currencyOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {Object.entries(REGIONAL_PRICING).map(([code, cfg]) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => { handleCurrencyChange(code); setCurrencyOpen(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${
                        detectedCountry === code
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <span>{cfg.flag}</span>
                      <span>{cfg.currency.code} ({cfg.currency.symbol}) G�� {cfg.currency.locale}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </PremiumCard>

          <PremiumCard glass>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-gold" />
              </div>
              <h3 className="font-sans text-lg font-semibold">{t('settings.subscription')}</h3>
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
