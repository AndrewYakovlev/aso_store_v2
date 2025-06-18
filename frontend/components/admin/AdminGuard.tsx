'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'MANAGER')[];
}

export function AdminGuard({ 
  children, 
  allowedRoles = ['ADMIN', 'MANAGER'] 
}: AdminGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/account?redirect=/panel');
      } else if (!allowedRoles.includes(user.role as any)) {
        router.push('/');
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role as any)) {
    return null;
  }

  return <>{children}</>;
}