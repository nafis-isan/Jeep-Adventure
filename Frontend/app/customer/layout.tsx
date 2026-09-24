'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (user?.role !== 'CUSTOMER') {
      router.replace('/fasilitator/dashboard');
    }
  }, [loading, isAuthenticated, user, pathname, router]);

  if (loading || !isAuthenticated || user?.role !== 'CUSTOMER') return null;
  return children;
}