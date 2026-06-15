import { useEffect, lazy, Suspense, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from '@/lib/store';
import { brand } from '@/config/brand';
import { useI18nStore } from '@/lib/i18n';
import posthog from 'posthog-js';
import { easeOut } from '@/lib/animations';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingScreen } from '@/components/LoadingScreen';
import { CosmicBackground } from '@/components/CosmicBackground';
import { LocationPopup } from '@/components/LocationPopup';
import { fetchGoogleClientId } from '@/lib/google';
import { Landing } from '@/features/landing/Landing';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';

const DashboardLayout = lazy(() => import('@/features/dashboard/DashboardLayout').then(m => ({ default: m.DashboardLayout })));
const DashboardHome = lazy(() => import('@/features/dashboard/DashboardHome').then(m => ({ default: m.DashboardHome })));
const HoroscopePage = lazy(() => import('@/features/horoscope/HoroscopePage').then(m => ({ default: m.HoroscopePage })));
const KundliPage = lazy(() => import('@/features/kundli/KundliPage').then(m => ({ default: m.KundliPage })));
const CompatibilityPage = lazy(() => import('@/features/compatibility/CompatibilityPage').then(m => ({ default: m.CompatibilityPage })));
const MoonPage = lazy(() => import('@/features/moon/MoonPage').then(m => ({ default: m.MoonPage })));
const ChatPage = lazy(() => import('@/features/chat/ChatPage').then(m => ({ default: m.ChatPage })));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AdminLayout = lazy(() => import('@/features/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('@/features/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminUsers = lazy(() => import('@/features/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminAnalytics = lazy(() => import('@/features/admin/AdminAnalytics').then(m => ({ default: m.AdminAnalytics })));
const AdminReportsPage = lazy(() => import('@/features/admin/AdminReportsPage').then(m => ({ default: m.AdminReportsPage })));
const PricingPage = lazy(() => import('@/features/landing/PricingPage').then(m => ({ default: m.PricingPage })));
const NumerologyPage = lazy(() => import('@/features/numerology/NumerologyPage').then(m => ({ default: m.NumerologyPage })));
const TarotPage = lazy(() => import('@/features/tarot/TarotPage').then(m => ({ default: m.TarotPage })));
const TransitsPage = lazy(() => import('@/features/transits/TransitsPage').then(m => ({ default: m.TransitsPage })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const FAQPage = lazy(() => import('@/pages/FAQPage').then(m => ({ default: m.FAQPage })));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('@/pages/TermsPage').then(m => ({ default: m.TermsPage })));
const RefundPage = lazy(() => import('@/pages/RefundPage').then(m => ({ default: m.RefundPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

const pageTitles: Record<string, string> = {
  '/': 'Soma & Surya — AI-Powered Vedic Astrology',
  '/pricing': 'Pricing Plans — AstroNova',
  '/numerology': 'Numerology Calculator — AstroNova',
  '/tarot': 'Tarot Reading — AstroNova',
  '/transits': 'Planetary Transits — AstroNova',
  '/login': 'Login — AstroNova',
  '/register': 'Create Account — Soma & Surya',
  '/about': 'About Us — Soma & Surya',
  '/contact': 'Contact Us — Soma & Surya',
  '/faq': 'FAQ — Soma & Surya',
  '/privacy': 'Privacy Policy — Soma & Surya',
  '/terms': 'Terms of Service — Soma & Surya',
  '/refund': 'Refund Policy — Soma & Surya',
  '/dashboard': 'Dashboard — Soma & Surya',
  '/dashboard/horoscope': 'Daily Horoscope — Soma & Surya',
  '/dashboard/kundli': 'Birth Chart — Soma & Surya',
  '/dashboard/compatibility': 'Compatibility — Soma & Surya',
  '/dashboard/moon': 'Moon Phase Tracker — Soma & Surya',
  '/dashboard/chat': 'AI Astrologer Chat — Soma & Surya',
  '/dashboard/settings': 'Settings — Soma & Surya',
  '/admin': 'Admin — Soma & Surya',
  '/admin/users': 'User Management — Soma & Surya',
  '/admin/analytics': 'Analytics — Soma & Surya',
  '/admin/reports': 'Reports — Soma & Surya',
};

const pageDescriptions: Record<string, string> = {
  '/': 'AI-powered Vedic astrology platform with personalized birth charts, daily horoscopes, and compatibility analysis.',
  '/pricing': 'Choose your plan — Free, Pro, Premium, or Enterprise. Unlock AI astrologer chat, detailed birth charts, and more.',
  '/numerology': 'Calculate your Life Path, Destiny, and Soul Urge numbers with our free numerology calculator.',
  '/tarot': 'Get mystical tarot card readings with single card, three-card, and Celtic Cross spreads.',
  '/transits': 'Track current planetary positions, moon phases, and upcoming transit events.',
  '/login': 'Sign in to your AstroNova account to access your personalized Vedic astrology dashboard.',
  '/register': 'Create your Soma & Surya account and discover your Vedic birth chart, daily horoscope, and more.',
  '/about': 'Learn about Soma & Surya — where ancient Vedic wisdom meets modern AI technology.',
  '/contact': 'Get in touch with the Soma & Surya team. We\'d love to hear from you.',
  '/faq': 'Frequently asked questions about Vedic astrology, birth charts, compatibility, and our AI-powered platform.',
  '/privacy': 'Soma & Surya Privacy Policy — how we protect and handle your personal data.',
  '/terms': 'Soma & Surya Terms of Service — the rules and guidelines for using our platform.',
  '/refund': 'Soma & Surya Refund Policy — our cancellation and refund terms for paid plans.',
  '/dashboard': 'Your personal astrology dashboard with daily horoscopes, cosmic energy score, transit alerts, and more.',
  '/dashboard/horoscope': 'Your daily, weekly, and monthly Vedic horoscope with personalized planetary insights.',
  '/dashboard/kundli': 'Your detailed Vedic birth chart (Kundli) with rashi, nakshatra, and planetary positions.',
  '/dashboard/compatibility': 'Vedic compatibility analysis — compare two birth charts for relationship matching.',
  '/dashboard/moon': 'Track moon phases, tithi, and nakshatra for optimal timing of spiritual activities.',
  '/dashboard/chat': 'Chat with an AI Vedic astrologer for personalized spiritual guidance and answers.',
  '/dashboard/settings': 'Manage your Soma & Surya account settings, language, and preferences.',
  '/admin': 'Soma & Surya admin dashboard — manage users, reports, and platform analytics.',
  '/admin/users': 'Admin user management — view and manage platform users.',
  '/admin/analytics': 'Admin analytics dashboard with platform usage metrics and reports.',
  '/admin/reports': 'Admin reports — view user-generated astrology reports and platform activity.',
};

function PageWrap({ children, cosmic = false }: { children: React.ReactNode; cosmic?: boolean }) {
  const loc = useLocation();
  const pathKey = Object.keys(pageTitles)
    .filter(k => loc.pathname === k || loc.pathname.startsWith(k + '/'))
    .sort((a, b) => b.length - a.length)[0] || '/';
  const title = pageTitles[pathKey] || brand.meta.title;
  const description = pageDescriptions[pathKey] || brand.meta.description;
  return (
    <motion.div id="main-content" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://somasurya.com${loc.pathname}`} />
        <link rel="canonical" href={`https://somasurya.com${loc.pathname}`} />
      </Helmet>
      {cosmic && <CosmicBackground intensity={0.6} interactive />}
      {children}
    </motion.div>
  );
}

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handler = () => { logout(); };
    window.addEventListener('session-expired', handler);
    return () => window.removeEventListener('session-expired', handler);
  }, [logout]);

  useEffect(() => {
    if (import.meta.env.VITE_POSTHOG_KEY && typeof posthog.capture === 'function') {
      posthog.capture('$pageview');
    }
  }, [location]);

  const [googleClientId, setGoogleClientId] = useState('');

  useEffect(() => {
    fetchGoogleClientId().then(setGoogleClientId);
  }, []);

  const language = useI18nStore((s) => s.language);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const content = (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingScreen />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrap cosmic><Landing /></PageWrap>} />
          <Route path="/pricing" element={<PageWrap cosmic><PricingPage /></PageWrap>} />
          <Route path="/numerology" element={<PageWrap cosmic><NumerologyPage /></PageWrap>} />
          <Route path="/tarot" element={<PageWrap cosmic><TarotPage /></PageWrap>} />
          <Route path="/transits" element={<PageWrap cosmic><TransitsPage /></PageWrap>} />
          <Route path="/login" element={<PageWrap><LoginPage /></PageWrap>} />
          <Route path="/register" element={<PageWrap><RegisterPage /></PageWrap>} />
          <Route path="/dashboard" element={<ProtectedRoute><PageWrap><DashboardLayout /></PageWrap></ProtectedRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="horoscope" element={<HoroscopePage />} />
            <Route path="kundli" element={<KundliPage />} />
            <Route path="compatibility" element={<CompatibilityPage />} />
            <Route path="moon" element={<MoonPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/admin" element={<ProtectedRoute adminOnly><PageWrap><AdminLayout /></PageWrap></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="reports" element={<AdminReportsPage />} />
          </Route>
          <Route path="/about" element={<PageWrap cosmic><AboutPage /></PageWrap>} />
          <Route path="/contact" element={<PageWrap><ContactPage /></PageWrap>} />
          <Route path="/faq" element={<PageWrap cosmic><FAQPage /></PageWrap>} />
          <Route path="/privacy" element={<PageWrap><PrivacyPage /></PageWrap>} />
          <Route path="/terms" element={<PageWrap><TermsPage /></PageWrap>} />
          <Route path="/refund" element={<PageWrap><RefundPage /></PageWrap>} />
          <Route path="*" element={<PageWrap><NotFoundPage /></PageWrap>} />
        </Routes>
        </Suspense>
      </AnimatePresence>
    </ErrorBoundary>
  );

  return (
    <HelmetProvider>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-gold focus:text-cosmic focus:rounded-lg focus:text-sm focus:font-sans focus:font-bold focus:outline-none">
        Skip to main content
      </a>
      <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>
      <LocationPopup />
    </HelmetProvider>
  );
}
