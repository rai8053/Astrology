import { useState, FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { PremiumButton } from '@/components/PremiumButton';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle, isAuthenticated } = useAuthStore();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch { /* handled by API client */ } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-parchment to-amber-50 dark:from-cosmic dark:to-cosmic-deeper p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]" style={{
        backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(212,175,55,0.5) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(212,175,55,0.3) 0%, transparent 40%)',
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
          <h1 className="font-serif text-3xl font-bold mb-1">Begin Your Journey</h1>
          <p className="text-sm text-ink/50 dark:text-parchment/50 mb-7">Create your account and discover your cosmic blueprint</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input id="name" label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
            <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" />
            <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="••••••••" />
            <PremiumButton type="submit" loading={loading} icon={<ArrowRight className="w-4 h-4" />} className="w-full">
              Create Account
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
          {googleClientId ? (
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
                onError={() => toast.error('Google sign-up failed')}
                size="large"
                shape="pill"
                text="signup_with"
              />
            </div>
          ) : (
            <p className="text-xs text-center text-ink/40 dark:text-parchment/40">Google Login is temporarily unavailable.</p>
          )}
          <p className="text-sm text-center mt-6 text-ink/40 dark:text-parchment/40">
            Already have an account?{' '}
            <Link to="/login" className="text-gold hover:underline font-medium">Sign in</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
