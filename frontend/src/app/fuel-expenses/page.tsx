"use client";

import { useReports } from "@/modules/maintenance-finance/hooks/useReports";
import FuelLogTable from "@/modules/maintenance-finance/components/FuelLogTable";
import ExpenseTable from "@/modules/maintenance-finance/components/ExpenseTable";
import { Coins, IndianRupee } from "lucide-react";

export default function FuelExpensesPage() {
  const {
    vehicles,
    trips,
    fuelLogs,
    expenses,
    reportsData,
    loadingFuel,
    loadingExpenses,
    loadingReports,
    addFuelLog,
    addExpense,
  } = useReports();

  // Combine fuel log cost and miscellaneous expense amount
  const totalFuelCost = fuelLogs.reduce((sum, item) => sum + item.cost, 0);
  const totalExpenseCost = expenses.reduce((sum, item) => sum + item.amount, 0);
  const combinedTotal = totalFuelCost + totalExpenseCost;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <p className="text-xs text-zinc-500 font-medium">Module C — Finance Operations</p>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">Fuel & Expense Loggers</h1>
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fuel Logs Section */}
        <div>
          <FuelLogTable
            logs={fuelLogs}
            vehicles={vehicles}
            trips={trips}
            onAddLog={addFuelLog}
            loading={loadingFuel}
          />
        </div>

        {/* Expenses Section */}
        <div>
          <ExpenseTable
            expenses={expenses}
            vehicles={vehicles}
            trips={trips}
            onAddExpense={addExpense}
            loading={loadingExpenses}
          />
        </div>
      </div>

      {/* Bottom Summary Cost Card */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500 border border-red-500/20">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-zinc-950 dark:text-zinc-50">Combined Operational Cost</h4>
            <p className="text-xs text-zinc-500">Sum of all refuels and logged expenses</p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end">
          {loadingReports || loadingFuel || loadingExpenses ? (
            <div className="h-8 w-32 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
          ) : (
            <>
              <span className="text-2xl font-black text-zinc-950 dark:text-zinc-50 tracking-tight flex items-center font-mono">
                <IndianRupee className="w-5 h-5" />
                {combinedTotal.toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium mt-1">
                Refuel: ₹{totalFuelCost.toLocaleString()} | Other: ₹{totalExpenseCost.toLocaleString()}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
