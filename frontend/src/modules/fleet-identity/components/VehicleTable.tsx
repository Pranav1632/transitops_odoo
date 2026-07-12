'use client';

import { useState } from 'react';
import { useVehicles } from '../hooks/useVehicles';
import { useSession } from '../../../shared/hooks/useSession';
import VehicleForm from './VehicleForm';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function VehicleTable() {
  const { profile } = useSession();
  const isManager = profile?.role === 'fleet_manager';

  const {
    vehicles,
    loading,
    page,
    setPage,
    totalPages,
    totalItems,
    filters,
    actions,
  } = useVehicles();

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Status Badge color mapper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Available</Badge>;
      case 'On Trip':
        return <Badge className="bg-sky-500/10 text-sky-500 border-sky-500/20">On Trip</Badge>;
      case 'In Shop':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">In Shop</Badge>;
      case 'Retired':
        return <Badge className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20">Retired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAddSubmit = async (values: any) => {
    setFormLoading(true);
    try {
      await actions.addVehicle(values);
      setIsAddOpen(false);
    } catch (err) {
      // Error handled by useVehicles toast
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!selectedVehicle) return;
    setFormLoading(true);
    try {
      await actions.editVehicle(selectedVehicle.id, values);
      setIsEditOpen(false);
      setSelectedVehicle(null);
    } catch (err) {
      // Error handled by useVehicles toast
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await actions.removeVehicle(id);
      } catch (err) {
        // Error handled by useVehicles toast
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Fleet Registry</h1>
          <p className="text-sm text-zinc-400">Manage and track your company vehicles.</p>
        </div>
        {isManager && (
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-white text-black hover:bg-zinc-200 font-medium"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Vehicle
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl backdrop-blur-md">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search registration..."
            className="pl-9 bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 text-sm focus-visible:ring-zinc-700"
            value={filters.search}
            onChange={(e) => {
              filters.setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Type Filter */}
        <div>
          <select
            className="h-8 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-700"
            value={filters.type}
            onChange={(e) => {
              filters.setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Types</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Trailer">Trailer</option>
            <option value="Car">Car</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            className="h-8 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-700"
            value={filters.status}
            onChange={(e) => {
              filters.setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        {/* Region Filter */}
        <div className="relative">
          <Input
            placeholder="Filter by region..."
            className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 text-sm focus-visible:ring-zinc-700"
            value={filters.region}
            onChange={(e) => {
              filters.setRegion(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="border border-zinc-800 bg-zinc-900/20 rounded-xl overflow-hidden backdrop-blur-md">
        <Table>
          <TableHeader className="bg-zinc-900/60 border-b border-zinc-850">
            <TableRow className="hover:bg-transparent border-zinc-850">
              <TableHead className="text-zinc-400 font-medium px-4">Reg Number</TableHead>
              <TableHead className="text-zinc-400 font-medium">Vehicle Name</TableHead>
              <TableHead className="text-zinc-400 font-medium">Type</TableHead>
              <TableHead className="text-zinc-400 font-medium">Max Load</TableHead>
              <TableHead className="text-zinc-400 font-medium">Odometer</TableHead>
              <TableHead className="text-zinc-400 font-medium">Acquisition Cost</TableHead>
              <TableHead className="text-zinc-400 font-medium">Status</TableHead>
              <TableHead className="text-zinc-400 font-medium">Region</TableHead>
              {isManager && <TableHead className="text-zinc-400 font-medium text-right px-4">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="border-zinc-850">
                  <TableCell className="px-4"><Skeleton className="h-4 w-20 bg-zinc-800" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 bg-zinc-800" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 bg-zinc-800" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 bg-zinc-800" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 bg-zinc-800" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 bg-zinc-800" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 bg-zinc-800 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 bg-zinc-800" /></TableCell>
                  {isManager && <TableCell className="text-right px-4"><Skeleton className="h-8 w-16 ml-auto bg-zinc-800" /></TableCell>}
                </TableRow>
              ))
            ) : vehicles.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={isManager ? 9 : 8} className="h-32 text-center text-zinc-500">
                  No vehicles found in registry.
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle) => (
                <TableRow key={vehicle.id} className="border-zinc-850 hover:bg-zinc-900/30">
                  <TableCell className="font-semibold text-white px-4 uppercase">{vehicle.registration_number}</TableCell>
                  <TableCell className="text-zinc-300">{vehicle.name}</TableCell>
                  <TableCell className="text-zinc-300">{vehicle.type}</TableCell>
                  <TableCell className="text-zinc-300">{Number(vehicle.max_load_capacity).toLocaleString()} kg</TableCell>
                  <TableCell className="text-zinc-300">{Number(vehicle.odometer).toLocaleString()} km</TableCell>
                  <TableCell className="text-zinc-300">${Number(vehicle.acquisition_cost).toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                  <TableCell className="text-zinc-300">{vehicle.region || '—'}</TableCell>
                  {isManager && (
                    <TableCell className="text-right px-4 space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => handleDelete(vehicle.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
          <p className="text-sm text-zinc-500">
            Showing <span className="font-medium text-zinc-400">{vehicles.length}</span> of{' '}
            <span className="font-medium text-zinc-400">{totalItems}</span> vehicles
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-850 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-zinc-400">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-850 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add Vehicle Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-zinc-900 border border-zinc-800 max-w-lg text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Add New Vehicle</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <VehicleForm
              onSubmit={handleAddSubmit}
              onCancel={() => setIsAddOpen(false)}
              loading={formLoading}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-zinc-900 border border-zinc-800 max-w-lg text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Edit Vehicle Details</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {selectedVehicle && (
              <VehicleForm
                vehicle={selectedVehicle}
                onSubmit={handleEditSubmit}
                onCancel={() => {
                  setIsEditOpen(false);
                  setSelectedVehicle(null);
                }}
                loading={formLoading}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
