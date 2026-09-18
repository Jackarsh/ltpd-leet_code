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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 border border-indigo-500/20">
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        Syncing...
      </span>
    );
  }

  if (isStale) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 border border-amber-500/20">
        <AlertTriangle className="h-3.5 w-3.5" />
        Stale Data
      </span>
    );
  }

  if (status === "SUCCESS") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Up to date
      </span>
    );
  }

  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-400 border border-rose-500/20">
        <AlertCircle className="h-3.5 w-3.5" />
        Sync Error
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-400 border border-zinc-700">
      <Clock className="h-3.5 w-3.5" />
      Pending Sync
    </span>
  );
}