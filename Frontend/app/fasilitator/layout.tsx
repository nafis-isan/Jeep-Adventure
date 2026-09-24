'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function FacilitatorLayout({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (user?.role !== 'FACILITATOR') {
      router.replace('/customer/dashboard');
    }
  }, [loading, isAuthenticated, user, pathname, router]);

  if (loading || !isAuthenticated || user?.role !== 'FACILITATOR') return null;
  return children;
}