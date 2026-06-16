import { useEffect, lazy, Suspense, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from '@/lib/store';
import { brand } from '@/config/brand';
import { useI18nStore, useTranslation } from '@/lib/i18n';
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

const pageTitleKeys: Record<string, string> = {
  '/': 'seo.homeTitle',
  '/pricing': 'seo.pricingTitle',
  '/numerology': 'seo.numerologyTitle',
  '/tarot': 'seo.tarotTitle',
  '/transits': 'seo.transitsTitle',
  '/login': 'seo.loginTitle',
  '/register': 'seo.registerTitle',
  '/about': 'seo.aboutTitle',
  '/contact': 'seo.contactTitle',
  '/faq': 'seo.faqTitle',
  '/privacy': 'seo.privacyTitle',
  '/terms': 'seo.termsTitle',
  '/refund': 'seo.refundTitle',
  '/dashboard': 'seo.dashboardTitle',
  '/dashboard/horoscope': 'seo.horoscopeTitle',
  '/dashboard/kundli': 'seo.kundliTitle',
  '/dashboard/compatibility': 'seo.compatibilityTitle',
  '/dashboard/moon': 'seo.moonTitle',
  '/dashboard/chat': 'seo.chatTitle',
  '/dashboard/settings': 'seo.settingsTitle',
  '/admin': 'seo.adminTitle',
  '/admin/users': 'seo.adminUsersTitle',
  '/admin/analytics': 'seo.adminAnalyticsTitle',
  '/admin/reports': 'seo.adminReportsTitle',
};

const pageDescKeys: Record<string, string> = {
  '/': 'seo.homeDesc',
  '/pricing': 'seo.pricingDesc',
  '/numerology': 'seo.numerologyDesc',
  '/tarot': 'seo.tarotDesc',
  '/transits': 'seo.transitsDesc',
  '/login': 'seo.loginDesc',
  '/register': 'seo.registerDesc',
  '/about': 'seo.aboutDesc',
  '/contact': 'seo.contactDesc',
  '/faq': 'seo.faqDesc',
  '/privacy': 'seo.privacyDesc',
  '/terms': 'seo.termsDesc',
  '/refund': 'seo.refundDesc',
  '/dashboard': 'seo.dashboardDesc',
  '/dashboard/horoscope': 'seo.horoscopeDesc',
  '/dashboard/kundli': 'seo.kundliDesc',
  '/dashboard/compatibility': 'seo.compatibilityDesc',
  '/dashboard/moon': 'seo.moonDesc',
  '/dashboard/chat': 'seo.chatDesc',
  '/dashboard/settings': 'seo.settingsDesc',
  '/admin': 'seo.adminDesc',
  '/admin/users': 'seo.adminUsersDesc',
  '/admin/analytics': 'seo.adminAnalyticsDesc',
  '/admin/reports': 'seo.adminReportsDesc',
};

function PageWrap({ children, cosmic = false }: { children: React.ReactNode; cosmic?: boolean }) {
  const loc = useLocation();
  const { t } = useTranslation();
  const pathKey = Object.keys(pageTitleKeys)
    .filter(k => loc.pathname === k || loc.pathname.startsWith(k + '/'))
    .sort((a, b) => b.length - a.length)[0] || '/';
  const title = t(pageTitleKeys[pathKey] ?? '') || brand.meta.title;
  const description = t(pageDescKeys[pathKey] ?? '') || brand.meta.description;
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
  const { t } = useTranslation();

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
        {t('common.skipToContent')}
      </a>
      <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>
      <LocationPopup />
    </HelmetProvider>
  );
}
