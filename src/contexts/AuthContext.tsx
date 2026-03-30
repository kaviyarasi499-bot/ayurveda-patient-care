import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  displayName: string;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, isAdmin: false, loading: true, displayName: '',
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch role and profile using setTimeout to avoid Supabase deadlock
          setTimeout(async () => {
            const { data: roles } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id);
            setIsAdmin(roles?.some(r => r.role === 'admin') ?? false);

            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('user_id', session.user.id)
              .single();
            setDisplayName(profile?.display_name || session.user.email || '');
          }, 0);
        } else {
          setIsAdmin(false);
          setDisplayName('');
        }
        setLoading(false);
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, displayName, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
