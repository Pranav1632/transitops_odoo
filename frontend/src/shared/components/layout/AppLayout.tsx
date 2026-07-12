"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAuthPage) {
    return <main className="flex-1 flex flex-col">{children}</main>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main body section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <Header />

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto px-8 py-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
