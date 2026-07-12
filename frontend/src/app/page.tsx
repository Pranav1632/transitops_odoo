'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/shared/hooks/useSession';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useSession();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
      <div className="space-y-4 text-center">
        <div className="h-8 w-32 animate-pulse rounded bg-zinc-800 mx-auto" />
        <p className="text-sm text-zinc-500">Redirecting...</p>
      </div>
    </div>
  );
}

