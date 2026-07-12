"use client";

import { useReports } from "../hooks/useReports";
import { Coins, Flame, Percent, Landmark } from "lucide-react";

interface KPICardsProps {
  kpis?: {
    totalOperationalCost: number;
    fuelEfficiency: number;
    utilizationRate: number;
    overallROI: number;
  };
  loading?: boolean;
}

export default function KPICards({ kpis, loading }: KPICardsProps) {
  // If no props are passed, fall back to our hook (ideal for Dashboard/Analytics pages)
  const hookData = useReports();
  
  const isLoading = loading !== undefined ? loading : hookData.loadingReports;
  const data = kpis || hookData.reportsData?.kpis;

  const cardItems = [
    {
      title: "Total Operational Cost",
      value: data ? `₹${data.totalOperationalCost.toLocaleString()}` : "₹0",
      description: "Sum of maintenance, fuel, and expenses",
      icon: Coins,
      colorClass: "text-red-500 bg-red-500/10 border-red-500/20",
    },
    {
      title: "Average Fuel Efficiency",
      value: data ? `${data.fuelEfficiency} km/L` : "0 km/L",
      description: "Actual trip km / liters consumed",
      icon: Flame,
      colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Fleet Utilization",
      value: data ? `${data.utilizationRate}%` : "0%",
      description: "Available + On-Trip vehicles ratio",
      icon: Percent,
      colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Fleet ROI Performance",
      value: data ? `${data.overallROI}%` : "0%",
      description: "(Revenue - Ops Cost) / Acquisition Cost",
      icon: Landmark,
      colorClass: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-3 animate-pulse">
            <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-2/3" />
            <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2" />
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {item.title}
              </span>
              <div className={`p-2.5 rounded-xl border ${item.colorClass} group-hover:scale-105 transition-transform duration-300`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight leading-none">
                {item.value}
              </h3>
              <p className="text-[10px] text-zinc-400 mt-2 font-medium">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
