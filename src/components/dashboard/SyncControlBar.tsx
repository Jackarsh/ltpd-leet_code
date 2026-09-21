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
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#21262d] border border-[#30363d] text-[#f0883e] font-mono font-bold text-sm">
            LC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-sm text-[#f0f6fc]">
                LeetCode Sync Engine
              </span>
              <SyncStatusBadge status={status} isStale={isStale} />
            </div>
            <p className="text-xs text-[#848d97] mt-0.5">
              Target: <span className="text-[#f0f6fc] font-medium">@{username}</span>
              {lastSyncAt && (
                <> &bull; Last synchronized {formatRelativeTime(lastSyncAt)}</>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={isPending || status === "IN_PROGRESS"}
          className="btn-press flex items-center justify-center gap-2 rounded-md bg-[#238636] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
          <span>{isPending ? "Synchronizing..." : "Sync Now"}</span>
        </button>
      </div>

      {lastSyncError && status === "FAILED" && (
        <div className="flex items-center gap-2 rounded-md bg-[#f85149]/10 border border-[#f85149]/30 p-2.5 text-xs text-[#f85149]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Sync error: {lastSyncError}</span>
        </div>
      )}

      {message && (
        <div
          className={`flex items-center gap-2 rounded-md p-2.5 text-xs border ${
            message.type === "success"
              ? "bg-[#238636]/10 border-[#238636]/30 text-[#3fb950]"
              : "bg-[#f85149]/10 border-[#f85149]/30 text-[#f85149]"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}
