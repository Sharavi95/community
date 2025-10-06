import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  username: string | null;
  role: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'auth_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem(SESSION_KEY);
    if (storedSession) {
      try {
        const userData = JSON.parse(storedSession);
        setUser(userData);
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('users_local')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('Invalid email or password');
        } else {
          toast.error('An error occurred during sign in');
        }
        return false;
      }

      if (data) {
        const userData: User = {
          id: data.id,
          email: data.email,
          username: data.username,
          role: data.role,
          avatar_url: data.avatar_url,
        };

        setUser(userData);
        localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
        toast.success(`Welcome back, ${userData.username || userData.email}!`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An unexpected error occurred');
      return false;
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    toast.success('Signed out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
