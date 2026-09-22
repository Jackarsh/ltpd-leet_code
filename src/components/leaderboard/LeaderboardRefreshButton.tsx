"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

interface LeaderboardRefreshButtonProps {
  lastPlatformSyncAt: string | null;
}

export function LeaderboardRefreshButton({ lastPlatformSyncAt }: LeaderboardRefreshButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const formatPlatformSync = (iso: string | null) => {
    if (!iso) return "No platform sync yet";
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isPending}
      title={lastPlatformSyncAt ? `Last platform sync: ${formatPlatformSync(lastPlatformSyncAt)}` : "Refresh displayed rankings"}
      className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 btn-press shrink-0 shadow-sm"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
      <span>Refresh Data</span>
    </button>
  );
}
