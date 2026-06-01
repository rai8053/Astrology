import { useEffect, lazy, Suspense, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from '@/lib/store';
import { brand } from '@/config/brand';
import { easeOut } from '@/lib/animations';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingScreen } from '@/components/LoadingScreen';
import { CosmicBackground } from '@/components/CosmicBackground';
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
const PricingPage = lazy(() => import('@/features/landing/PricingPage').then(m => ({ default: m.PricingPage })));
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
  '/': 'Home',
  '/pricing': 'Pricing',
  '/login': 'Sign In',
  '/register': 'Create Account',
  '/about': 'About',
  '/contact': 'Contact',
  '/faq': 'FAQ',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Service',
  '/refund': 'Refund Policy',
  '/dashboard': 'Dashboard',
  '/dashboard/horoscope': 'Horoscope',
  '/dashboard/kundli': 'Kundli',
  '/dashboard/compatibility': 'Compatibility',
  '/dashboard/moon': 'Moon Phases',
  '/dashboard/chat': 'AI Astrologer',
  '/dashboard/settings': 'Settings',
  '/admin': 'Admin',
  '/admin/users': 'Users',
  '/admin/analytics': 'Analytics',
};

const pageDescriptions: Record<string, string> = {
  '/': 'AI-powered Vedic astrology platform with personalized birth charts, daily horoscopes, and compatibility analysis.',
  '/pricing': 'Choose your plan — Free, Pro, Premium, or Enterprise. Unlock AI astrologer chat, detailed birth charts, and more.',
  '/login': 'Sign in to your Soma & Surya account to access your personalized Vedic astrology dashboard.',
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
};

function PageWrap({ children, cosmic = false }: { children: React.ReactNode; cosmic?: boolean }) {
  const loc = useLocation();
  const pathKey = Object.keys(pageTitles)
    .filter(k => loc.pathname === k || loc.pathname.startsWith(k + '/'))
    .sort((a, b) => b.length - a.length)[0] || '/';
  const title = pageTitles[pathKey] ? `${pageTitles[pathKey]} — ${brand.name}` : brand.meta.title;
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

  const [googleClientId, setGoogleClientId] = useState('');

  useEffect(() => {
    fetchGoogleClientId().then(setGoogleClientId);
  }, []);

  const content = (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingScreen />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrap cosmic><Landing /></PageWrap>} />
          <Route path="/pricing" element={<PageWrap cosmic><PricingPage /></PageWrap>} />
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
    </HelmetProvider>
  );
}
