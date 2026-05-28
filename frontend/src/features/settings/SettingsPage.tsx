import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { User, Globe, Sun, Moon, Bell, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold">Settings</h1>
        <p className="text-ink/60 dark:text-parchment/60 mt-1">Manage your profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <User className="w-4 h-4 text-gold" />
            <h3 className="font-serif text-lg font-semibold">Profile</h3>
          </div>
          <div className="space-y-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" value={user?.email || ''} disabled />
            <Input label="Birth Date" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Birth Time" type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} />
              <Input label="Birth Place" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} />
            </div>
            <Button onClick={handleSave} loading={updateMutation.isPending} className="w-full">
              <Save className="w-3.5 h-3.5" /> Save Changes
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-6">
              <Sun className="w-4 h-4 text-gold" />
              <h3 className="font-serif text-lg font-semibold">Theme</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button key={t} onClick={() => setTheme(t)}
                  className={`p-4 rounded-lg border text-center transition-all ${
                    theme === t ? 'border-gold bg-gold/10' : 'border-ink/10 dark:border-white/10 hover:border-gold/50'
                  }`}>
                  {t === 'light' ? <Sun className="w-5 h-5 mx-auto mb-1" /> : t === 'dark' ? <Moon className="w-5 h-5 mx-auto mb-1" /> : <Globe className="w-5 h-5 mx-auto mb-1" />}
                  <span className="text-xs capitalize">{t}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-gold" />
              <h3 className="font-serif text-lg font-semibold">Subscription</h3>
            </div>
            <p className="text-sm text-ink/60">You are on the <strong className="text-gold">Free</strong> plan</p>
            <p className="text-xs text-ink/50 mt-1">Upgrade to unlock premium features</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
