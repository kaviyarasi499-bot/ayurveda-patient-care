import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { login, signup, getCurrentUser, initDefaultUser } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, Sparkles } from 'lucide-react';
import ayurvedaBg from '@/assets/ayurveda-bg.jpg';

export default function LoginPage() {
  initDefaultUser();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  if (getCurrentUser()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp) {
      if (password.length < 4) {
        setError('Password must be at least 4 characters');
        return;
      }
      const result = signup(username.trim(), password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Signup failed');
      }
    } else {
      if (login(username, password)) {
        navigate('/');
      } else {
        setError('Invalid credentials');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={ayurvedaBg}
          alt=""
          width={1920}
          height={1080}
          className="w-full h-full object-cover scale-105 blur-[2px]"
        />
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px]" />
      </div>

      <div className="w-full max-w-sm relative z-10 px-4">
        <div className="text-center mb-8 opacity-0 animate-fade-in-up">
          <div className="w-20 h-20 rounded-2xl bg-primary/90 flex items-center justify-center mx-auto mb-4 animate-float shadow-xl backdrop-blur-md">
            <Leaf className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground tracking-tight drop-shadow-sm">AyurVeda</h1>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-secondary-foreground">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Practice Management System
            <Sparkles className="w-3.5 h-3.5 text-accent" />
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card/90 backdrop-blur-md border rounded-xl p-6 space-y-4 shadow-2xl opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <h2 className="text-lg font-semibold text-center text-foreground">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={e => { setUsername(e.target.value); setError(''); }} placeholder="Enter username" className="mt-1 bg-background/80" />
          </div>
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="••••••••" className="mt-1 bg-background/80" />
          </div>
          {error && <p className="text-sm text-destructive animate-fade-in">{error}</p>}
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button type="submit" className="w-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground opacity-0 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-primary font-medium hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
