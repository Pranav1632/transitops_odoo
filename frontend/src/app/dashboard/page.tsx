"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Truck, Compass, TrendingUp, TrendingDown, 
  ArrowUpRight, Navigation, Clock, CheckCircle2, 
  AlertCircle, Calendar
} from "lucide-react";
import { useSession } from "@/shared/hooks/useSession";
import { useTrips } from "@/modules/trip-ops/hooks/useTrips";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// Mock trend data — real data flows through Module B KPI hook
const dispatchTrend = [
  { day: "Mon", trips: 4, revenue: 5200 },
  { day: "Tue", trips: 6, revenue: 7800 },
  { day: "Wed", trips: 5, revenue: 6400 },
  { day: "Thu", trips: 8, revenue: 10500 },
  { day: "Fri", trips: 7, revenue: 9100 },
  { day: "Sat", trips: 3, revenue: 3900 },
  { day: "Sun", trips: 2, revenue: 2600 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 shadow-lg text-xs">
        <p className="font-semibold text-zinc-600 dark:text-zinc-400 mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-zinc-500 dark:text-zinc-400">{p.name}:</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {p.dataKey === "revenue" ? `₹${p.value.toLocaleString()}` : p.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { profile } = useSession();
  const userName = profile?.full_name?.split(" ")[0] || "User";
  const { kpis, kpiLoading } = useTrips();

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      {/* Top welcome + date row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Welcome back, <span className="text-blue-600 dark:text-blue-400">{userName} 👋</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{today}</p>
        </div>
        <Link
          href="/trips"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-200 dark:shadow-blue-900/30 transition-all"
        >
          <Navigation className="w-4 h-4" />
          New Dispatch
        </Link>
      </div>

      {/* KPI Cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Trips */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Active Trips</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Navigation className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
            {kpiLoading ? <span className="text-zinc-300 animate-pulse">—</span> : kpis.activeTrips}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">In transit right now</p>
        </div>

        {/* Pending Dispatches */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Pending</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
            {kpiLoading ? <span className="text-zinc-300 animate-pulse">—</span> : kpis.pendingTrips}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Drafts awaiting dispatch</p>
        </div>

        {/* Fleet Available */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Available Fleet</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50">12</div>
          <p className="text-[11px] text-emerald-500 mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +2 from last week
          </p>
        </div>

        {/* Completed Today */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Completed</span>
            <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50">6</div>
          <p className="text-[11px] text-zinc-400 mt-1">Trips completed today</p>
        </div>
      </div>

      {/* Main 2-col grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Weekly Dispatch Overview</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Trips completed and revenue generated per day</p>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-zinc-500 font-medium">Trips</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                <span className="text-zinc-500 font-medium">Revenue</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dispatchTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0 0)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="trips" name="Trips"
                stroke="#3b82f6" strokeWidth={2.5} dot={false}
                activeDot={{ r: 5, fill: "#3b82f6", strokeWidth: 0 }}
              />
              <Line
                type="monotone" dataKey="revenue" name="Revenue (÷1000)"
                stroke="#8b5cf6" strokeWidth={2.5} dot={false}
                activeDot={{ r: 5, fill: "#8b5cf6", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          {/* Quick links card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "View Fleet Registry", href: "/fleet", icon: Truck, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
                { label: "Dispatch New Trip", href: "/trips", icon: Compass, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
                { label: "View Analytics", href: "/analytics", icon: ArrowUpRight, color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800"
                  >
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                      {action.label}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 ml-auto group-hover:text-zinc-500 transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Status summary card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 shadow-sm shadow-blue-200 dark:shadow-blue-900/30 text-white flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-blue-200" />
              <h3 className="text-sm font-bold">Trip Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-200">Active in transit</span>
                <span className="text-sm font-bold">
                  {kpiLoading ? "—" : kpis.activeTrips}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-200">Pending dispatch</span>
                <span className="text-sm font-bold">
                  {kpiLoading ? "—" : kpis.pendingTrips}
                </span>
              </div>
              <div className="w-full bg-white/20 h-1.5 rounded-full mt-2">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{
                    width: kpiLoading ? "0%" : `${Math.min(100, ((kpis.activeTrips || 0) / Math.max(1, (kpis.activeTrips || 0) + (kpis.pendingTrips || 0))) * 100)}%`
                  }}
                />
              </div>
              <p className="text-[10px] text-blue-200 mt-1">
                {kpiLoading ? "Loading..." : `${kpis.activeTrips || 0} of ${((kpis.activeTrips || 0) + (kpis.pendingTrips || 0))} trips dispatched`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Module highlights row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <Truck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Fleet Registry</h4>
                <p className="text-[10px] text-zinc-400">Module A — Fleet Identity</p>
              </div>
            </div>
            <Link href="/fleet" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 font-semibold">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-1">Total Vehicles</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">12</p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-1">Active Drivers</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">8</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Compass className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Trip Dispatch</h4>
                <p className="text-[10px] text-zinc-400">Module B — Trip Operations</p>
              </div>
            </div>
            <Link href="/trips" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 font-semibold">
              Live board <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-1">In Transit</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {kpiLoading ? "—" : kpis.activeTrips}
              </p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-1">Pending</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {kpiLoading ? "—" : kpis.pendingTrips}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
