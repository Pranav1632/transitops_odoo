"use client";

import { useState } from "react";
import { useReports } from "@/modules/maintenance-finance/hooks/useReports";
import MaintenanceForm from "@/modules/maintenance-finance/components/MaintenanceForm";
import { Wrench, Plus, CheckCircle2, Clock, X } from "lucide-react";

export default function MaintenancePage() {
  const { vehicles, maintenanceLogs, loadingMaintenance, addMaintenanceLog, closeMaintenance } = useReports();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [closingLogId, setClosingLogId] = useState<string | null>(null);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const handleCloseLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (closingLogId) { await closeMaintenance(closingLogId, endDate); setClosingLogId(null); }
  };

  const getVehicleReg = (vId: string) => {
    const v = vehicles.find((item) => item.id === vId);
    return v ? `${v.model} (${v.registration_number})` : vId;
  };

  return (
    <div className="max-w-screen-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Maintenance & Workshop Logs</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Log active service records, schedule oil checks, and monitor historical workshop cycles.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Log Service Record
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Active & Historical Logs</h4>
        </div>

        {loadingMaintenance ? (
          <div className="p-8 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl animate-pulse" />)}
          </div>
        ) : maintenanceLogs.length === 0 ? (
          <div className="p-16 text-center">
            <Wrench className="w-10 h-10 text-zinc-200 dark:text-zinc-700 mx-auto mb-3" />
            <h5 className="font-bold text-zinc-400 text-sm">No logs found</h5>
            <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-1">Start by logging a new vehicle maintenance record.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Vehicle</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Cost</th>
                  <th className="px-6 py-3.5">Start Date</th>
                  <th className="px-6 py-3.5">End Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                {maintenanceLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100 text-xs">{getVehicleReg(log.vehicle_id)}</td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 text-xs max-w-xs truncate">{log.description}</td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">₹{log.cost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-mono text-xs">{log.start_date}</td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                      {log.end_date || <span className="text-zinc-300 dark:text-zinc-600 italic font-sans">Ongoing</span>}
                    </td>
                    <td className="px-6 py-4">
                      {log.status === "Active" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3 h-3 animate-pulse" />Active (In Shop)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />Closed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.status === "Active" && (
                        <button
                          onClick={() => setClosingLogId(log.id)}
                          className="px-3 py-1.5 text-[10px] font-bold border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-all bg-white dark:bg-zinc-900"
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

      {isFormOpen && (
        <MaintenanceForm
          vehicles={vehicles}
          onSubmit={async (data) => { await addMaintenanceLog(data); setIsFormOpen(false); }}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {/* Close service modal */}
      {closingLogId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Complete Service</h3>
              <button onClick={() => setClosingLogId(null)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-zinc-500">Enter the date this vehicle completed maintenance to restore it to the Available pool.</p>
            <form onSubmit={handleCloseLogSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Completion Date</label>
                <input
                  type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required
                  className="w-full text-sm px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-zinc-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button type="button" onClick={() => setClosingLogId(null)} className="px-4 py-2 text-sm font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-all">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all">Confirm Close</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
