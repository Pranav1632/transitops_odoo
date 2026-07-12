"use client";

import { Compass, AlertCircle } from "lucide-react";

export default function TripsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm max-w-4xl flex items-start gap-4">
        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-500">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 mb-1">Trips & Dispatch Workspace</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
            This module (Module B) owns trip dispatching, lifecycle management (Draft → Dispatched → Completed → Cancelled), and real-time Socket.io Live Boards.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 flex items-center justify-center min-h-[300px]">
        <div className="text-center max-w-xs space-y-2">
          <AlertCircle className="w-8 h-8 text-zinc-400 mx-auto" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Placeholder Screen</p>
          <p className="text-xs text-zinc-500">Trip tables, lifecycle steppers, and Socket.io dashboards will be rendered here by Module B's implementation.</p>
        </div>
      </div>
    </div>
  );
}
