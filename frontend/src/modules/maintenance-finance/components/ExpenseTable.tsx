"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Expense, Vehicle, Trip } from "@/shared/types/database.types";
import { Plus, Coins, FileText, ChevronDown, ChevronUp } from "lucide-react";

const expenseSchema = z.object({
  vehicle_id: z.string().min(1, "Vehicle is required"),
  type: z.enum(["Toll", "Permit", "Insurance", "Fine", "Other"]),
  amount: z.coerce.number().min(1, "Amount must be a positive number"),
  date: z.string().min(1, "Date is required"),
  trip_id: z.string().nullable().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

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
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      amount: 0,
      trip_id: "",
    },
  });

  const onSubmit = async (data: ExpenseFormValues) => {
    await onAddExpense({
      vehicle_id: data.vehicle_id,
      type: data.type,
      amount: data.amount,
      date: data.date,
      trip_id: data.trip_id || null,
    });
    reset({
      date: new Date().toISOString().split("T")[0],
      amount: 0,
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
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-6 focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 border border-emerald-500/20">
              <Plus className="w-5 h-5" />
            </span>
            <div className="text-left">
              <h4 className="font-bold text-zinc-950 dark:text-zinc-50">Log Miscellaneous Expense</h4>
              <p className="text-xs text-zinc-500">Record permits, tolls, insurance renewals, and fines</p>
            </div>
          </div>
          {isOpen ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
        </button>

        {isOpen && (
          <form onSubmit={handleSubmit(onSubmit)} className="border-t border-zinc-100 dark:border-zinc-800 p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-zinc-50/50 dark:bg-zinc-950/20">
            {/* Vehicle */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Vehicle
              </label>
              <select
                {...register("vehicle_id")}
                className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-800 dark:text-zinc-200"
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
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Expense Type
              </label>
              <select
                {...register("type")}
                className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-800 dark:text-zinc-200"
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
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Amount (INR)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                {...register("amount")}
                className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-800 dark:text-zinc-200"
              />
              {errors.amount && <p className="text-[10px] text-red-500 mt-0.5">{errors.amount.message}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                {...register("date")}
                className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-800 dark:text-zinc-200"
              />
              {errors.date && <p className="text-[10px] text-red-500 mt-0.5">{errors.date.message}</p>}
            </div>

            {/* Optional Trip ID Link */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Link to Trip (Optional)
              </label>
              <select
                {...register("trip_id")}
                className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-800 dark:text-zinc-200"
              >
                <option value="">No Trip Link</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    Trip: {t.source} → {t.destination} ({t.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <div className="md:col-span-5 flex justify-end gap-2 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-zinc-950 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Log Expense"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Expense Log Table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h4 className="font-bold text-zinc-950 dark:text-zinc-50">Expenses Ledger</h4>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-full" />
            <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-full" />
            <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-full" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-500">No expense records logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Expense Date</th>
                  <th className="px-6 py-3">Trip Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                      {getVehicleReg(exp.vehicle_id)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        exp.type === "Toll" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" :
                        exp.type === "Permit" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" :
                        exp.type === "Insurance" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                        exp.type === "Fine" ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" :
                        "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      }`}>
                        {exp.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-red-500">
                      ₹{exp.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-zinc-500">{exp.date}</td>
                    <td className="px-6 py-4">
                      {exp.trip_id ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {exp.trip_id}
                        </span>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-600 text-xs">--</span>
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
