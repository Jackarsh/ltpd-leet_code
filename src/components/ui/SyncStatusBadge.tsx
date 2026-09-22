import React from "react";
import { CheckCircle2, AlertTriangle, RefreshCw, Clock, AlertCircle } from "lucide-react";

interface Props {
  status: "PENDING" | "IN_PROGRESS" | "SUCCESS" | "FAILED" | "STALE";
  lastSyncAt?: Date | null;
  isStale?: boolean;
}

export function SyncStatusBadge({ status, isStale }: Props) {
  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
        <RefreshCw className="h-3 w-3 animate-spin text-blue-600 dark:text-blue-400" />
        Syncing...
      </span>
    );
  }

  if (isStale) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
        <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
        Stale Data
      </span>
    );
  }

  if (status === "SUCCESS") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
        <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
        Up to date
      </span>
    );
  }

  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 text-[11px] font-medium text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
        <AlertCircle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
        Sync Error
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-stone-600 dark:text-slate-300 border border-stone-200 dark:border-slate-700">
      <Clock className="h-3 w-3 text-stone-500 dark:text-slate-400" />
      Pending Sync
    </span>
  );
}