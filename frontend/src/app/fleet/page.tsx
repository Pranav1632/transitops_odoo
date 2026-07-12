'use client';

import { useState } from 'react';
import { useVehicles } from '@/modules/fleet-identity/hooks/useVehicles';
import VehicleTable from '@/modules/fleet-identity/components/VehicleTable';
import VehicleForm from '@/modules/fleet-identity/components/VehicleForm';
import { useSession } from '@/shared/hooks/useSession';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { CreateVehicleInput, UpdateVehicleInput } from '@/shared/types/database.types';
import { Vehicle } from '@/modules/fleet-identity/api/fleetApi';

export default function FleetPage() {
  const { vehicles, loading, page, setPage, totalPages, filters, actions } = useVehicles();
  const { profile } = useSession();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const isFleetManager = profile?.role === 'fleet_manager';

  const handleEdit = (vehicle: Vehicle) => { setEditingVehicle(vehicle); setIsFormOpen(true); };
  const handleCreate = () => { setEditingVehicle(null); setIsFormOpen(true); };
  const handleFormSubmit = async (data: CreateVehicleInput | UpdateVehicleInput) => {
    if (editingVehicle) await actions.editVehicle(editingVehicle.id, data as UpdateVehicleInput);
    else await actions.addVehicle(data as CreateVehicleInput);
  };

  return (
    <div className="max-w-screen-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Fleet Registry</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Register and manage active vehicles, load capacities, odometers, and regions.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => actions.refetch()}
            className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all bg-white dark:bg-zinc-900"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isFleetManager && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Vehicle
            </button>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filters.status}
              onChange={(e) => { filters.setStatus(e.target.value); setPage(1); }}
              className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
            <input
              type="text"
              placeholder="Filter by Region"
              value={filters.region}
              onChange={(e) => { filters.setRegion(e.target.value); setPage(1); }}
              className="px-3 py-1 h-8 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-zinc-700 dark:text-zinc-300 placeholder-zinc-400"
            />
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search registry number or name..."
              value={filters.search}
              onChange={(e) => { filters.setSearch(e.target.value); setPage(1); }}
              className="pl-8 pr-4 py-1.5 w-full md:w-64 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
            />
          </div>
        </div>

        {/* Data Table */}
        <VehicleTable vehicles={vehicles} loading={loading} onEdit={handleEdit} onDelete={actions.removeVehicle} userRole={profile?.role} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-400 font-medium">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-40 transition-all text-zinc-600 dark:text-zinc-400">Previous</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-40 transition-all text-zinc-600 dark:text-zinc-400">Next</button>
            </div>
          </div>
        )}
      </div>

      <VehicleForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialValues={editingVehicle ? { ...editingVehicle, region: editingVehicle.region ?? null } : undefined}
      />
    </div>
  );
}
