"use client";

import { useReports } from "@/modules/maintenance-finance/hooks/useReports";
import KPICards from "@/modules/maintenance-finance/components/KPICards";
import RevenueChart from "@/modules/maintenance-finance/components/charts/RevenueChart";
import TopVehiclesBar from "@/modules/maintenance-finance/components/charts/TopVehiclesBar";
import { Download, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalyticsPage() {
  const {
    reportsData,
    loadingReports,
    maintenanceLogs,
    fuelLogs,
    expenses,
    refreshAll,
  } = useReports();

  // CSV Export utility: exports a compiled summary of all logs
  const handleExportCSV = () => {
    if (!reportsData) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Section 1: Fleet ROI summary
    csvContent += "FLEET VEHICLE ROI SUMMARY\n";
    csvContent += "Registration Number,Model,Revenue (INR),Total Costs (INR),ROI (%)\n";
    reportsData.vehicleROIs.forEach((item) => {
      csvContent += `"${item.reg_number}","${item.model}",${item.revenue},${item.total_costs},${item.roi}%\n`;
    });

    csvContent += "\nMAINTENANCE RECORDS\n";
    csvContent += "Vehicle ID,Description,Cost (INR),Start Date,End Date,Status\n";
    maintenanceLogs.forEach((log) => {
      csvContent += `"${log.vehicle_id}","${log.description}",${log.cost},"${log.start_date}","${log.end_date || ""}","${log.status}"\n`;
    });

    csvContent += "\nFUEL LOGS\n";
    csvContent += "Vehicle ID,Liters,Cost (INR),Date,Trip Link\n";
    fuelLogs.forEach((fuel) => {
      csvContent += `"${fuel.vehicle_id}",${fuel.liters},${fuel.cost},"${fuel.date}","${fuel.trip_id || ""}"\n`;
    });

    csvContent += "\nMISCELLANEOUS EXPENSES\n";
    csvContent += "Vehicle ID,Type,Amount (INR),Date,Trip Link\n";
    expenses.forEach((exp) => {
      csvContent += `"${exp.vehicle_id}","${exp.type}",${exp.amount},"${exp.date}","${exp.trip_id || ""}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fleet_analytics_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 text-white min-h-screen bg-zinc-955 p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Analytics Dashboard</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Aggregate fleet operational revenues, expenditures, and vehicle ROI indices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={refreshAll}
            className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
            title="Refresh aggregates"
          >
            <RefreshCw className={`w-4 h-4 ${loadingReports ? "animate-spin" : ""}`} />
          </Button>

          <Button
            onClick={handleExportCSV}
            disabled={loadingReports || !reportsData}
            className="flex items-center space-x-1.5 bg-white text-black hover:bg-zinc-200"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards section */}
      <KPICards kpis={reportsData?.kpis} loading={loadingReports} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-6 space-y-4 shadow-sm">
          <div>
            <h4 className="font-bold text-white">Revenue vs Operational Cost</h4>
            <p className="text-[10px] text-zinc-400">Monthly breakdown of revenues generated against total outlays</p>
          </div>
          {loadingReports ? (
            <div className="h-80 w-full bg-zinc-800/40 rounded-xl animate-pulse" />
          ) : (
            <RevenueChart data={reportsData?.monthlyData} />
          )}
        </div>

        {/* Costliest Vehicles */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-6 space-y-4 shadow-sm">
          <div>
            <h4 className="font-bold text-white">Top Costliest Vehicles</h4>
            <p className="text-[10px] text-zinc-400">Top 5 vehicles consuming the highest maintenance & fuel spend</p>
          </div>
          {loadingReports ? (
            <div className="h-80 w-full bg-zinc-800/40 rounded-xl animate-pulse" />
          ) : (
            <TopVehiclesBar data={reportsData?.costliestVehicles} />
          )}
        </div>
      </div>

      {/* ROI Ledger */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h4 className="font-bold text-white">Vehicle Return on Investment (ROI) Registry</h4>
        </div>

        {loadingReports ? (
          <div className="p-8 space-y-4">
            <div className="h-6 bg-zinc-800/40 rounded animate-pulse w-full" />
            <div className="h-6 bg-zinc-800/40 rounded animate-pulse w-full" />
          </div>
        ) : !reportsData || reportsData.vehicleROIs.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-550">No ROI records available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Vehicle</th>
                  <th className="px-6 py-3.5">Model</th>
                  <th className="px-6 py-3.5">Total Revenue</th>
                  <th className="px-6 py-3.5">Maintenance + Fuel Costs</th>
                  <th className="px-6 py-3.5">ROI Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {reportsData.vehicleROIs.map((item) => (
                  <tr key={item.reg_number} className="hover:bg-zinc-900/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {item.reg_number}
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      {item.model}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-emerald-400">
                      ₹{item.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-400">
                      ₹{item.total_costs.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold font-mono">
                        {item.roi >= 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400">
                            <TrendingUp className="w-4 h-4" />
                            +{item.roi}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400">
                            <TrendingDown className="w-4 h-4" />
                            {item.roi}%
                          </span>
                        )}
                      </div>
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
