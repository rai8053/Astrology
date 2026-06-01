import { useState, FormEvent } from 'react';
import { Mail, MessageSquare, Send, Sparkles, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { PremiumButton } from '@/components/PremiumButton';
import { useT } from '@/lib/i18n/useT';

export function ContactPage() {
  const { t } = useT();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => { setName(''); setEmail(''); setSubject(''); setMessage(''); setSent(false); }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-parchment to-amber-50 dark:from-cosmic dark:to-cosmic-deeper">
      <div className="max-w-4xl mx-auto px-5 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <MessageSquare className="w-10 h-10 text-gold mx-auto mb-3" />
          <h1 className="font-serif text-4xl font-bold mb-3">{t('contact.title' as any)}</h1>
          <p className="text-ink/60 dark:text-parchment/60">{t('contact.subtitle' as any)}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            {[
              { icon: Mail, label: t('contact.email' as any), value: 'hello@somaandsurya.com' },
              { icon: MessageSquare, label: t('contact.support' as any), value: 'support@somaandsurya.com' },
              { icon: MapPin, label: t('contact.location' as any), value: 'Mumbai, India' },
              { icon: Clock, label: t('contact.responseTime' as any), value: 'Within 24 hours' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-white/[0.03] border border-ink/5 dark:border-white/[0.06]">
                <item.icon className="w-5 h-5 text-gold shrink-0" />
                <div>
                  <p className="text-xs text-ink/40">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/50 dark:bg-white/[0.03] border border-ink/5 dark:border-white/[0.06] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink/60 dark:text-parchment/60 mb-1">{t('contact.nameLabel' as any)}</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-ink/5 dark:bg-white/[0.05] border border-transparent focus:border-gold/50 focus:outline-none text-sm transition-colors" placeholder={t('contact.namePlaceholder' as any)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink/60 dark:text-parchment/60 mb-1">{t('contact.emailLabel' as any)}</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-ink/5 dark:bg-white/[0.05] border border-transparent focus:border-gold/50 focus:outline-none text-sm transition-colors" placeholder={t('auth.emailPlaceholder' as any)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink/60 dark:text-parchment/60 mb-1">{t('contact.subjectLabel' as any)}</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-ink/5 dark:bg-white/[0.05] border border-transparent focus:border-gold/50 focus:outline-none text-sm transition-colors" placeholder={t('contact.subjectPlaceholder' as any)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink/60 dark:text-parchment/60 mb-1">{t('contact.messageLabel' as any)}</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} className="w-full px-3.5 py-2.5 rounded-xl bg-ink/5 dark:bg-white/[0.05] border border-transparent focus:border-gold/50 focus:outline-none text-sm transition-colors resize-none" placeholder={t('contact.messagePlaceholder' as any)} />
              </div>
              <PremiumButton type="submit" disabled={sent} icon={sent ? <Sparkles className="w-4 h-4" /> : <Send className="w-4 h-4" />} className="w-full">
                {sent ? t('contact.send' as any) : t('contact.send' as any)}
              </PremiumButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
