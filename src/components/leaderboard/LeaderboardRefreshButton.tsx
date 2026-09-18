"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Clock, Globe } from "lucide-react";

interface LeaderboardRefreshButtonProps {
  lastPlatformSyncAt: string | null;
}

export function LeaderboardRefreshButton({ lastPlatformSyncAt }: LeaderboardRefreshButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
      setLastRefreshed(new Date());
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const formatPlatformSync = (iso: string | null) => {
    if (!iso) return "No platform sync yet";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-400 py-2">
      {/* Timestamps (FR-240, FR-243) */}
      <div className="flex items-center gap-4 flex-wrap">
        <div
          className="flex items-center gap-1.5"
          title="Most recent successful LeetCode data sync across the platform"
        >
          <Globe className="h-3.5 w-3.5 text-indigo-400" />
          <span>
            LeetCode synced:{" "}
            <strong className="text-zinc-300 font-medium">
              {formatPlatformSync(lastPlatformSyncAt)}
            </strong>
          </span>
        </div>

        <div
          className="flex items-center gap-1.5"
          title="Last time this page loaded current platform database records"
        >
          <Clock className="h-3.5 w-3.5 text-zinc-400" />
          <span>
            Data refreshed:{" "}
            <strong className="text-zinc-300 font-medium">
              {formatTime(lastRefreshed)}
            </strong>
          </span>
        </div>
      </div>

      {/* Explicit UI Reload Button (FR-241, FR-242) */}
      <button
        onClick={handleRefresh}
        disabled={isPending}
        title="Reload displayed data from platform database (does not query LeetCode)"
        className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100 transition-all disabled:opacity-50"
      >
        <RefreshCw className={`h-3 w-3 ${isPending ? "animate-spin text-indigo-400" : ""}`} />
        <span>Reload Displayed Data</span>
      </button>
    </div>
  );
}