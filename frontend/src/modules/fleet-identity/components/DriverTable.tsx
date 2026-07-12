'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Users, AlertCircle } from 'lucide-react';
import { Driver } from '../api/fleetApi';

interface DriverTableProps {
  drivers: Driver[];
  loading: boolean;
  onEdit: (driver: Driver) => void;
  onDelete: (id: string) => void;
  userRole?: string;
}

export default function DriverTable({ drivers, loading, onEdit, onDelete, userRole }: DriverTableProps) {
  const hasWriteAccess = userRole === 'fleet_manager' || userRole === 'safety_officer';

  const getStatusBadge = (status: Driver['status']) => {
    switch (status) {
      case 'Available':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-medium">
            Available
          </Badge>
        );
      case 'On Trip':
        return (
          <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/20 font-medium">
            On Trip
          </Badge>
        );
      case 'Off Duty':
        return (
          <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 font-medium">
            Off Duty
          </Badge>
        );
      case 'Suspended':
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 font-medium">
            Suspended
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const checkLicenseExpiry = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);

    const isExpired = expiry < today;

    // Warning if expiring within 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const isExpiringSoon = expiry <= thirtyDaysFromNow && expiry >= today;

    return { isExpired, isExpiringSoon };
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        <div className="h-8 bg-zinc-800/40 rounded animate-pulse w-full" />
        <div className="h-8 bg-zinc-800/40 rounded animate-pulse w-full" />
        <div className="h-8 bg-zinc-800/40 rounded animate-pulse w-full" />
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/20">
        <Users className="h-10 w-10 text-zinc-600 mb-3" />
        <h5 className="font-bold text-zinc-300">No drivers registered</h5>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs">
          Start by adding a new driver to your registry.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/20">
      <Table>
        <TableHeader className="bg-zinc-900/40">
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400 font-medium px-4">Name</TableHead>
            <TableHead className="text-zinc-400 font-medium">License Number</TableHead>
            <TableHead className="text-zinc-400 font-medium">Category</TableHead>
            <TableHead className="text-zinc-400 font-medium">Expiry Date</TableHead>
            <TableHead className="text-zinc-400 font-medium">Contact Number</TableHead>
            <TableHead className="text-zinc-400 font-medium">Safety Score</TableHead>
            <TableHead className="text-zinc-400 font-medium">Status</TableHead>
            {hasWriteAccess && <TableHead className="text-zinc-400 font-medium text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => {
            const { isExpired, isExpiringSoon } = checkLicenseExpiry(driver.license_expiry);

            return (
              <TableRow key={driver.id} className="border-zinc-800 hover:bg-zinc-900/10">
                <TableCell className="font-semibold text-white px-4 py-3">
                  {driver.name}
                </TableCell>
                <TableCell className="text-zinc-350">{driver.license_number}</TableCell>
                <TableCell className="text-zinc-350">{driver.license_category}</TableCell>
                <TableCell className="py-3 font-medium">
                  <div className="flex items-center gap-1.5">
                    {isExpired ? (
                      <span className="text-red-500 font-bold flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {driver.license_expiry} (Expired)
                      </span>
                    ) : isExpiringSoon ? (
                      <span className="text-amber-500 font-semibold flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {driver.license_expiry} (Expiring Soon)
                      </span>
                    ) : (
                      <span className="text-zinc-300">{driver.license_expiry}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-zinc-350">{driver.contact_number || '—'}</TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-semibold font-mono ${
                      driver.safety_score >= 85 ? 'text-emerald-500' : driver.safety_score >= 70 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {driver.safety_score}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">/100</span>
                  </div>
                </TableCell>
                <TableCell className="py-3">{getStatusBadge(driver.status)}</TableCell>
                {hasWriteAccess && (
                  <TableCell className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(driver)}
                        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete driver ${driver.name}?`)) {
                            onDelete(driver.id);
                          }
                        }}
                        className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
