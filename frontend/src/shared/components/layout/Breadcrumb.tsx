"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

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

export default function Breadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  if (paths.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-xs font-medium text-zinc-500">
      <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {paths.map((path, idx) => {
        const href = `/${paths.slice(0, idx + 1).join("/")}`;
        const isLast = idx === paths.length - 1;
        const name = routeMap[path] || path;

        return (
          <div key={href} className="flex items-center gap-2">
            <ChevronRight className="w-3 h-3 text-zinc-400" />
            {isLast ? (
              <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{name}</span>
            ) : (
              <Link href={href} className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
