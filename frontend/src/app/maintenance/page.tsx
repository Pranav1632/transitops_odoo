"use client";

import { useState } from "react";
import { useReports } from "@/modules/maintenance-finance/hooks/useReports";
import MaintenanceForm from "@/modules/maintenance-finance/components/MaintenanceForm";
import { Wrench, Plus, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-6 text-white min-h-screen bg-zinc-950 p-6">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Maintenance & Workshop Logs</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Log active service records, schedule oil checks, and monitor historical workshop cycles.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center space-x-1.5 bg-white text-black hover:bg-zinc-200"
        >
          <Plus className="w-4 h-4" />
          <span>Log Service Record</span>
        </Button>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-emerald-400" />
          <h4 className="font-bold text-white">Active & Historical Logs</h4>
        </div>

        {loadingMaintenance ? (
          <div className="p-8 space-y-4">
            <div className="h-6 bg-zinc-800/40 rounded animate-pulse w-full" />
            <div className="h-6 bg-zinc-800/40 rounded animate-pulse w-full" />
            <div className="h-6 bg-zinc-800/40 rounded animate-pulse w-full" />
          </div>
        ) : maintenanceLogs.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-zinc-850 rounded-xl bg-zinc-955/20 m-6">
            <Wrench className="w-10 h-10 text-zinc-650 mx-auto mb-3" />
            <h5 className="font-bold text-zinc-400">No logs found</h5>
            <p className="text-xs text-zinc-550 mt-1">Start by logging a new vehicle maintenance record.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Vehicle</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Cost</th>
                  <th className="px-6 py-3.5">Start Date</th>
                  <th className="px-6 py-3.5">End Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {maintenanceLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {getVehicleReg(log.vehicle_id)}
                    </td>
                    <td className="px-6 py-4 text-zinc-300 max-w-xs truncate">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-450">
                      ₹{log.cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono">
                      {log.start_date}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono">
                      {log.end_date || <span className="text-zinc-500 italic font-sans">Ongoing</span>}
                    </td>
                    <td className="px-6 py-4">
                      {log.status === "Active" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          Active (In Shop)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.status === "Active" && (
                        <button
                          onClick={() => setClosingLogId(log.id)}
                          className="px-3 py-1.5 text-[10px] font-bold border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-all cursor-pointer bg-zinc-950"
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-lg text-white">Complete Service</h3>
            <p className="text-xs text-zinc-400">
              Please enter the date this vehicle completed maintenance to restore it to the Available pool.
            </p>
            <form onSubmit={handleCloseLogSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Completion Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-zinc-955 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 text-white transition-all"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setClosingLogId(null)}
                  className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-white text-black hover:bg-zinc-200"
                >
                  Confirm Close
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
