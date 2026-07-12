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
  Shield
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

  const roleName = profile?.role
    ? profile.role.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Guest User";

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n.charAt(0)).join("").toUpperCase().slice(0, 2)
    : "GU";

  const fullName = profile?.full_name || "User";

  return (
    <aside className="w-64 bg-zinc-950 text-zinc-200 border-r border-zinc-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
        <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
          <Shield className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white leading-tight">TransitOps</h1>
          <span className="text-xs text-zinc-500 font-medium">Enterprise Fleet OS</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-zinc-800 text-white shadow-sm border-l-4 border-emerald-500 pl-3"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-emerald-400" : "text-zinc-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/20">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 border border-emerald-500/30">
            {loading ? "..." : initials}
          </div>
          <div>
            <p className="text-xs font-semibold text-white leading-none">
              {loading ? "Loading..." : fullName}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">
              {loading ? "Please wait" : roleName}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
