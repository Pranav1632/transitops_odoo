"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Sun, Moon, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "@/shared/hooks/useSession";

const routeMap: Record<string, string> = {
  dashboard: "Dashboard",
  fleet: "Fleet Registry",
  drivers: "Drivers",
  trips: "Trips & Dispatch",
  maintenance: "Maintenance Logs",
  "fuel-expenses": "Fuel & Expenses",
  analytics: "Analytics & Reports",
  settings: "Settings",
};

export default function Header() {
  const pathname = usePathname();
  const pageKey = pathname.split("/").filter(Boolean)[0] || "";
  const pageTitle = routeMap[pageKey] || "Dashboard";

  const { profile, loading } = useSession();
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n.charAt(0)).join("").toUpperCase().slice(0, 2)
    : "TO";

  return (
    <header className="h-14 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-30 px-6 flex items-center justify-between gap-4">
      {/* Left: Page title */}
      <div className="flex items-center gap-2 min-w-0">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">{pageTitle}</h2>
      </div>

      {/* Center: Search */}
      <div className="relative flex-1 max-w-xs max-md:hidden">
        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search resources..."
          className="w-full text-xs pl-8 pr-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-full bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 transition-all"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* Notifications */}
        <button className="relative p-2 rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
          <Bell className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
          <span className="w-2 h-2 bg-blue-600 rounded-full absolute top-1.5 right-1.5 border-[1.5px] border-white dark:border-zinc-900" />
        </button>

        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700" />

        {/* User avatar */}
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-[11px] shadow-sm">
            {loading ? "…" : initials}
          </div>
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 max-sm:hidden">
            {loading ? "…" : (profile?.full_name?.split(" ")[0] || "User")}
          </span>
          <ChevronDown className="w-3 h-3 text-zinc-400 max-sm:hidden" />
        </button>
      </div>
    </header>
  );
}
