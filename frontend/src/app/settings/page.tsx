"use client";

import { Settings, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm max-w-4xl flex items-start gap-4">
        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-500">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 mb-1">System Settings</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
            This module (Module A) owns user roles, RBAC access matrices, and profile information. It is currently being worked on by the Fleet Registry team.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 flex items-center justify-center min-h-[300px]">
        <div className="text-center max-w-xs space-y-2">
          <AlertCircle className="w-8 h-8 text-zinc-400 mx-auto" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Placeholder Screen</p>
          <p className="text-xs text-zinc-500">General settings and permissions configuration will be rendered here by Module A's implementation.</p>
        </div>
      </div>
    </div>
  );
}
