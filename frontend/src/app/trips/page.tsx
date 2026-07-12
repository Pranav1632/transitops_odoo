'use strict';
'use client';

import React, { useState } from 'react';
import { useTrips } from '../../modules/trip-ops/hooks/useTrips';
import { TripForm } from '../../modules/trip-ops/components/TripForm';
import { TripLifecycleStepper } from '../../modules/trip-ops/components/TripLifecycleStepper';
import { LiveBoard } from '../../modules/trip-ops/components/LiveBoard';
import { Trip } from '../../modules/trip-ops/api/tripApi';
import { 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  FileText, 
  MapPin, 
  Truck, 
  User, 
  Clock, 
  Navigation,
  RefreshCw 
} from 'lucide-react';

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

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // Find selected trip in current list
  const selectedTrip = trips.find((t) => t.id === selectedTripId);
  const statuses = ['All', 'Draft', 'Dispatched', 'Completed', 'Cancelled'];

  return (
    <div className="space-y-6 text-zinc-950 dark:text-zinc-50 min-h-screen p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Trip & Dispatch Operations</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Dispatch vehicles, assign drivers, monitor active loads, and track live dispatches.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => refetch()}
            className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer bg-white dark:bg-zinc-950"
            title="Refresh Feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Dispatch</span>
          </button>
        </div>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Trips KPI */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
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
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
            <Navigation className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Trips KPI */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
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
          <div className="p-3 bg-zinc-100 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main Column - Filters and list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6 shadow-sm">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              {/* Tabs */}
              <div className="flex overflow-x-auto space-x-6">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                      status === s
                        ? 'border-emerald-600 text-emerald-600 font-bold'
                        : 'border-transparent text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search location, vehicle or driver..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full md:w-60 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-zinc-950 dark:text-white placeholder-zinc-400 transition-all"
                />
              </div>
            </div>

            {/* Trips List / Table */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
                <p className="text-xs text-zinc-500">Loading trips...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                <FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">No trips found</p>
                <p className="text-[10px] text-zinc-450 dark:text-zinc-650">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-150 dark:border-zinc-800 text-zinc-500 uppercase tracking-widest font-semibold text-[10px]">
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
                            className={`border-b border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-950/40 cursor-pointer transition-all ${
                              isExpanded ? 'bg-zinc-50/50 dark:bg-zinc-950/20' : ''
                            }`}
                          >
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-1.5 font-medium text-zinc-900 dark:text-zinc-200">
                                <span>{trip.source}</span>
                                <span className="text-zinc-400 dark:text-zinc-650">→</span>
                                <span>{trip.destination}</span>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-1.5 text-zinc-700 dark:text-zinc-300">
                                  <Truck className="w-3.5 h-3.5 text-zinc-400" />
                                  <span>{trip.vehicle_name} ({trip.vehicle_registration})</span>
                                </div>
                                <div className="flex items-center space-x-1.5 text-zinc-550 dark:text-zinc-400">
                                  <User className="w-3.5 h-3.5 text-zinc-400" />
                                  <span>{trip.driver_name}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-zinc-700 dark:text-zinc-300">
                              <div className="space-y-0.5 font-mono text-[11px]">
                                <div>Cargo: {trip.cargo_weight} kg</div>
                                <div>Dist: {trip.planned_distance} km</div>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <span
                                className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                                  trip.status === 'Draft'
                                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-850 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                                    : trip.status === 'Dispatched'
                                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40'
                                    : trip.status === 'Completed'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
                                    : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40'
                                }`}
                              >
                                {trip.status}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-right">
                              <div className="inline-flex items-center text-zinc-450 hover:text-zinc-800 dark:hover:text-white transition-all">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </td>
                          </tr>

                          {/* Expanded detail panel for interactive lifecycle controls */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={5} className="py-4 px-6 bg-zinc-50/30 dark:bg-zinc-950/10 border-b border-zinc-150 dark:border-zinc-800">
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                                      <h4 className="font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                                        Trip Metrics Detail
                                      </h4>
                                      <div className="grid grid-cols-2 gap-2 text-zinc-700 dark:text-zinc-300">
                                        <div>Cargo Weight: <span className="font-mono font-medium">{trip.cargo_weight} kg</span></div>
                                        <div>Est. Distance: <span className="font-mono font-medium">{trip.planned_distance} km</span></div>
                                        {trip.actual_distance && (
                                          <div>Actual Distance: <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{trip.actual_distance} km</span></div>
                                        )}
                                        {trip.fuel_consumed && (
                                          <div>Fuel Consumed: <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{trip.fuel_consumed} L</span></div>
                                        )}
                                        {trip.revenue && (
                                          <div>Revenue: <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">₹{trip.revenue}</span></div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2 flex flex-col justify-center">
                                      <div className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                        Assigned Resources
                                      </div>
                                      <div className="space-y-1.5 text-zinc-750 dark:text-zinc-300">
                                        <div className="flex items-center space-x-2">
                                          <Truck className="w-4 h-4 text-zinc-400" />
                                          <span>{trip.vehicle_name}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <User className="w-4 h-4 text-zinc-400" />
                                          <span>{trip.driver_name}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <TripLifecycleStepper
                                    trip={trip}
                                    onDispatch={dispatchTrip}
                                    onComplete={completeTrip}
                                    onCancel={cancelTrip}
                                    isMutating={isMutating}
                                  />
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
              <div className="flex items-center justify-between pt-4 border-t border-zinc-150 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-950"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-950"
                  >
                    Next
                  </button>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span>Create Dispatch Request</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer"
              >
                <Plus className="w-5 h-5 rotate-45" />
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
