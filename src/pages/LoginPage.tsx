import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { login, getCurrentUser, initDefaultUser } from '@/lib/store';
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background image with blur */}
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
        {/* Logo & Title */}
        <div className="text-center mb-8 opacity-0 animate-fade-in-up">
          <div className="w-20 h-20 rounded-2xl bg-primary/90 flex items-center justify-center mx-auto mb-4 animate-float shadow-xl backdrop-blur-md">
            <Leaf className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground tracking-tight drop-shadow-sm">AyurVeda</h1>
          <p className="text-muted-foreground mt-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Practice Management System
            <Sparkles className="w-3.5 h-3.5 text-accent" />
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-card/90 backdrop-blur-md border rounded-xl p-6 space-y-4 shadow-2xl opacity-0 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" className="mt-1 bg-background/80" />
          </div>
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 bg-background/80" />
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
