import React, { useEffect, useState, createContext, useContext } from 'react';
interface User {
  id: string;
  name: string;
  email: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
}
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({
  children
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Simulate loading user data - start with signed out state for demo
    setTimeout(() => {
      // For demo purposes, start signed out to show CTA buttons
      setUser(null);
      setIsLoading(false);
    }, 1000);
  }, []);
  const login = (userData: User) => {
    setUser(userData);
    setIsLoading(false);
  };
  const logout = () => {
    setUser(null);
  };
  return <AuthContext.Provider value={{
    user,
    isLoading,
    login,
    logout
  }}>
      {children}
    </AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}