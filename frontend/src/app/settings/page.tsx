'use client';

import { useSession } from '@/shared/hooks/useSession';
import SettingsForm from '@/modules/fleet-identity/components/SettingsForm';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useSession();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-zinc-800" />
          <Skeleton className="h-4 w-72 bg-zinc-800" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 bg-zinc-850 rounded-xl lg:col-span-1" />
          <Skeleton className="h-80 bg-zinc-850 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return <SettingsForm />;
}
