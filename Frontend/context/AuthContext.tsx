'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'FACILITATOR';
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function isPublicAuthPage(pathname: string) {
  return pathname === '/login' || pathname === '/register';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authRequestRef = useRef(0);
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = useCallback(async () => {
    const requestId = ++authRequestRef.current;
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
      if (requestId !== authRequestRef.current) return;
      if (!response.ok) {
        setUser(null);
        if (!isPublicAuthPage(pathname)) router.push('/login');
        return;
      }

      const data = await response.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
      if (!isPublicAuthPage(pathname)) router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || 'Email atau password salah');
      }

      authRequestRef.current += 1;
      setUser(payload.user);
      router.push(payload.user.role === 'FACILITATOR' ? '/fasilitator/dashboard' : '/customer/dashboard');
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Backend tidak dapat dihubungi. Pastikan server berjalan di port 4000.');
      }
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore logout failures and still clear client state
    }

    setUser(null);
    router.push('/login');
  }, [router]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  }), [user, login, logout, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
