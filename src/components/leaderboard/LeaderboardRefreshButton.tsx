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
      className="flex items-center gap-1.5 rounded-lg border border-[#25303e] bg-[#121820] px-3 py-1.5 text-xs font-medium text-[#d6d0c7] hover:border-[#c89b68]/50 hover:bg-[#18212b] hover:text-[#ece8e1] transition-all disabled:opacity-50 btn-press shrink-0 shadow-sm shadow-black/20"
    >
      <RefreshCw className={`h-3 w-3 ${isPending ? "animate-spin text-[#c89b68]" : "text-[#8d98a5]"}`} />
      <span>Reload Displayed Data</span>
    </button>
  );
}
