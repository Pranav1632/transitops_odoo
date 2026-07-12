'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/shared/hooks/useSession';
import { getFleetKpisApi } from '@/modules/fleet-identity/api/fleetApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Truck, CheckCircle2, AlertTriangle, Users, Route, Wrench, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useSession();
  const [kpis, setKpis] = useState<any>(null);
  const [kpisLoading, setKpisLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchKpis = async () => {
      try {
        const data = await getFleetKpisApi();
        setKpis(data);
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to load dashboard KPIs');
      } finally {
        setKpisLoading(false);
      }
    };

    fetchKpis();
  }, [user]);

  if (authLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-zinc-800" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 bg-zinc-850 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Operations Dashboard</h1>
        <p className="text-sm text-zinc-400">Real-time overview of fleet identity and logistics statistics.</p>
      </div>

      {/* Module A KPIs Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-300">Fleet & Personnel Registry (Module A)</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Vehicles */}
          <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-400">Active Vehicles</CardTitle>
              <div className="rounded-full bg-sky-500/10 p-2 text-sky-500">
                <Truck className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {kpisLoading ? (
                <Skeleton className="h-8 w-16 bg-zinc-800" />
              ) : (
                <div className="text-2xl font-bold text-white">{kpis?.activeVehicles || 0}</div>
              )}
              <p className="text-xs text-zinc-500 mt-1">Currently on a trip</p>
            </CardContent>
          </Card>

          {/* Card 2: Available Vehicles */}
          <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-400">Available Vehicles</CardTitle>
              <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {kpisLoading ? (
                <Skeleton className="h-8 w-16 bg-zinc-800" />
              ) : (
                <div className="text-2xl font-bold text-white">{kpis?.availableVehicles || 0}</div>
              )}
              <p className="text-xs text-zinc-500 mt-1">Ready for dispatch</p>
            </CardContent>
          </Card>

          {/* Card 3: Vehicles in Shop */}
          <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-400">In Shop</CardTitle>
              <div className="rounded-full bg-amber-500/10 p-2 text-amber-500">
                <Wrench className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {kpisLoading ? (
                <Skeleton className="h-8 w-16 bg-zinc-800" />
              ) : (
                <div className="text-2xl font-bold text-white">{kpis?.vehiclesInMaintenance || 0}</div>
              )}
              <p className="text-xs text-zinc-500 mt-1">Undergoing maintenance</p>
            </CardContent>
          </Card>

          {/* Card 4: Drivers On Duty */}
          <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-400">Drivers On Duty</CardTitle>
              <div className="rounded-full bg-indigo-500/10 p-2 text-indigo-500">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {kpisLoading ? (
                <Skeleton className="h-8 w-16 bg-zinc-800" />
              ) : (
                <div className="text-2xl font-bold text-white">{kpis?.driversOnDuty || 0}</div>
              )}
              <p className="text-xs text-zinc-500 mt-1">Active or standby</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Placeholders for future modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-800">
        {/* Module B Placeholder */}
        <div className="border border-dashed border-zinc-800 rounded-2xl p-6 bg-zinc-900/10 flex flex-col justify-center items-center text-center space-y-3">
          <div className="rounded-full bg-zinc-900 p-3 text-zinc-500">
            <Route className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-300">Trip & Dispatch Operations</h3>
            <p className="text-xs text-zinc-500 max-w-xs mt-1">
              Module B widgets will compose live tracking boards and dispatch status updates.
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase tracking-widest">
            Module B Pending
          </span>
        </div>

        {/* Module C Placeholder */}
        <div className="border border-dashed border-zinc-800 rounded-2xl p-6 bg-zinc-900/10 flex flex-col justify-center items-center text-center space-y-3">
          <div className="rounded-full bg-zinc-900 p-3 text-zinc-500">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-300">Maintenance & ROI Analytics</h3>
            <p className="text-xs text-zinc-500 max-w-xs mt-1">
              Module C widgets will render expense breakdowns, cost graphs, and CSV outputs.
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase tracking-widest">
            Module C Pending
          </span>
        </div>
      </div>
    </div>
  );
}
