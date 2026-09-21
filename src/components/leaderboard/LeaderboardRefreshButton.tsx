"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

interface LeaderboardRefreshButtonProps {
  lastPlatformSyncAt: string | null;
}

export function LeaderboardRefreshButton({ lastPlatformSyncAt }: LeaderboardRefreshButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const handleRefresh = () => {
    startTransition(() => { router.refresh(); setLastRefreshed(new Date()); });
  };

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatPlatformSync = (iso: string | null) => {
    if (!iso) return "No platform sync yet";
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#848d97] py-2">
      <div className="flex items-center gap-4 flex-wrap">
        <span>LeetCode synced: <strong className="text-[#e6edf3] font-medium">{formatPlatformSync(lastPlatformSyncAt)}</strong></span>
        <span>Data refreshed: <strong className="text-[#e6edf3] font-medium">{formatTime(lastRefreshed)}</strong></span>
      </div>
      <button onClick={handleRefresh} disabled={isPending}
        className="flex items-center gap-1.5 rounded-lg border border-[#30363d] bg-[#161b22] px-3 py-1.5 text-xs font-medium text-[#c9d1d9] hover:border-[#484f58] hover:bg-[#21262d] transition-all disabled:opacity-50">
        <RefreshCw className={`h-3 w-3 ${isPending ? "animate-spin" : ""}`} />
        <span>Reload Displayed Data</span>
      </button>
    </div>
  );
}
