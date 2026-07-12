'use client';

import React, { useState } from 'react';
import { useTrips } from '../../modules/trip-ops/hooks/useTrips';
import { TripForm } from '../../modules/trip-ops/components/TripForm';
import { TripLifecycleStepper } from '../../modules/trip-ops/components/TripLifecycleStepper';
import { LiveBoard } from '../../modules/trip-ops/components/LiveBoard';
import {
  Plus, Search, ChevronDown, ChevronUp, Loader2,
  FileText, Truck, User, Clock, Navigation, RefreshCw,
  MoreHorizontal
} from 'lucide-react';

const statusConfig: Record<string, { label: string; className: string }> = {
  Draft:       { label: 'Draft',       className: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300' },
  Dispatched:  { label: 'In Transit',  className: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' },
  Completed:   { label: 'Completed',   className: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' },
  Cancelled:   { label: 'Cancelled',   className: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800' },
};

const statuses = ['All', 'Draft', 'Dispatched', 'Completed', 'Cancelled'];

export default function TripsPage() {
  const {
    trips, kpis, loading, kpiLoading, page, totalPages,
    status, search, isMutating, setPage,
    handleStatusChange, handleSearchChange,
    createTrip, dispatchTrip, completeTrip, cancelTrip, refetch
  } = useTrips();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  return (
    <div className="max-w-screen-2xl mx-auto space-y-5">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Trips & Dispatch</h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            Manage active dispatches, assign resources, and track trip lifecycle.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all bg-white dark:bg-zinc-900"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-200 dark:shadow-blue-900/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Dispatch
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 shadow-sm flex items-center gap-4">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex-shrink-0">
            <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">In Transit</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50 leading-none mt-0.5">
              {kpiLoading ? <span className="text-zinc-300 animate-pulse">—</span> : kpis.activeTrips}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 shadow-sm flex items-center gap-4">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50 leading-none mt-0.5">
              {kpiLoading ? <span className="text-zinc-300 animate-pulse">—</span> : kpis.pendingTrips}
            </p>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Main: Trip table */}
        <div className="xl:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* Table header: tabs + search */}
          <div className="px-5 pt-4 pb-0 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-3 mb-0">
              <div className="flex items-center gap-1 overflow-x-auto">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                      status === s
                        ? 'border-blue-600 text-blue-700 dark:text-blue-400'
                        : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="relative flex-shrink-0 mb-1">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search trips..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-8 pr-4 py-1.5 w-48 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Table body */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-7 h-7 text-zinc-300 animate-spin" />
                <p className="text-xs text-zinc-400">Loading trips...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2">
                <FileText className="w-10 h-10 text-zinc-200 dark:text-zinc-700" />
                <p className="text-sm font-semibold text-zinc-400">No trips found</p>
                <p className="text-xs text-zinc-300 dark:text-zinc-600">Adjust filters or create a new dispatch.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                    <th className="py-3 px-5">Route</th>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Driver</th>
                    <th className="py-3 px-4">Cargo</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip) => {
                    const isExpanded = selectedTripId === trip.id;
                    const sc = statusConfig[trip.status] || statusConfig['Draft'];
                    return (
                      <React.Fragment key={trip.id}>
                        <tr
                          onClick={() => setSelectedTripId(isExpanded ? null : trip.id)}
                          className={`border-t border-zinc-50 dark:border-zinc-800 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 cursor-pointer transition-all ${isExpanded ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}
                        >
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-1 font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                              <span>{trip.source}</span>
                              <span className="text-zinc-300 dark:text-zinc-600 text-base leading-none">→</span>
                              <span>{trip.destination}</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-0.5">{trip.planned_distance} km planned</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                              <Truck className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 flex-shrink-0" />
                              <span className="truncate max-w-[100px]">{trip.vehicle_name}</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-0.5 ml-5">{trip.vehicle_registration}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                              <User className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 flex-shrink-0" />
                              <span className="truncate max-w-[100px]">{trip.driver_name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300">{trip.cargo_weight} kg</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${sc.className}`}>
                              {sc.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded panel */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="bg-blue-50/40 dark:bg-blue-900/5 border-t border-zinc-100 dark:border-zinc-800 px-5 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 space-y-2">
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Metrics</p>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                                    <div>Cargo: <span className="font-semibold font-mono">{trip.cargo_weight} kg</span></div>
                                    <div>Planned: <span className="font-semibold font-mono">{trip.planned_distance} km</span></div>
                                    {trip.actual_distance && <div>Actual: <span className="font-semibold font-mono text-emerald-600">{trip.actual_distance} km</span></div>}
                                    {trip.fuel_consumed && <div>Fuel: <span className="font-semibold font-mono text-emerald-600">{trip.fuel_consumed} L</span></div>}
                                    {trip.revenue && <div>Revenue: <span className="font-semibold font-mono text-emerald-600">₹{trip.revenue}</span></div>}
                                  </div>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 space-y-2">
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Assignment</p>
                                  <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                                    <div className="flex items-center gap-2"><Truck className="w-3.5 h-3.5 text-zinc-400" />{trip.vehicle_name} — {trip.vehicle_registration}</div>
                                    <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-zinc-400" />{trip.driver_name}</div>
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
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[11px] text-zinc-400 font-medium">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-40 transition-all text-zinc-600 dark:text-zinc-400"
                >Previous</button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-40 transition-all text-zinc-600 dark:text-zinc-400"
                >Next</button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Live board */}
        <div>
          <LiveBoard />
        </div>
      </div>

      {/* Create modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                Create Dispatch Request
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <TripForm
              onSuccess={() => { setIsCreateOpen(false); refetch(); }}
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
