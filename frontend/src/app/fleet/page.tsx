'use client';

import { useState } from 'react';
import { useVehicles } from '@/modules/fleet-identity/hooks/useVehicles';
import VehicleTable from '@/modules/fleet-identity/components/VehicleTable';
import VehicleForm from '@/modules/fleet-identity/components/VehicleForm';
import { useSession } from '@/shared/hooks/useSession';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Vehicle, CreateVehicleInput, UpdateVehicleInput } from '@/shared/types/database.types';

export default function FleetPage() {
  const { vehicles, loading, page, setPage, totalPages, filters, actions } = useVehicles();
  const { profile } = useSession();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const isFleetManager = profile?.role === 'fleet_manager';

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingVehicle(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateVehicleInput | UpdateVehicleInput) => {
    if (editingVehicle) {
      await actions.editVehicle(editingVehicle.id, data);
    } else {
      await actions.addVehicle(data);
    }
  };

  return (
    <div className="space-y-6 text-white min-h-screen bg-zinc-950 p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Fleet Registry</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Register and manage active vehicles, load capacities, odometers, and regions.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => actions.refetch()}
            className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
            title="Refresh Feed"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          {isFleetManager && (
            <Button
              onClick={handleCreate}
              className="flex items-center space-x-1.5 bg-white text-black hover:bg-zinc-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </Button>
          )}
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4 shadow-xl">
        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-zinc-900">
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Status Select */}
            <select
              value={filters.status}
              onChange={(e) => {
                filters.setStatus(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-700"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>

            {/* Region Select */}
            <input
              type="text"
              placeholder="Filter by Region"
              value={filters.region}
              onChange={(e) => {
                filters.setRegion(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1 h-8 text-xs bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-700 text-white placeholder-zinc-500"
            />
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search registry number or name..."
              value={filters.search}
              onChange={(e) => {
                filters.setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-3 py-1.5 w-full md:w-60 text-xs bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-700 text-white placeholder-zinc-500 transition-all"
            />
          </div>
        </div>

        {/* Data Table */}
        <VehicleTable
          vehicles={vehicles}
          loading={loading}
          onEdit={handleEdit}
          onDelete={actions.removeVehicle}
          userRole={profile?.role}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="border-zinc-800 hover:bg-zinc-900 disabled:opacity-40"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="border-zinc-800 hover:bg-zinc-900 disabled:opacity-40"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Form Dialog Overlay */}
      <VehicleForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialValues={editingVehicle}
      />
    </div>
  );
}
