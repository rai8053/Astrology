import { useState, FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { PremiumButton } from '@/components/PremiumButton';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, isAuthenticated, googleClientId } = useAuthStore();
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch { /* handled by API client */ } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-parchment to-amber-50 dark:from-cosmic dark:to-cosmic-deeper p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]" style={{
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(212,175,55,0.5) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(212,175,55,0.3) 0%, transparent 40%)',
      }} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <Sparkles className="w-6 h-6 text-gold" />
          <span className="font-serif text-2xl font-semibold bg-gradient-to-r from-gold to-amber-400 bg-clip-text text-transparent">Soma & Surya</span>
        </Link>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 rounded-2xl"
        >
          <h1 className="font-serif text-3xl font-bold mb-1">Welcome Back</h1>
          <p className="text-sm text-ink/50 dark:text-parchment/50 mb-7">Sign in to continue your cosmic journey</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" />
            <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            <PremiumButton type="submit" loading={loading} icon={<ArrowRight className="w-4 h-4" />} className="w-full">
              Sign In
            </PremiumButton>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink/10 dark:border-parchment/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-cosmic-deeper px-2 text-ink/40 dark:text-parchment/40">or continue with</span>
            </div>
          </div>
          {googleClientId && (
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (credentialResponse.credential) {
                    try {
                      await loginWithGoogle(credentialResponse.credential);
                      navigate('/dashboard');
                    } catch { /* handled by API client */ }
                  }
                }}
                onError={() => toast.error('Google sign-in failed')}
                size="large"
                shape="pill"
                text="signin_with"
              />
            </div>
          )}
          <p className="text-sm text-center mt-6 text-ink/40 dark:text-parchment/40">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold hover:underline font-medium">Create one</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
