"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Vehicle, MaintenanceLog } from "@/shared/types/database.types";
import { X, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const maintenanceSchema = z.object({
  vehicle_id: z.string().min(1, "Vehicle selection is required"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  cost: z.coerce.number().min(0, "Cost must be a positive number"),
  start_date: z.string().min(1, "Start date is required"),
  status: z.enum(["Active", "Closed"]),
  end_date: z.string().optional(),
}).refine((data) => {
  if (data.status === "Closed" && !data.end_date) {
    return false;
  }
  return true;
}, {
  message: "End date is required when maintenance is Closed",
  path: ["end_date"],
});

interface MaintenanceFormProps {
  vehicles: Vehicle[];
  onSubmit: (data: Omit<MaintenanceLog, "id" | "created_at">) => void;
  onClose: () => void;
}

export default function MaintenanceForm({ vehicles, onSubmit, onClose }: MaintenanceFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      vehicle_id: "",
      description: "",
      cost: 0,
      status: "Active" as const,
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    },
  });

  const selectedStatus = watch("status");

  const onFormSubmit = (data: z.infer<typeof maintenanceSchema>) => {
    onSubmit({
      vehicle_id: data.vehicle_id,
      description: data.description,
      cost: data.cost,
      start_date: data.start_date,
      status: data.status,
      end_date: data.status === "Closed" ? (data.end_date || null) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h3 className="font-bold text-lg text-white">Log Service Record</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
          {/* Vehicle Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Select Vehicle
            </label>
            <select
              {...register("vehicle_id")}
              className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-700 disabled:pointer-events-none disabled:opacity-50"
            >
              <option value="">-- Choose a vehicle --</option>
              {vehicles
                .filter((v) => v.status !== "Retired")
                .map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.model} ({vehicle.registration_number}) - Status: {vehicle.status}
                  </option>
                ))}
            </select>
            {errors.vehicle_id && (
              <p className="text-xs text-red-500 font-medium">{errors.vehicle_id.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Service Description
            </label>
            <input
              type="text"
              placeholder="e.g. Scheduled Engine Tuning, Oil Change"
              {...register("description")}
              className="w-full text-sm px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 text-white placeholder-zinc-500 transition-all"
            />
            {errors.description && (
              <p className="text-xs text-red-500 font-medium">{errors.description.message}</p>
            )}
          </div>

          {/* Cost */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Cost (INR)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("cost")}
              className="w-full text-sm px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 text-white placeholder-zinc-500 transition-all"
            />
            {errors.cost && (
              <p className="text-xs text-red-500 font-medium">{errors.cost.message}</p>
            )}
          </div>

          {/* Grid: Dates & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Start Date
              </label>
              <input
                type="date"
                {...register("start_date")}
                className="w-full text-sm px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 text-white transition-all"
              />
              {errors.start_date && (
                <p className="text-xs text-red-500 font-medium">{errors.start_date.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Service Status
              </label>
              <select
                {...register("status")}
                className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-700"
              >
                <option value="Active">Active (In Shop)</option>
                <option value="Closed">Closed (Completed)</option>
              </select>
            </div>
          </div>

          {/* End Date (Conditional) */}
          {selectedStatus === "Closed" && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                End Date
              </label>
              <input
                type="date"
                {...register("end_date")}
                className="w-full text-sm px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 text-white transition-all"
              />
              {errors.end_date && (
                <p className="text-xs text-red-500 font-medium">{errors.end_date.message}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-white text-black hover:bg-zinc-200"
            >
              {isSubmitting ? "Saving..." : "Log Service"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
