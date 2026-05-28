import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
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

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardHome />} />
        <Route path="horoscope" element={<HoroscopePage />} />
        <Route path="kundli" element={<KundliPage />} />
        <Route path="compatibility" element={<CompatibilityPage />} />
        <Route path="moon" element={<MoonPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
