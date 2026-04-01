import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Lock, Shield, Sun, Moon, Pencil, Users, Crown } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

interface UserWithRole {
  user_id: string;
  display_name: string | null;
  role: 'admin' | 'customer';
}

export default function SettingsPage() {
  const { user, displayName, isAdmin } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [currentName, setCurrentName] = useState(displayName);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [allUsers, setAllUsers] = useState<UserWithRole[]>([]);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => { setCurrentName(displayName); }, [displayName]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  const loadUsers = async () => {
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from('profiles').select('user_id, display_name'),
      supabase.from('user_roles').select('user_id, role'),
    ]);

    const profiles = profilesRes.data || [];
    const roles = rolesRes.data || [];

    // Admins can see all profiles now; merge with roles
    const merged: UserWithRole[] = profiles.map(p => {
      const userRole = roles.find(r => r.user_id === p.user_id);
      return {
        user_id: p.user_id,
        display_name: p.display_name,
        role: (userRole?.role as 'admin' | 'customer') || 'customer',
      };
    });
    setAllUsers(merged);
  };

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    if (targetUserId === user?.id) {
      toast.error("You cannot change your own role");
      return;
    }
    setUpdatingRole(targetUserId);
    try {
      const { data, error } = await supabase.functions.invoke('manage-roles', {
        body: { action: 'set_role', target_user_id: targetUserId, role: newRole },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Role updated to ${newRole}`);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update role');
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { toast.error(error.message); return; }
    toast.success('Password updated successfully');
    setNewPassword(''); setConfirmPassword('');
  };

  const handleChangeName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName.trim()) { toast.error('Name cannot be empty'); return; }
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ display_name: newDisplayName.trim() }).eq('user_id', user.id);
    if (error) { toast.error(error.message); return; }
    setCurrentName(newDisplayName.trim());
    setEditingName(false); setNewDisplayName('');
    toast.success('Display name updated');
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-foreground">{currentName}</p>
                  <button onClick={() => { setEditingName(true); setNewDisplayName(currentName); }} className="text-muted-foreground hover:text-primary transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isAdmin ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>
                  {isAdmin ? 'Admin' : 'Customer'}
                </span>
              </div>
            </div>

            {editingName && (
              <form onSubmit={handleChangeName} className="flex items-end gap-3 pt-2 border-t border-border">
                <div className="flex-1">
                  <Label>Display Name</Label>
                  <Input value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} placeholder="Enter new name" className="mt-1" />
                </div>
                <Button type="submit" size="sm">Save</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingName(false)}>Cancel</Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDark ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />} Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sun className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-foreground">Dark Mode</span><Moon className="w-4 h-4 text-muted-foreground" />
              </div>
              <Switch checked={isDark} onCheckedChange={setIsDark} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> Change Password</CardTitle>
            <CardDescription>Update your password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div><Label>New Password</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="mt-1" /></div>
              <div><Label>Confirm Password</Label><Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="mt-1" /></div>
              <Button type="submit">Update Password</Button>
            </form>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> User Role Management</CardTitle>
              <CardDescription>Promote or demote users between Admin and Customer roles</CardDescription>
            </CardHeader>
            <CardContent>
              {allUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users found.</p>
              ) : (
                <div className="space-y-3">
                  {allUsers.map(u => (
                    <div key={u.user_id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          {u.role === 'admin' ? <Crown className="w-4 h-4 text-accent" /> : <User className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{u.display_name || 'Unnamed'}</p>
                          {u.user_id === user?.id && <span className="text-xs text-muted-foreground">(You)</span>}
                        </div>
                      </div>
                      <Select
                        value={u.role}
                        onValueChange={(val) => handleRoleChange(u.user_id, val)}
                        disabled={u.user_id === user?.id || updatingRole === u.user_id}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="customer">Customer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
