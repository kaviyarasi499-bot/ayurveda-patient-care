import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ayurvedaBg from '@/assets/ayurveda-bg.jpg';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success('Account created! Check your email to confirm, or sign in if auto-confirm is enabled.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={ayurvedaBg} alt="" width={1920} height={1080} className="w-full h-full object-cover scale-105 blur-[2px]" />
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
          <p className="text-xs text-center text-muted-foreground">
            For Admins &amp; Customers — role is auto-detected after sign in
          </p>

          {/* Google Sign-In */}
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card/90 px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 bg-background/80" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 bg-background/80" />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-medium hover:underline">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
