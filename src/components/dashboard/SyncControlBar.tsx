"use client";

import React, { useTransition, useState } from "react";
import { syncNow } from "@/server/actions/sync-leetcode";
import { SyncStatusBadge } from "@/components/ui/SyncStatusBadge";
import { formatRelativeTime } from "@/lib/sync-utils";
import { RefreshCw, CheckCircle2, AlertCircle, Code2 } from "lucide-react";

interface Props {
  username: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCESS" | "FAILED" | "STALE";
  lastSyncAt: Date | null;
  lastSyncError: string | null;
  isStale: boolean;
}

export function SyncControlBar({
  username,
  status,
  lastSyncAt,
  lastSyncError,
  isStale,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSync = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await syncNow();
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else if (result.success) {
        setMessage({ type: "success", text: result.success });
      }
    });
  };

  return (
    <div className="rounded-2xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold text-sm shadow-sm">
            LC
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-display font-bold text-sm text-stone-900 dark:text-white">
                LeetCode Sync Engine
              </span>
              <SyncStatusBadge status={status} isStale={isStale} />
            </div>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
              Target: <span className="text-stone-800 dark:text-slate-200 font-semibold font-mono">@{username}</span>
              {lastSyncAt && (
                <span className="text-stone-400 dark:text-slate-500"> &bull; Last synchronized {formatRelativeTime(lastSyncAt)}</span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={isPending || status === "IN_PROGRESS"}
          className="btn-press flex items-center justify-center gap-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white px-4 py-2 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
          <span>{isPending ? "Synchronizing..." : "Sync Now"}</span>
        </button>
      </div>

      {lastSyncError && status === "FAILED" && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900 p-3 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>Sync error: {lastSyncError}</span>
        </div>
      )}

      {message && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3 text-xs border ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-900 text-rose-800 dark:text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}
