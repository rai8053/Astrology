import { useState, FormEvent } from 'react';
import { Mail, MessageSquare, Send, Sparkles, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PremiumButton } from '@/components/PremiumButton';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Input } from '@/components/ui/Input';
import { useTranslation } from '@/lib/i18n';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export function ContactPage() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending || sent) return;
    setSending(true);
    setError(null);
    try {
      await api.post('/api/contact', { name, email, subject, message });
      setSent(true);
      setName(''); setEmail(''); setSubject(''); setMessage('');
      setTimeout(() => { setSent(false); }, 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send message';
      setError(msg);
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
      <Navbar />
      <div className="max-w-4xl mx-auto px-5 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <MessageSquare className="w-10 h-10 text-accent mx-auto mb-3" />
          <h1 className="font-sans text-4xl sm:text-5xl font-bold tracking-tight mb-3">{t('contact.title')}</h1>
          <p className="text-text-secondary">{t('contact.subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            {[
              { icon: Mail, label: t('contact.email'), value: 'hello@somaandsurya.com' },
              { icon: MessageSquare, label: t('contact.support'), value: 'support@somaandsurya.com' },
              { icon: MapPin, label: t('contact.location'), value: 'Mumbai, India' },
              { icon: Clock, label: t('contact.responseTime'), value: 'Within 24 hours' },
            ].map((item) => (
              <PremiumCard key={item.label} glass>
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-accent shrink-0" />
                  <div>
                    <p className="text-xs text-text-tertiary">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>

          <div className="md:col-span-2">
            <PremiumCard glass>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label={t('contact.nameLabel')} value={name} onChange={(e) => setName(e.target.value)} required placeholder={t('contact.namePlaceholder')} />
                  <Input label={t('contact.emailLabel')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={t('auth.emailPlaceholder')} />
                </div>
                <Input label={t('contact.subjectLabel')} value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder={t('contact.subjectPlaceholder')} />
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">{t('contact.messageLabel')}</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} className="input-glass w-full resize-none" placeholder={t('contact.messagePlaceholder')} />
                </div>
                <PremiumButton type="submit" disabled={sent} loading={sending} icon={sent ? <Sparkles className="w-4 h-4" /> : <Send className="w-4 h-4" />} className="w-full">
                  {sent ? t('contact.send') : t('contact.send')}
                </PremiumButton>
              </form>
            </PremiumCard>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
