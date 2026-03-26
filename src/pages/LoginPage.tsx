import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { login, getCurrentUser, initDefaultUser } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, Sparkles } from 'lucide-react';

export default function LoginPage() {
  initDefaultUser();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (getCurrentUser()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/');
    } else {
      setError('Invalid credentials. Try admin / admin123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-accent/5 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full bg-vata/10 blur-2xl animate-float" style={{ animationDelay: '0.8s' }} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8 opacity-0 animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 animate-float shadow-lg">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">AyurVeda</h1>
          <p className="text-muted-foreground mt-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Practice Management System
            <Sparkles className="w-3.5 h-3.5 text-accent" />
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border rounded-xl p-6 space-y-4 shadow-lg opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" className="mt-1" />
          </div>
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="mt-1" />
          </div>
          {error && <p className="text-sm text-destructive animate-fade-in">{error}</p>}
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button type="submit" className="w-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">Sign In</Button>
          </div>
          <p className="text-xs text-center text-muted-foreground opacity-0 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            Default: admin / admin123
          </p>
        </form>
      </div>
    </div>
  );
}
