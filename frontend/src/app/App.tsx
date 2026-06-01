import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from '@/lib/store';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingScreen } from '@/components/LoadingScreen';
import { CosmicBackground } from '@/components/CosmicBackground';
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

const easeOut = [0.25, 0.1, 0.25, 1] as const;
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

function PageWrap({ children, cosmic = false }: { children: React.ReactNode; cosmic?: boolean }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
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

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </AnimatePresence>
    </ErrorBoundary>
  );

  return <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>;
}
