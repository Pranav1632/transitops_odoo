'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Truck, AlertTriangle } from 'lucide-react';
import { Vehicle } from '../api/fleetApi';

interface VehicleTableProps {
  vehicles: Vehicle[];
  loading: boolean;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
  userRole?: string;
}

export default function VehicleTable({ vehicles, loading, onEdit, onDelete, userRole }: VehicleTableProps) {
  const isFleetManager = userRole === 'fleet_manager';

  const getStatusBadge = (status: Vehicle['status']) => {
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
      case 'In Shop':
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-medium">
            In Shop
          </Badge>
        );
      case 'Retired':
        return (
          <Badge className="bg-zinc-800 text-zinc-500 border-zinc-700 font-medium">
            Retired
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/20">
        <Truck className="h-10 w-10 text-zinc-600 mb-3" />
        <h5 className="font-bold text-zinc-300">No vehicles registered</h5>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs">
          Start by adding a new vehicle to your registry.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/20">
      <Table>
        <TableHeader className="bg-zinc-900/40">
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400 font-medium px-4">Registration</TableHead>
            <TableHead className="text-zinc-400 font-medium">Model / Name</TableHead>
            <TableHead className="text-zinc-400 font-medium">Type</TableHead>
            <TableHead className="text-zinc-400 font-medium">Capacity</TableHead>
            <TableHead className="text-zinc-400 font-medium">Odometer</TableHead>
            <TableHead className="text-zinc-400 font-medium">Status</TableHead>
            <TableHead className="text-zinc-400 font-medium">Region</TableHead>
            {isFleetManager && <TableHead className="text-zinc-400 font-medium text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id} className="border-zinc-800 hover:bg-zinc-900/10">
              <TableCell className="font-semibold text-white px-4 py-3">
                {vehicle.registration_number}
              </TableCell>
              <TableCell className="text-zinc-350">{vehicle.name}</TableCell>
              <TableCell className="text-zinc-350">{vehicle.type}</TableCell>
              <TableCell className="text-zinc-350 font-mono">{vehicle.max_load_capacity.toLocaleString()} kg</TableCell>
              <TableCell className="text-zinc-350 font-mono">{vehicle.odometer.toLocaleString()} km</TableCell>
              <TableCell className="py-3">{getStatusBadge(vehicle.status)}</TableCell>
              <TableCell className="text-zinc-450">{vehicle.region || '—'}</TableCell>
              {isFleetManager && (
                <TableCell className="py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(vehicle)}
                      className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete vehicle ${vehicle.registration_number}?`)) {
                          onDelete(vehicle.id);
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
