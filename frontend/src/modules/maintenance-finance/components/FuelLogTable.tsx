"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FuelLog, Vehicle, Trip } from "@/shared/types/database.types";
import { Plus, Calendar, DollarSign, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const fuelSchema = z.object({
  vehicle_id: z.string().min(1, "Vehicle is required"),
  liters: z.coerce.number().min(0.1, "Liters must be greater than 0"),
  cost: z.coerce.number().min(1, "Cost must be a positive number"),
  date: z.string().min(1, "Date is required"),
  trip_id: z.string().nullable().optional(),
});

interface FuelLogTableProps {
  logs: FuelLog[];
  vehicles: Vehicle[];
  trips: Trip[];
  onAddLog: (data: Omit<FuelLog, "id" | "created_at">) => Promise<void>;
  loading: boolean;
}

export default function FuelLogTable({ logs, vehicles, trips, onAddLog, loading }: FuelLogTableProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(fuelSchema),
    defaultValues: {
      vehicle_id: "",
      date: new Date().toISOString().split("T")[0],
      liters: 0,
      cost: 0,
      trip_id: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof fuelSchema>) => {
    await onAddLog({
      vehicle_id: data.vehicle_id,
      liters: data.liters,
      cost: data.cost,
      date: data.date,
      trip_id: data.trip_id || null,
    });
    reset({
      vehicle_id: "",
      date: new Date().toISOString().split("T")[0],
      liters: 0,
      cost: 0,
      trip_id: "",
    });
    setIsOpen(false);
  };

  const getVehicleReg = (vId: string) => {
    const v = vehicles.find((item) => item.id === vId);
    return v ? `${v.model} (${v.registration_number})` : vId;
  };

  return (
    <div className="space-y-6">
      {/* Log Form collapsible */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-sm overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-6 focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <Plus className="w-5 h-5" />
            </span>
            <div className="text-left">
              <h4 className="font-bold text-white">Log Fuel Consumption</h4>
              <p className="text-xs text-zinc-400">Record fuel intake, costs, and link to trips</p>
            </div>
          </div>
          {isOpen ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
        </button>

        {isOpen && (
          <form onSubmit={handleSubmit(onSubmit)} className="border-t border-zinc-800 p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-zinc-950/40">
            {/* Vehicle */}
            <div className="md:col-span-1 space-y-1">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Vehicle
              </label>
              <select
                {...register("vehicle_id")}
                className="h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-700"
              >
                <option value="">Select vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.model} ({v.registration_number})
                  </option>
                ))}
              </select>
              {errors.vehicle_id && <p className="text-[10px] text-red-500 mt-0.5">{errors.vehicle_id.message}</p>}
            </div>

            {/* Liters */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Liters
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                {...register("liters")}
                className="w-full text-xs px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 text-white placeholder-zinc-500 transition-all"
              />
              {errors.liters && <p className="text-[10px] text-red-500 mt-0.5">{errors.liters.message}</p>}
            </div>

            {/* Cost */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Cost (INR)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                {...register("cost")}
                className="w-full text-xs px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 text-white placeholder-zinc-500 transition-all"
              />
              {errors.cost && <p className="text-[10px] text-red-500 mt-0.5">{errors.cost.message}</p>}
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Date
              </label>
              <input
                type="date"
                {...register("date")}
                className="w-full text-xs px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 text-white transition-all"
              />
              {errors.date && <p className="text-[10px] text-red-500 mt-0.5">{errors.date.message}</p>}
            </div>

            {/* Optional Trip ID Link */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Link to Trip (Optional)
              </label>
              <select
                {...register("trip_id")}
                className="h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-700"
              >
                <option value="">No Trip Link</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    Trip: {t.source} → {t.destination} ({t.id.substring(0, 8)})
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <div className="md:col-span-5 flex justify-end gap-2 pt-4 border-t border-zinc-800">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-white text-black hover:bg-zinc-200 text-xs py-1.5 h-8"
              >
                {isSubmitting ? "Saving..." : "Log Fuel Purchase"}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Fuel Log Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h4 className="font-bold text-white">Fuel Consumption Ledger</h4>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            <div className="h-6 bg-zinc-800/40 rounded animate-pulse w-full" />
            <div className="h-6 bg-zinc-800/40 rounded animate-pulse w-full" />
            <div className="h-6 bg-zinc-800/40 rounded animate-pulse w-full" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-500">No fuel records logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3">Fuel Liters</th>
                  <th className="px-6 py-3">Total Cost</th>
                  <th className="px-6 py-3">Refuel Date</th>
                  <th className="px-6 py-3">Trip Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {getVehicleReg(log.vehicle_id)}
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-mono">{log.liters.toLocaleString()} L</td>
                    <td className="px-6 py-4 font-mono font-semibold text-emerald-400">
                      ₹{log.cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono">{log.date}</td>
                    <td className="px-6 py-4">
                      {log.trip_id ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {log.trip_id.substring(0, 8)}
                        </span>
                      ) : (
                        <span className="text-zinc-600 font-mono text-[10px]">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
