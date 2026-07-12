'use client';

import { useSession } from '../../../shared/hooks/useSession';
import { logoutApi } from '../api/fleetApi';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { LogOut, User, Shield, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsForm() {
  const router = useRouter();
  const { user, profile } = useSession();

  const handleLogout = async () => {
    try {
      // Invalidate on backend
      await logoutApi();
      
      // Clear local auth tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-token');
        localStorage.removeItem('sb-profile');
      }

      toast.success('Logged out successfully');
      router.push('/login');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to log out');
    }
  };

  // RBAC Permission data
  const permissions = [
    {
      resource: 'Vehicles Registry',
      fleet_manager: 'Read / Write',
      dispatcher: 'Read Only',
      safety_officer: 'Read Only',
      financial_analyst: 'Read Only',
    },
    {
      resource: 'Drivers Management',
      fleet_manager: 'Read / Write',
      dispatcher: 'Read Only',
      safety_officer: 'Read / Write',
      financial_analyst: 'Read Only',
    },
    {
      resource: 'Trip Dispatching',
      fleet_manager: 'Read Only',
      dispatcher: 'Read / Write',
      safety_officer: 'Read Only',
      financial_analyst: 'Read Only',
    },
    {
      resource: 'Maintenance Logs',
      fleet_manager: 'Read / Write',
      dispatcher: 'Read Only',
      safety_officer: 'Read Only',
      financial_analyst: 'Read / Write',
    },
    {
      resource: 'Fuel & Expenses',
      fleet_manager: 'Read / Write',
      dispatcher: 'Read Only',
      safety_officer: 'Read Only',
      financial_analyst: 'Read / Write',
    },
    {
      resource: 'Analytics & ROI',
      fleet_manager: 'Read Only',
      dispatcher: 'Read Only',
      safety_officer: 'Read Only',
      financial_analyst: 'Read / Write',
    },
  ];

  const getPermissionBadge = (perm: string) => {
    if (perm === 'Read / Write') {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-medium">
          <Check className="h-3 w-3 mr-1" /> Write
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-zinc-950 border-zinc-800 text-zinc-400 font-normal">
        Read
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">System Settings</h1>
        <p className="text-sm text-zinc-400">View user session and role-based permissions matrix.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-md lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="h-5 w-5 text-zinc-400" /> User Profile
            </CardTitle>
            <CardDescription className="text-zinc-500">Current session details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs text-zinc-500 block uppercase font-semibold">Full Name</span>
              <span className="text-sm text-white font-medium">{profile?.full_name || '—'}</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-zinc-500 block uppercase font-semibold">Email Address</span>
              <span className="text-sm text-zinc-300 truncate block">{user?.email || '—'}</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-zinc-500 block uppercase font-semibold">Assigned Role</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Shield className="h-3.5 w-3.5 text-sky-400" />
                <span className="text-sm font-semibold text-sky-400 uppercase tracking-wide">
                  {profile?.role ? profile.role.replace('_', ' ') : '—'}
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-800">
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
              >
                <LogOut className="h-4 w-4 mr-2" /> Log Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RBAC Matrix Card */}
        <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-md lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-zinc-400" /> RBAC Permissions Matrix
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Enterprise security mappings showing authorized access by role.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/20">
            <Table>
              <TableHeader className="bg-zinc-900/40">
                <TableRow className="border-zinc-850 hover:bg-transparent">
                  <TableHead className="text-zinc-400 font-medium px-4">Workspace Resource</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Fleet Mgr</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Dispatcher</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Safety Ofc</TableHead>
                  <TableHead className="text-zinc-400 font-medium">Finance Anal.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((perm, idx) => (
                  <TableRow key={idx} className="border-zinc-850 hover:bg-zinc-900/10">
                    <TableCell className="font-medium text-white px-4 py-3">{perm.resource}</TableCell>
                    <TableCell className="py-3">{getPermissionBadge(perm.fleet_manager)}</TableCell>
                    <TableCell className="py-3">{getPermissionBadge(perm.dispatcher)}</TableCell>
                    <TableCell className="py-3">{getPermissionBadge(perm.safety_officer)}</TableCell>
                    <TableCell className="py-3">{getPermissionBadge(perm.financial_analyst)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
