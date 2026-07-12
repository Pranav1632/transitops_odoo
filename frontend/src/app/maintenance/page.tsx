"use client";

import { useState } from "react";
import { useReports } from "@/modules/maintenance-finance/hooks/useReports";
import MaintenanceForm from "@/modules/maintenance-finance/components/MaintenanceForm";
import { Wrench, Calendar, Plus, CheckCircle2, Clock } from "lucide-react";

export default function MaintenancePage() {
  const {
    vehicles,
    maintenanceLogs,
    loadingMaintenance,
    addMaintenanceLog,
    closeMaintenance,
  } = useReports();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [closingLogId, setClosingLogId] = useState<string | null>(null);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const handleCloseLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (closingLogId) {
      await closeMaintenance(closingLogId, endDate);
      setClosingLogId(null);
    }
  };

  const getVehicleReg = (vId: string) => {
    const v = vehicles.find((item) => item.id === vId);
    return v ? `${v.model} (${v.registration_number})` : vId;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 font-medium">Module C — Maintenance Management</p>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">Maintenance & Workshop Logs</h1>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-semibold text-zinc-950 rounded-xl text-sm transition-all shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4" />
          Log Service Record
        </button>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-emerald-500" />
          <h4 className="font-bold text-zinc-950 dark:text-zinc-50">Active & Historical Logs</h4>
        </div>

        {loadingMaintenance ? (
          <div className="p-8 space-y-4">
            <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-full" />
            <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-full" />
            <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-full" />
          </div>
        ) : maintenanceLogs.length === 0 ? (
          <div className="p-16 text-center">
            <Wrench className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
            <h5 className="font-bold text-zinc-700 dark:text-zinc-300">No logs found</h5>
            <p className="text-xs text-zinc-500 mt-1">Start by logging a new vehicle maintenance record.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Vehicle</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Cost</th>
                  <th className="px-6 py-3.5">Start Date</th>
                  <th className="px-6 py-3.5">End Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
                {maintenanceLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">
                      {getVehicleReg(log.vehicle_id)}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300 max-w-xs truncate">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{log.cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs">
                      {log.start_date}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs">
                      {log.end_date || <span className="text-zinc-400 dark:text-zinc-600 italic">Ongoing</span>}
                    </td>
                    <td className="px-6 py-4">
                      {log.status === "Active" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5" />
                          Active (In Shop)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.status === "Active" && (
                        <button
                          onClick={() => setClosingLogId(log.id)}
                          className="px-3 py-1.5 text-xs font-bold border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:text-emerald-500 rounded-lg transition-colors bg-white dark:bg-zinc-950"
                        >
                          Close Service
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Service Record Form Modal */}
      {isFormOpen && (
        <MaintenanceForm
          vehicles={vehicles}
          onSubmit={async (data) => {
            await addMaintenanceLog(data);
            setIsFormOpen(false);
          }}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {/* Close Service Date Confirmation Modal */}
      {closingLogId && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-lg text-zinc-950 dark:text-zinc-50">Complete Service</h3>
            <p className="text-xs text-zinc-500">
              Please enter the date this vehicle completed maintenance to restore it to the Available pool.
            </p>
            <form onSubmit={handleCloseLogSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Completion Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-sm px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setClosingLogId(null)}
                  className="px-4 py-2 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-zinc-950 rounded-lg"
                >
                  Confirm Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
