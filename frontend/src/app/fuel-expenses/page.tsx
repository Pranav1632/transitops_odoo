"use client";

import { useReports } from "@/modules/maintenance-finance/hooks/useReports";
import FuelLogTable from "@/modules/maintenance-finance/components/FuelLogTable";
import ExpenseTable from "@/modules/maintenance-finance/components/ExpenseTable";
import { Coins, IndianRupee, Loader2 } from "lucide-react";

export default function FuelExpensesPage() {
  const {
    vehicles, trips, fuelLogs, expenses, reportsData,
    loadingFuel, loadingExpenses, loadingReports,
    addFuelLog, addExpense,
  } = useReports();

  const totalFuelCost = fuelLogs.reduce((sum, item) => sum + item.cost, 0);
  const totalExpenseCost = expenses.reduce((sum, item) => sum + item.amount, 0);
  const combinedTotal = totalFuelCost + totalExpenseCost;

  return (
    <div className="max-w-screen-2xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Fuel & Expense Loggers</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Monitor gas logs, tolls, licenses, fines, and track overall finance sheets.</p>
      </div>

      {/* Combined total summary card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Combined Operational Cost</h4>
            <p className="text-xs text-zinc-400">Sum of all refuels and logged expenses</p>
          </div>
        </div>
        <div className="flex flex-col sm:items-end">
          {loadingReports || loadingFuel || loadingExpenses ? (
            <Loader2 className="w-5 h-5 text-zinc-300 animate-spin" />
          ) : (
            <>
              <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center font-mono">
                <IndianRupee className="w-5 h-5 text-zinc-400 mr-0.5" />
                {combinedTotal.toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium mt-0.5">
                Refuel: ₹{totalFuelCost.toLocaleString()} | Other: ₹{totalExpenseCost.toLocaleString()}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Tables grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <FuelLogTable logs={fuelLogs} vehicles={vehicles} trips={trips} onAddLog={addFuelLog} loading={loadingFuel} />
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <ExpenseTable expenses={expenses} vehicles={vehicles} trips={trips} onAddExpense={addExpense} loading={loadingExpenses} />
        </div>
      </div>
    </div>
  );
}
