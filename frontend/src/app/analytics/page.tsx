"use client";

import { useReports } from "@/modules/maintenance-finance/hooks/useReports";
import KPICards from "@/modules/maintenance-finance/components/KPICards";
import RevenueChart from "@/modules/maintenance-finance/components/charts/RevenueChart";
import TopVehiclesBar from "@/modules/maintenance-finance/components/charts/TopVehiclesBar";
import { Download, RefreshCw, TrendingDown, TrendingUp, BarChart3, Loader2 } from "lucide-react";

export default function AnalyticsPage() {
  const { reportsData, loadingReports, maintenanceLogs, fuelLogs, expenses, refreshAll } = useReports();

  const handleExportCSV = () => {
    if (!reportsData) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "FLEET VEHICLE ROI SUMMARY\n";
    csvContent += "Registration Number,Model,Revenue (INR),Total Costs (INR),ROI (%)\n";
    reportsData.vehicleROIs.forEach((item) => {
      csvContent += `"${item.reg_number}","${item.model}",${item.revenue},${item.total_costs},${item.roi}%\n`;
    });
    csvContent += "\nMAINTENANCE RECORDS\nVehicle ID,Description,Cost (INR),Start Date,End Date,Status\n";
    maintenanceLogs.forEach((log) => {
      csvContent += `"${log.vehicle_id}","${log.description}",${log.cost},"${log.start_date}","${log.end_date || ""}","${log.status}"\n`;
    });
    csvContent += "\nFUEL LOGS\nVehicle ID,Liters,Cost (INR),Date,Trip Link\n";
    fuelLogs.forEach((fuel) => {
      csvContent += `"${fuel.vehicle_id}",${fuel.liters},${fuel.cost},"${fuel.date}","${fuel.trip_id || ""}"\n`;
    });
    csvContent += "\nMISCELLANEOUS EXPENSES\nVehicle ID,Type,Amount (INR),Date,Trip Link\n";
    expenses.forEach((exp) => {
      csvContent += `"${exp.vehicle_id}","${exp.type}",${exp.amount},"${exp.date}","${exp.trip_id || ""}"\n`;
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `fleet_analytics_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-screen-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Analytics Dashboard</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Aggregate fleet operational revenues, expenditures, and vehicle ROI indices.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshAll}
            className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all bg-white dark:bg-zinc-900"
            title="Refresh aggregates"
          >
            <RefreshCw className={`w-4 h-4 ${loadingReports ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={loadingReports || !reportsData}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards kpis={reportsData?.kpis} loading={loadingReports} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Revenue vs Operational Cost</h4>
            <p className="text-[10px] text-zinc-400 mt-0.5">Monthly breakdown of revenues generated against total outlays</p>
          </div>
          {loadingReports ? (
            <div className="h-72 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-xl animate-pulse flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-zinc-300 animate-spin" />
            </div>
          ) : (
            <RevenueChart data={reportsData?.monthlyData} />
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Top Costliest Vehicles</h4>
            <p className="text-[10px] text-zinc-400 mt-0.5">Top 5 vehicles consuming the highest maintenance & fuel spend</p>
          </div>
          {loadingReports ? (
            <div className="h-72 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-xl animate-pulse flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-zinc-300 animate-spin" />
            </div>
          ) : (
            <TopVehiclesBar data={reportsData?.costliestVehicles} />
          )}
        </div>
      </div>

      {/* ROI Ledger Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Vehicle Return on Investment (ROI) Registry</h4>
        </div>

        {loadingReports ? (
          <div className="p-8 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl animate-pulse" />)}
          </div>
        ) : !reportsData || reportsData.vehicleROIs.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-400">No ROI records available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Vehicle</th>
                  <th className="px-6 py-3.5">Model</th>
                  <th className="px-6 py-3.5">Total Revenue</th>
                  <th className="px-6 py-3.5">Maintenance + Fuel Costs</th>
                  <th className="px-6 py-3.5">ROI Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                {reportsData.vehicleROIs.map((item) => (
                  <tr key={item.reg_number} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100 text-xs">{item.reg_number}</td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 text-xs">{item.model}</td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">₹{item.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono text-zinc-500 dark:text-zinc-400 text-xs">₹{item.total_costs.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {item.roi >= 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          <TrendingUp className="w-3.5 h-3.5" />+{item.roi}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold font-mono text-red-600 dark:text-red-400">
                          <TrendingDown className="w-3.5 h-3.5" />{item.roi}%
                        </span>
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
