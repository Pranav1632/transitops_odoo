"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Expense, Vehicle, Trip } from "@/shared/types/database.types";
import { Plus, Coins, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const expenseSchema = z.object({
  vehicle_id: z.string().min(1, "Vehicle is required"),
  type: z.enum(["Toll", "Permit", "Insurance", "Fine", "Other"]),
  amount: z.coerce.number().min(1, "Amount must be a positive number"),
  date: z.string().min(1, "Date is required"),
  trip_id: z.string().nullable().optional(),
});

interface ExpenseTableProps {
  expenses: Expense[];
  vehicles: Vehicle[];
  trips: Trip[];
  onAddExpense: (data: Omit<Expense, "id" | "created_at">) => Promise<void>;
  loading: boolean;
}

export default function ExpenseTable({ expenses, vehicles, trips, onAddExpense, loading }: ExpenseTableProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      vehicle_id: "",
      type: "Toll" as const,
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      trip_id: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof expenseSchema>) => {
    await onAddExpense({
      vehicle_id: data.vehicle_id,
      type: data.type,
      amount: data.amount,
      date: data.date,
      trip_id: data.trip_id || null,
    });
    reset({
      vehicle_id: "",
      type: "Toll" as const,
      amount: 0,
      date: new Date().toISOString().split("T")[0],
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
              <h4 className="font-bold text-white">Log Miscellaneous Expense</h4>
              <p className="text-xs text-zinc-400">Record permits, tolls, insurance renewals, and fines</p>
            </div>
          </div>
          {isOpen ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
        </button>

        {isOpen && (
          <form onSubmit={handleSubmit(onSubmit)} className="border-t border-zinc-800 p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-zinc-955/40">
            {/* Vehicle */}
            <div className="space-y-1">
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

            {/* Expense Type */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Expense Type
              </label>
              <select
                {...register("type")}
                className="h-9 w-full rounded-md border border-zinc-800 bg-zinc-955 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-700"
              >
                <option value="">Select type</option>
                <option value="Toll">Toll Fee</option>
                <option value="Permit">State Permit</option>
                <option value="Insurance">Insurance Renewal</option>
                <option value="Fine">Traffic Fine / Penalty</option>
                <option value="Other">Other Operational Cost</option>
              </select>
              {errors.type && <p className="text-[10px] text-red-500 mt-0.5">{errors.type.message}</p>}
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Amount (INR)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                {...register("amount")}
                className="w-full text-xs px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 text-white placeholder-zinc-500 transition-all"
              />
              {errors.amount && <p className="text-[10px] text-red-500 mt-0.5">{errors.amount.message}</p>}
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
                {isSubmitting ? "Saving..." : "Log Expense"}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Expense Log Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h4 className="font-bold text-white">Expenses Ledger</h4>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            <div className="h-6 bg-zinc-800/40 rounded animate-pulse w-full" />
            <div className="h-6 bg-zinc-800/40 rounded animate-pulse w-full" />
            <div className="h-6 bg-zinc-800/40 rounded animate-pulse w-full" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-500">No expense records logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Expense Date</th>
                  <th className="px-6 py-3">Trip Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-zinc-900/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {getVehicleReg(exp.vehicle_id)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        exp.type === "Toll" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        exp.type === "Permit" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                        exp.type === "Insurance" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        exp.type === "Fine" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}>
                        {exp.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-red-400">
                      ₹{exp.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono">{exp.date}</td>
                    <td className="px-6 py-4">
                      {exp.trip_id ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {exp.trip_id.substring(0, 8)}
                        </span>
                      ) : (
                        <span className="text-zinc-650 font-mono text-[10px]">--</span>
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
