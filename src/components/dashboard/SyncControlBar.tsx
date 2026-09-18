"use client";

import React, { useTransition, useState } from "react";
import { syncNow } from "@/server/actions/sync-leetcode";
import { SyncStatusBadge } from "@/components/ui/SyncStatusBadge";
import { formatRelativeTime } from "@/lib/sync-utils";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5 backdrop-blur-md shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono font-bold text-sm">
            LC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-100">@{username}</span>
              <SyncStatusBadge status={status} isStale={isStale} lastSyncAt={lastSyncAt} />
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Last synced: {formatRelativeTime(lastSyncAt)}
            </p>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white border border-zinc-700 transition-all disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin text-indigo-400" : ""}`} />
          {isPending ? "Refreshing..." : "Sync Now"}
        </button>
      </div>

      {message && (
        <div
          className={`text-xs p-3 rounded-lg flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border border-rose-500/20 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {lastSyncError && status === "FAILED" && !message && (
        <div className="text-xs p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>Sync issue: {lastSyncError}. Your previous stats are preserved.</span>
        </div>
      )}
    </div>
  );
}