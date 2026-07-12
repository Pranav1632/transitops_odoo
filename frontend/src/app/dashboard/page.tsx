"use client";

import Link from "next/link";
import KPICards from "@/modules/maintenance-finance/components/KPICards";
import { Truck, Compass, Wrench, Coins, ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-zinc-950 text-white p-8 relative overflow-hidden border border-zinc-800 shadow-xl">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <h1 className="text-2xl font-bold mb-2">Welcome back, Alex Mercer</h1>
        <p className="text-sm text-zinc-400 max-w-md">
          Monitoring fleet operations, active dispatch status, and financial ROI in real time.
        </p>
      </div>

      {/* KPI Cards from Module C (Finance & Operational) */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Financial & Operational Metrics (Module C)</h3>
        <KPICards />
      </div>

      {/* Grid of Other Module Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module A Summary Card */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-500 border border-emerald-500/20">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-950 dark:text-zinc-50">Active Fleet Registry</h4>
                <p className="text-[10px] text-zinc-500">Module A Identity & Fleet Status</p>
              </div>
            </div>
            <Link href="/fleet" className="text-xs text-emerald-500 hover:underline flex items-center gap-1 font-semibold">
              Registry <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-500 font-medium block mb-1">TOTAL VEHICLES</span>
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">12</span>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-500 font-medium block mb-1">DRIVERS ACTIVE</span>
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">8</span>
            </div>
          </div>
        </div>

        {/* Module B Summary Card */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-500 border border-emerald-500/20">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-950 dark:text-zinc-50">Trips & Dispatch</h4>
                <p className="text-[10px] text-zinc-500">Module B Trip Operations</p>
              </div>
            </div>
            <Link href="/trips" className="text-xs text-emerald-500 hover:underline flex items-center gap-1 font-semibold">
              Live Board <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-500 font-medium block mb-1">ACTIVE TRIPS</span>
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">3</span>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-500 font-medium block mb-1">COMPLETED TODAY</span>
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">6</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
