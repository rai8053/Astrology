import { Link } from 'react-router-dom';
import { Sparkles, Quote, Users, Globe, Star, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PremiumButton } from '@/components/PremiumButton';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { useTranslation } from '@/lib/i18n';

export function AboutPage() {
  const { t } = useTranslation();

  const TEAM = [
    { name: t('about.team1Name'), role: t('about.team1Role'), bio: t('about.team1Bio'), avatar: 'AS' },
    { name: t('about.team2Name'), role: t('about.team2Role'), bio: t('about.team2Bio'), avatar: 'PM' },
    { name: t('about.team3Name'), role: t('about.team3Role'), bio: t('about.team3Bio'), avatar: 'RK' },
    { name: t('about.team4Name'), role: t('about.team4Role'), bio: t('about.team4Bio'), avatar: 'AG' },
  ];

  const MILESTONES = [
    { year: '2020', title: t('about.milestone1'), desc: t('about.milestone1Desc') },
    { year: '2021', title: t('about.milestone2'), desc: t('about.milestone2Desc') },
    { year: '2022', title: t('about.milestone3'), desc: t('about.milestone3Desc') },
    { year: '2023', title: t('about.milestone4'), desc: t('about.milestone4Desc') },
    { year: '2024', title: t('about.milestone5'), desc: t('about.milestone5Desc') },
    { year: '2025', title: t('about.milestone6'), desc: t('about.milestone6Desc') },
  ];

  return (
    <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
      <Navbar />
      <div className="max-w-5xl mx-auto px-5 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-sans text-4xl sm:text-5xl font-bold tracking-tight mb-4">{t('about.title')}</h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">{t('about.intro')}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            { icon: Globe, title: t('about.mission1'), desc: t('about.mission1Desc') },
            { icon: Star, title: t('about.mission2'), desc: t('about.mission2Desc') },
            { icon: Shield, title: t('about.mission3'), desc: t('about.mission3Desc') },
          ].map((item) => (
            <PremiumCard key={item.title} glass className="text-center">
              <item.icon className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="font-medium mb-2">{item.title}</h3>
              <p className="text-sm text-text-secondary">{item.desc}</p>
            </PremiumCard>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="font-sans text-2xl font-bold text-center mb-10">{t('about.journey')}</h2>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-accent/20 -translate-x-1/2 hidden md:block" />
            {MILESTONES.map((m, i) => (
              <motion.div key={m.year} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }} className={`flex items-center gap-6 mb-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <span className="text-accent text-sm font-bold">{m.year}</span>
                  <h3 className="font-medium text-lg">{m.title}</h3>
                  <p className="text-sm text-text-secondary">{m.desc}</p>
                </div>
                <div className="hidden md:flex w-4 h-4 rounded-full bg-accent shrink-0 relative z-10" />
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-20">
          <h2 className="font-sans text-2xl font-bold text-center mb-10">{t('about.team')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <PremiumCard key={member.name} glass className="text-center">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-accent font-bold">{member.avatar}</span>
                </div>
                <h3 className="font-medium text-sm">{member.name}</h3>
                <p className="text-xs text-accent mb-2">{member.role}</p>
                <p className="text-xs text-text-secondary">{member.bio}</p>
              </PremiumCard>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-16 text-center p-10 rounded-3xl bg-accent/5 border border-accent/10">
          <Quote className="w-8 h-8 text-accent mx-auto mb-4" />
          <p className="font-sans text-xl italic max-w-2xl mx-auto mb-4">{t('about.quote')}</p>
          <p className="text-sm text-text-secondary">{t('about.attribution')}</p>
        </motion.div>

        <div className="text-center mt-12">
          <Link to="/register">
            <PremiumButton icon={<Sparkles className="w-4 h-4" />}>{t('about.cta')}</PremiumButton>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
