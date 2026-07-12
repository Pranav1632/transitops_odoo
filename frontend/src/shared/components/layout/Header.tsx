"use client";

import { usePathname } from "next/navigation";
import Breadcrumb from "./Breadcrumb";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

const routeMap: Record<string, string> = {
  dashboard: "Dashboard Overview",
  fleet: "Fleet Registry Management",
  drivers: "Driver Registry & Expiries",
  trips: "Trip Dispatch Center",
  maintenance: "Maintenance Log Records",
  "fuel-expenses": "Fuel Consumption & Expense Logs",
  analytics: "Fleet Analytics & ROI Reports",
  settings: "System RBAC Settings",
};

export default function Header() {
  const pathname = usePathname();
  const pageKey = pathname.split("/").filter(Boolean)[0] || "";
  const pageTitle = routeMap[pageKey] || "TransitOps Dashboard";

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage or system preference
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="flex flex-col">
        <Breadcrumb />
        <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 leading-tight mt-0.5">
          {pageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-64 max-md:hidden">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-full bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          title="Toggle Dark Mode"
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-600" />
          )}
        </button>

        {/* Notification */}
        <button className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors relative">
          <Bell className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          <span className="w-2 h-2 bg-emerald-500 rounded-full absolute top-1 right-1 border border-white dark:border-zinc-950 animate-pulse" />
        </button>

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />

        <div className="flex items-center gap-2">
          <div className="text-right max-sm:hidden">
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Alex Mercer</p>
            <span className="text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded font-mono">FIN_ANALYST</span>
          </div>
        </div>
      </div>
    </header>
  );
}
