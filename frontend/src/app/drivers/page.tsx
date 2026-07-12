'use client';

import { useSession } from '@/shared/hooks/useSession';
import DriverTable from '@/modules/fleet-identity/components/DriverTable';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DriversPage() {
  const router = useRouter();
  const { user, profile, loading } = useSession();

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
        <Skeleton className="h-12 w-full bg-zinc-800 rounded-xl" />
        <Skeleton className="h-96 w-full bg-zinc-800 rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Authorize: Only fleet_manager and safety_officer can view Drivers page
  const allowedRoles = ['fleet_manager', 'safety_officer'];
  if (profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="max-w-md w-full border border-red-500/20 bg-red-500/5 backdrop-blur-md rounded-2xl p-6 text-center space-y-4">
          <div className="inline-flex rounded-full bg-red-500/10 p-3 text-red-500">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-white">Access Denied</h2>
          <p className="text-sm text-zinc-400">
            Only Fleet Managers and Safety Officers are authorized to view and modify the driver logs.
          </p>
          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-white text-black hover:bg-zinc-200"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return <DriverTable />;
}
