'use client';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingState from '../shared/LoadingState';

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/api/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!user) {
    return null; // Will redirect
  }

  return <>{children}</>;
}

