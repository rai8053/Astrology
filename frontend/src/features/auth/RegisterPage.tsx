import { useState, FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/store';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch {
      // Error handled by API client
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-parchment to-amber-50 dark:from-cosmic dark:to-cosmic-light p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <Sparkles className="w-6 h-6 text-gold" />
          <span className="font-serif text-2xl font-semibold">Soma & Surya</span>
        </Link>
        <div className="bg-white dark:bg-cosmic-light border border-ink/10 dark:border-white/10 p-8 rounded-xl">
          <h1 className="font-serif text-3xl font-bold mb-2">Begin Your Journey</h1>
          <p className="text-sm text-ink/60 dark:text-parchment/60 mb-6">Create your account and discover your cosmic blueprint</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input id="name" label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            <Button type="submit" loading={loading} className="w-full">
              Create Account <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-sm text-center mt-6 text-ink/50 dark:text-parchment/50">
            Already have an account? <Link to="/login" className="text-gold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
