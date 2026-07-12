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
  Activity, 
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
    <div className="space-y-6 text-white min-h-screen bg-black p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Trip & Dispatch Operations</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Dispatch vehicles, assign drivers, monitor active loads, and track live dispatches.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => refetch()}
            className="p-2 border border-neutral-800 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer"
            title="Refresh Feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold bg-white text-black hover:bg-neutral-200 rounded-md shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Dispatch</span>
          </button>
        </div>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Trips KPI */}
        <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-lg flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
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
          <div className="p-2 bg-blue-950/20 border border-blue-900/40 rounded-lg text-blue-400">
            <Navigation className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Trips KPI */}
        <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-lg flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
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
          <div className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main Column - Filters and list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-neutral-950 border border-neutral-900 rounded-lg p-4 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2">
              {/* Tabs */}
              <div className="flex border-b border-neutral-900 overflow-x-auto space-x-4">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`pb-2.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                      status === s
                        ? 'border-white text-white font-bold'
                        : 'border-transparent text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search location, vehicle or driver..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 pr-3 py-1.5 w-full md:w-60 text-xs bg-neutral-900 border border-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 text-white placeholder-neutral-500 transition-all"
                />
              </div>
            </div>

            {/* Trips List / Table */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <Loader2 className="w-8 h-8 text-neutral-500 animate-spin" />
                <p className="text-xs text-neutral-400">Loading trips...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-2 border border-dashed border-neutral-900 rounded-md">
                <FileText className="w-10 h-10 text-neutral-700" />
                <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">No trips found</p>
                <p className="text-[10px] text-neutral-600">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-900 text-neutral-500 uppercase tracking-widest font-semibold text-[10px]">
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
                            className={`border-b border-neutral-900 hover:bg-neutral-900/40 cursor-pointer transition-all ${
                              isExpanded ? 'bg-neutral-900/30' : ''
                            }`}
                          >
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-1.5 font-medium text-neutral-200">
                                <span>{trip.source}</span>
                                <span className="text-neutral-600">→</span>
                                <span>{trip.destination}</span>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-1 text-neutral-300">
                                  <Truck className="w-3.5 h-3.5 text-neutral-500" />
                                  <span>{trip.vehicle_name} ({trip.vehicle_registration})</span>
                                </div>
                                <div className="flex items-center space-x-1 text-neutral-400">
                                  <User className="w-3.5 h-3.5 text-neutral-500" />
                                  <span>{trip.driver_name}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-neutral-300">
                              <div className="space-y-0.5 font-mono">
                                <div>Cargo: {trip.cargo_weight} kg</div>
                                <div>Dist: {trip.planned_distance} km</div>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  trip.status === 'Draft'
                                    ? 'bg-neutral-800 text-neutral-300'
                                    : trip.status === 'Dispatched'
                                    ? 'bg-blue-950/40 text-blue-400 border border-blue-900/40'
                                    : trip.status === 'Completed'
                                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                                    : 'bg-red-950/40 text-red-400 border border-red-900/40'
                                }`}
                              >
                                {trip.status}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-right">
                              <div className="inline-flex items-center text-neutral-500 hover:text-white transition-all">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </td>
                          </tr>

                          {/* Expanded detail panel for interactive lifecycle controls */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={5} className="py-3 px-4 bg-neutral-950 border-b border-neutral-900">
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div className="p-3 bg-neutral-900/30 rounded border border-neutral-900 space-y-1.5">
                                      <h4 className="font-semibold text-neutral-400 uppercase tracking-wider text-[10px]">
                                        Trip Metrics Detail
                                      </h4>
                                      <div className="grid grid-cols-2 gap-2 text-neutral-300">
                                        <div>Cargo Weight: <span className="font-mono">{trip.cargo_weight} kg</span></div>
                                        <div>Est. Distance: <span className="font-mono">{trip.planned_distance} km</span></div>
                                        {trip.actual_distance && (
                                          <div>Actual Distance: <span className="font-mono">{trip.actual_distance} km</span></div>
                                        )}
                                        {trip.fuel_consumed && (
                                          <div>Fuel Consumed: <span className="font-mono">{trip.fuel_consumed} L</span></div>
                                        )}
                                        {trip.revenue && (
                                          <div>Revenue: <span className="font-mono">${trip.revenue}</span></div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="p-3 bg-neutral-900/30 rounded border border-neutral-900 space-y-1.5 flex flex-col justify-center">
                                      <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                                        Assigned Resources
                                      </div>
                                      <div className="space-y-1 text-neutral-300">
                                        <div className="flex items-center space-x-1.5">
                                          <Truck className="w-3.5 h-3.5 text-neutral-500" />
                                          <span>{trip.vehicle_name}</span>
                                        </div>
                                        <div className="flex items-center space-x-1.5">
                                          <User className="w-3.5 h-3.5 text-neutral-500" />
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
              <div className="flex items-center justify-between pt-4 border-t border-neutral-900">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-semibold border border-neutral-800 hover:bg-neutral-900 rounded disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs font-semibold border border-neutral-800 hover:bg-neutral-900 rounded disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-blue-500" />
                <span>Create Dispatch Request</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-neutral-500 hover:text-white transition-all cursor-pointer"
              >
                <span className="sr-only">Close</span>
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
