import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingScreen } from '@/components/LoadingScreen';
import { CosmicBackground } from '@/components/CosmicBackground';
import { Landing } from '@/features/landing/Landing';
import { DashboardLayout } from '@/features/dashboard/DashboardLayout';
import { DashboardHome } from '@/features/dashboard/DashboardHome';
import { HoroscopePage } from '@/features/horoscope/HoroscopePage';
import { KundliPage } from '@/features/kundli/KundliPage';
import { CompatibilityPage } from '@/features/compatibility/CompatibilityPage';
import { MoonPage } from '@/features/moon/MoonPage';
import { ChatPage } from '@/features/chat/ChatPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { AdminLayout } from '@/features/admin/AdminLayout';
import { AdminDashboard } from '@/features/admin/AdminDashboard';
import { AdminUsers } from '@/features/admin/AdminUsers';
import { AdminAnalytics } from '@/features/admin/AdminAnalytics';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { PricingPage } from '@/features/landing/PricingPage';

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

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}
