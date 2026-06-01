import { Link } from 'react-router-dom';
import { Sparkles, Quote, Users, Globe, Star, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n/useT';

export function AboutPage() {
  const { t } = useT();

  const TEAM = [
    { name: t('about.team1Name' as any), role: t('about.team1Role' as any), bio: t('about.team1Bio' as any), avatar: 'AS' },
    { name: t('about.team2Name' as any), role: t('about.team2Role' as any), bio: t('about.team2Bio' as any), avatar: 'PM' },
    { name: t('about.team3Name' as any), role: t('about.team3Role' as any), bio: t('about.team3Bio' as any), avatar: 'RK' },
    { name: t('about.team4Name' as any), role: t('about.team4Role' as any), bio: t('about.team4Bio' as any), avatar: 'AG' },
  ];

  const MILESTONES = [
    { year: '2020', title: t('about.milestone1' as any), desc: t('about.milestone1Desc' as any) },
    { year: '2021', title: t('about.milestone2' as any), desc: t('about.milestone2Desc' as any) },
    { year: '2022', title: t('about.milestone3' as any), desc: t('about.milestone3Desc' as any) },
    { year: '2023', title: t('about.milestone4' as any), desc: t('about.milestone4Desc' as any) },
    { year: '2024', title: t('about.milestone5' as any), desc: t('about.milestone5Desc' as any) },
    { year: '2025', title: t('about.milestone6' as any), desc: t('about.milestone6Desc' as any) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-parchment to-amber-50 dark:from-cosmic dark:to-cosmic-deeper">
      <div className="max-w-5xl mx-auto px-5 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-serif text-4xl font-bold mb-4">{t('about.title' as any)}</h1>
          <p className="text-lg text-ink/60 dark:text-parchment/60 max-w-2xl mx-auto">
            {t('about.intro' as any)}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            { icon: Globe, title: t('about.mission1' as any), desc: t('about.mission1Desc' as any) },
            { icon: Star, title: t('about.mission2' as any), desc: t('about.mission2Desc' as any) },
            { icon: Shield, title: t('about.mission3' as any), desc: t('about.mission3Desc' as any) },
          ].map((item) => (
            <div key={item.title} className="p-6 rounded-2xl bg-white/50 dark:bg-white/[0.03] border border-ink/5 dark:border-white/[0.06] text-center">
              <item.icon className="w-8 h-8 text-gold mx-auto mb-3" />
              <h3 className="font-medium mb-2">{item.title}</h3>
              <p className="text-sm text-ink/50 dark:text-parchment/50">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="font-serif text-2xl font-bold text-center mb-10">{t('about.journey' as any)}</h2>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gold/20 -translate-x-1/2 hidden md:block" />
            {MILESTONES.map((m, i) => (
              <motion.div key={m.year} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }} className={`flex items-center gap-6 mb-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <span className="text-gold text-sm font-bold">{m.year}</span>
                  <h3 className="font-medium text-lg">{m.title}</h3>
                  <p className="text-sm text-ink/50 dark:text-parchment/50">{m.desc}</p>
                </div>
                <div className="hidden md:flex w-4 h-4 rounded-full bg-gold shrink-0 relative z-10" />
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-20">
          <h2 className="font-serif text-2xl font-bold text-center mb-10">{t('about.team' as any)}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="p-6 rounded-2xl bg-white/50 dark:bg-white/[0.03] border border-ink/5 dark:border-white/[0.06] text-center">
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-gold font-bold">{member.avatar}</span>
                </div>
                <h3 className="font-medium text-sm">{member.name}</h3>
                <p className="text-xs text-gold mb-2">{member.role}</p>
                <p className="text-xs text-ink/50 dark:text-parchment/50">{member.bio}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-16 text-center p-10 rounded-3xl bg-gradient-to-br from-gold/5 to-amber-500/5 border border-gold/10">
          <Quote className="w-8 h-8 text-gold mx-auto mb-4" />
          <p className="font-serif text-xl italic max-w-2xl mx-auto mb-4">
            {t('about.quote' as any)}
          </p>
          <p className="text-sm text-ink/50">{t('about.attribution' as any)}</p>
        </motion.div>

        <div className="text-center mt-12">
          <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-white font-medium hover:bg-gold/90 transition-colors">
            <Sparkles className="w-4 h-4" /> {t('about.cta' as any)}
          </Link>
        </div>
      </div>
    </div>
  );
}
