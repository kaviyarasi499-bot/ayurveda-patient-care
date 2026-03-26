import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { login, getCurrentUser, initDefaultUser } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf } from 'lucide-react';

export default function LoginPage() {
  initDefaultUser();

  if (getCurrentUser()) {
    return <Navigate to="/" replace />;
  }

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/');
    } else {
      setError('Invalid credentials. Try admin / admin123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">AyurVeda</h1>
          <p className="text-muted-foreground mt-1">Practice Management System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-6 space-y-4 shadow-sm">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="mt-1" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">Sign In</Button>
          <p className="text-xs text-center text-muted-foreground">Default: admin / admin123</p>
        </form>
      </div>
    </div>
  );
}
