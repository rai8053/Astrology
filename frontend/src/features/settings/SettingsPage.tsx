import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { User, Sun, Moon, Globe, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Input } from '@/components/ui/Input';
import { BirthPlaceInput } from '@/components/ui/BirthPlaceInput';
import { PremiumButton } from '@/components/PremiumButton';
import { useAuthStore, useThemeStore } from '@/lib/store';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [name, setName] = useState(user?.name || '');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.patch('/api/user/profile', data),
    onSuccess: () => {
      setUser({ ...user!, name });
      toast.success('Profile updated');
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ name, birthDate, birthTime, birthPlace });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-serif font-bold">Settings</h1>
        <p className="text-ink/50 dark:text-parchment/50 mt-1">Manage your profile and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <PremiumCard glass>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                <User className="w-4 h-4 text-gold" />
              </div>
              <h3 className="font-serif text-lg font-semibold">Profile</h3>
            </div>
            <div className="space-y-4">
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              <Input label="Email" value={user?.email || ''} disabled />
              <Input label="Birth Date" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Birth Time" type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} />
                <BirthPlaceInput label="Birth Place" value={birthPlace} onChange={(v) => setBirthPlace(v)} placeholder="e.g., Sadhaura, Yamunanagar" />
              </div>
              <PremiumButton onClick={handleSave} loading={updateMutation.isPending} icon={<Save className="w-3.5 h-3.5" />} className="w-full">
                Save Changes
              </PremiumButton>
            </div>
          </PremiumCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          <PremiumCard glass>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                <Sun className="w-4 h-4 text-gold" />
              </div>
              <h3 className="font-serif text-lg font-semibold">Theme</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <motion.button
                  key={t}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setTheme(t)}
                  className={`p-4 rounded-xl text-center transition-all duration-300 ${
                    theme === t
                      ? 'gold-border bg-gold/10 cosmic-glow'
                      : 'border border-ink/10 dark:border-white/10 hover:border-gold/30 bg-white dark:bg-cosmic-light/30'
                  }`}
                >
                  {t === 'light' ? <Sun className="w-5 h-5 mx-auto mb-1.5 text-gold" /> : t === 'dark' ? <Moon className="w-5 h-5 mx-auto mb-1.5 text-gold" /> : <Globe className="w-5 h-5 mx-auto mb-1.5 text-gold" />}
                  <span className="text-xs capitalize font-medium">{t}</span>
                </motion.button>
              ))}
            </div>
          </PremiumCard>

          <PremiumCard glass>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                <Sun className="w-4 h-4 text-gold" />
              </div>
              <h3 className="font-serif text-lg font-semibold">Subscription</h3>
            </div>
            <p className="text-sm text-ink/50 dark:text-parchment/50">
              You are on the <strong className="text-gold">Free</strong> plan
            </p>
            <p className="text-xs text-ink/40 dark:text-parchment/40 mt-1">Upgrade to unlock premium features</p>
          </PremiumCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
