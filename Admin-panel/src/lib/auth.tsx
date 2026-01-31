import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Simplified User/Session types since we removed Supabase
interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface Session {
  user: User;
  access_token: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  sendOtp: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, otp: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check localStorage for persisted session
    const storedSession = localStorage.getItem('admin_session');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
        setUser(parsedSession.user);
        setIsAdmin(true);
      } catch (e) {
        console.error('Failed to parse session', e);
        localStorage.removeItem('admin_session');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.message || 'Login failed') };
      }

      const adminUser: User = {
        id: data.admin.id,
        email: data.admin.email,
        user_metadata: { full_name: data.admin.fullName },
      };

      const adminSession: Session = {
        user: adminUser,
        access_token: 'dummy-token', // We can implement real JWT later if needed
      };

      setSession(adminSession);
      setUser(adminUser);
      setIsAdmin(true);
      localStorage.setItem('admin_session', JSON.stringify(adminSession));

      return { error: null };

    } catch (err: any) {
      console.error('Login error:', err);
      return { error: new Error(err.message || 'Network error') };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.message || 'Signup failed') };
      }

      return { error: null };

    } catch (err: any) {
      console.error('Signup error:', err);
      return { error: new Error(err.message || 'Network error') };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('admin_session');
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  const sendOtp = async (email: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/security/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) return { error: new Error(data.message || 'Failed to send OTP') };
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.message || 'Network error') };
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/security/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) return { error: new Error(data.message || 'Invalid OTP') };
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.message || 'Network error') };
    }
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/security/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) return { error: new Error(data.message || 'Failed to reset password') };
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.message || 'Network error') };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isAdmin, signIn, signUp, signOut, sendOtp, verifyOtp, resetPassword }}>
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