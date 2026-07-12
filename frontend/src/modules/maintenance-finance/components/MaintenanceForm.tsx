"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Vehicle, MaintenanceLog } from "@/shared/types/database.types";
import { X } from "lucide-react";

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

type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

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
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      status: "Active",
      start_date: new Date().toISOString().split("T")[0],
      cost: 0,
    },
  });

  const selectedStatus = watch("status");

  const onFormSubmit = (data: MaintenanceFormValues) => {
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
    <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="font-bold text-lg text-zinc-950 dark:text-zinc-50">Log Service Record</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
          {/* Vehicle Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Select Vehicle
            </label>
            <select
              {...register("vehicle_id")}
              className="w-full text-sm px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-900 dark:text-zinc-100"
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
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.vehicle_id.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Service Description
            </label>
            <input
              type="text"
              placeholder="e.g. Scheduled Engine Tuning, Oil Change"
              {...register("description")}
              className="w-full text-sm px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-900 dark:text-zinc-100"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.description.message}</p>
            )}
          </div>

          {/* Cost */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Total Cost (INR)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("cost")}
              className="w-full text-sm px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-900 dark:text-zinc-100"
            />
            {errors.cost && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.cost.message}</p>
            )}
          </div>

          {/* Grid: Dates & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                {...register("start_date")}
                className="w-full text-sm px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-900 dark:text-zinc-100"
              />
              {errors.start_date && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Service Status
              </label>
              <select
                {...register("status")}
                className="w-full text-sm px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-900 dark:text-zinc-100"
              >
                <option value="Active">Active (In Shop)</option>
                <option value="Closed">Closed (Completed)</option>
              </select>
            </div>
          </div>

          {/* End Date (Conditional) */}
          {selectedStatus === "Closed" && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                End Date
              </label>
              <input
                type="date"
                {...register("end_date")}
                className="w-full text-sm px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-900 dark:text-zinc-100"
              />
              {errors.end_date && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.end_date.message}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold bg-emerald-500 text-zinc-950 hover:bg-emerald-600 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Log Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
