"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Compass, 
  Wrench, 
  Coins, 
  BarChart3, 
  Settings,
  LogOut,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/shared/hooks/useSession";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Fleet Registry", href: "/fleet", icon: Truck },
  { name: "Drivers", href: "/drivers", icon: Users },
  { name: "Trips & Dispatch", href: "/trips", icon: Compass },
  { name: "Maintenance Logs", href: "/maintenance", icon: Wrench },
  { name: "Fuel & Expenses", href: "/fuel-expenses", icon: Coins },
  { name: "Analytics & Reports", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, loading } = useSession();

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n.charAt(0)).join("").toUpperCase().slice(0, 2)
    : "TO";

  const fullName = profile?.full_name || "TransitOps User";
  const roleName = profile?.role
    ? profile.role.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Guest";

  return (
    <aside className="w-60 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 flex flex-col h-screen sticky top-0 shadow-sm">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-blue-900/40">
          <span className="text-white font-black text-sm">T</span>
        </div>
        <div>
          <p className="font-bold text-zinc-900 dark:text-white text-sm leading-none">TransitOps</p>
          <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Enterprise Fleet OS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0 transition-colors", isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300")} />
              <span className="truncate">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 p-3 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all">
          <HelpCircle className="w-4 h-4 text-zinc-400" />
          <span>Help & Support</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>

        {/* User info */}
        <div className="flex items-center gap-2.5 px-3 py-3 mt-1 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0 shadow-sm">
            {loading ? "…" : initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate leading-none">
              {loading ? "Loading..." : fullName}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{loading ? "" : roleName}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
