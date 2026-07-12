'use strict';
'use client';

import React, { useState } from 'react';
import { useTrips } from '../../modules/trip-ops/hooks/useTrips';
import { TripForm } from '../../modules/trip-ops/components/TripForm';
import { TripLifecycleStepper } from '../../modules/trip-ops/components/TripLifecycleStepper';
import { LiveBoard } from '../../modules/trip-ops/components/LiveBoard';
import { 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  FileText, 
  Truck, 
  User, 
  Navigation,
  RefreshCw 
} from 'lucide-react';
import { useSession } from '@/shared/hooks/useSession';
import { Button } from '@/components/ui/button';

export default function TripsPage() {
  const {
    trips,
    kpis,
    loading,
    kpiLoading,
    page,
    totalPages,
    status,
    search,
    isMutating,
    setPage,
    handleStatusChange,
    handleSearchChange,
    createTrip,
    dispatchTrip,
    completeTrip,
    cancelTrip,
    refetch
  } = useTrips();

  const { profile } = useSession();
  const isDispatcher = profile?.role === 'dispatcher';

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // Find selected trip in current list
  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  const statuses = ['All', 'Draft', 'Dispatched', 'Completed', 'Cancelled'];

  return (
    <div className="space-y-6 text-white min-h-screen bg-zinc-950 p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Trip & Dispatch Operations</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Dispatch vehicles, assign drivers, monitor active loads, and track live dispatches.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
            title="Refresh Feed"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          {isDispatcher && (
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center space-x-1.5 bg-white text-black hover:bg-zinc-200"
            >
              <Plus className="w-4 h-4" />
              <span>New Dispatch</span>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Trips KPI */}
        <div className="p-4 bg-zinc-900/40 border border-zinc-800 backdrop-blur-md rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
              Active Trips (Transit)
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold">
                {kpiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin inline-block" />
                ) : (
                  kpis.activeTrips
                )}
              </span>
            </div>
          </div>
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <Navigation className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Trips KPI */}
        <div className="p-4 bg-zinc-900/40 border border-zinc-800 backdrop-blur-md rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
              Pending Trips (Draft)
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold">
                {kpiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin inline-block" />
                ) : (
                  kpis.pendingTrips
                )}
              </span>
            </div>
          </div>
          <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400">
            <Navigation className="w-5 h-5 rotate-90" />
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main Column - Filters and list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-900/40 border border-zinc-800 backdrop-blur-md rounded-xl p-4 space-y-4 shadow-xl">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2">
              {/* Tabs */}
              <div className="flex border-b border-zinc-900 overflow-x-auto space-x-4">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`pb-2.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                      status === s
                        ? 'border-zinc-50 text-white font-bold'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search location, vehicle or driver..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 pr-3 py-1.5 w-full md:w-60 text-xs bg-zinc-955 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 text-white placeholder-zinc-500 transition-all"
                />
              </div>
            </div>

            {/* Trips List / Table */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <Loader2 className="w-8 h-8 text-zinc-550 animate-spin" />
                <p className="text-xs text-zinc-500">Loading trips...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-2 border border-dashed border-zinc-800 rounded-md bg-zinc-950/20">
                <FileText className="w-10 h-10 text-zinc-700" />
                <p className="text-xs text-zinc-550 font-semibold uppercase tracking-wider">No trips found</p>
                <p className="text-[10px] text-zinc-650">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-widest font-semibold text-[10px]">
                      <th className="py-3 px-2">Route</th>
                      <th className="py-3 px-2">Assignment</th>
                      <th className="py-3 px-2">Cargo / Distance</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trips.map((trip) => {
                      const isExpanded = selectedTripId === trip.id;
                      return (
                        <React.Fragment key={trip.id}>
                          <tr
                            onClick={() => setSelectedTripId(isExpanded ? null : trip.id)}
                            className={`border-b border-zinc-850 hover:bg-zinc-900/10 cursor-pointer transition-all ${
                              isExpanded ? 'bg-zinc-900/10' : ''
                            }`}
                          >
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-1.5 font-medium text-zinc-200">
                                <span>{trip.source}</span>
                                <span className="text-zinc-600">→</span>
                                <span>{trip.destination}</span>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-1 text-zinc-300">
                                  <Truck className="w-3.5 h-3.5 text-zinc-500" />
                                  <span>{trip.vehicle_name} ({trip.vehicle_registration})</span>
                                </div>
                                <div className="flex items-center space-x-1 text-zinc-450">
                                  <User className="w-3.5 h-3.5 text-zinc-500" />
                                  <span>{trip.driver_name}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-zinc-300">
                              <div className="space-y-0.5 font-mono">
                                <div>Cargo: {trip.cargo_weight} kg</div>
                                <div>Dist: {trip.planned_distance} km</div>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  trip.status === 'Draft'
                                    ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                                    : trip.status === 'Dispatched'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : trip.status === 'Completed'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}
                              >
                                {trip.status}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-right">
                              <div className="inline-flex items-center text-zinc-500 hover:text-white transition-all">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </td>
                          </tr>

                          {/* Expanded detail panel for interactive lifecycle controls */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={5} className="py-3 px-4 bg-zinc-950/20 border-b border-zinc-800">
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-850 space-y-1.5">
                                      <h4 className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">
                                        Trip Metrics Detail
                                      </h4>
                                      <div className="grid grid-cols-2 gap-2 text-zinc-300">
                                        <div>Cargo Weight: <span className="font-mono">{trip.cargo_weight} kg</span></div>
                                        <div>Est. Distance: <span className="font-mono">{trip.planned_distance} km</span></div>
                                        {trip.actual_distance && (
                                          <div>Actual Distance: <span className="font-mono">{trip.actual_distance} km</span></div>
                                        )}
                                        {trip.fuel_consumed && (
                                          <div>Fuel Consumed: <span className="font-mono">{trip.fuel_consumed} L</span></div>
                                        )}
                                        {trip.revenue && (
                                          <div>Revenue: <span className="font-mono">₹{trip.revenue.toLocaleString()}</span></div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-850 space-y-1.5 flex flex-col justify-center">
                                      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                        Assigned Resources
                                      </div>
                                      <div className="space-y-1 text-zinc-350">
                                        <div className="flex items-center space-x-1.5">
                                          <Truck className="w-3.5 h-3.5 text-zinc-500" />
                                          <span>{trip.vehicle_name}</span>
                                        </div>
                                        <div className="flex items-center space-x-1.5">
                                          <User className="w-3.5 h-3.5 text-zinc-500" />
                                          <span>{trip.driver_name}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {isDispatcher ? (
                                    <TripLifecycleStepper
                                      trip={trip}
                                      onDispatch={dispatchTrip}
                                      onComplete={completeTrip}
                                      onCancel={cancelTrip}
                                      isMutating={isMutating}
                                    />
                                  ) : (
                                    <div className="p-3 border border-zinc-800/80 bg-zinc-900/10 text-zinc-400 rounded-lg text-xs">
                                      * View-only mode. Only dispatchers have permission to alter the dispatch status lifecycle.
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination controls */}
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
                    className="border-zinc-850 hover:bg-zinc-900 disabled:opacity-40"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="border-zinc-850 hover:bg-zinc-900 disabled:opacity-40"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Live Board Widget */}
        <div className="space-y-4">
          <LiveBoard />
        </div>
      </div>

      {/* Create New Trip Dialog Overlay */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-blue-500" />
                <span>Create Dispatch Request</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-zinc-500 hover:text-white transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>

            <TripForm
              onSuccess={() => {
                setIsCreateOpen(false);
                refetch();
              }}
              onCancel={() => setIsCreateOpen(false)}
              onSubmitTrip={createTrip}
              isSubmitting={isMutating}
            />
          </div>
        </div>
      )}
    </div>
  );
}
