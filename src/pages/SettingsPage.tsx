import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { User, Lock, Shield, Sun, Moon, Pencil } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

export default function SettingsPage() {
  const user = getCurrentUser();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [editingUsername, setEditingUsername] = useState(false);
  const [displayName, setDisplayName] = useState(user?.username || '');
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const found = users.find((u: any) => u.id === user?.id);

    if (!found || found.password !== currentPassword) {
      toast.error('Current password is incorrect');
      return;
    }
    if (newPassword.length < 4) {
      toast.error('New password must be at least 4 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    found.password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(found));
    toast.success('Password updated successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangeUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find((u: any) => u.username === newUsername.trim() && u.id !== user?.id)) {
      toast.error('Username already taken');
      return;
    }

    const found = users.find((u: any) => u.id === user?.id);
    if (!found) return;

    found.username = newUsername.trim();
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(found));
    setDisplayName(found.username);
    setEditingUsername(false);
    setNewUsername('');
    toast.success('Username updated successfully');
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account</p>
        </div>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-foreground">{displayName}</p>
                  <button
                    onClick={() => { setEditingUsername(true); setNewUsername(displayName); }}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">Practitioner</p>
              </div>
            </div>

            {editingUsername && (
              <form onSubmit={handleChangeUsername} className="flex items-end gap-3 pt-2 border-t border-border">
                <div className="flex-1">
                  <Label htmlFor="newUsername">New Username</Label>
                  <Input
                    id="newUsername"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    placeholder="Enter new username"
                    className="mt-1"
                  />
                </div>
                <Button type="submit" size="sm">Save</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingUsername(false)}>Cancel</Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDark ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize the look of the application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sun className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Dark Mode</span>
                <Moon className="w-4 h-4 text-muted-foreground" />
              </div>
              <Switch checked={isDark} onCheckedChange={setIsDark} />
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Change Password
            </CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="mt-1" />
              </div>
              <Button type="submit" className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
