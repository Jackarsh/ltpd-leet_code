"use client";

import { useState } from "react";
import type { DuplicateConflictGroup } from "@/server/services/duplicate.service";
import { DuplicateConflictCard } from "./DuplicateConflictCard";
import { CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface DuplicateConflictsClientProps {
  initialConflicts: DuplicateConflictGroup[];
}

export function DuplicateConflictsClient({
  initialConflicts,
}: DuplicateConflictsClientProps) {
  const router = useRouter();
  const [conflicts, setConflicts] = useState<DuplicateConflictGroup[]>(initialConflicts);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleResolved = (handle: string, _resolvedUserId: string) => {
    setConflicts((prev) => prev.filter((c) => c.leetcodeUsername !== handle));
    router.refresh();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/duplicates");
      const data = await res.json();
      if (data.conflicts) {
        setConflicts(data.conflicts);
      }
    } catch (err) {
      console.error("Failed to refresh conflicts:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Queue Status Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl border ${
              conflicts.length > 0
                ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {conflicts.length > 0 ? (
              <span className="font-bold text-sm px-1">{conflicts.length}</span>
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-200">
              {conflicts.length > 0
                ? `${conflicts.length} Contested Handle Conflicts Detected`
                : "No Contested Accounts Detected"}
            </h3>
            <p className="text-[11px] text-zinc-500">
              {conflicts.length > 0
                ? "Review account evidence below and unlink or disable secondary accounts."
                : "All active student accounts have unique, uncontested LeetCode handles."}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isRefreshing}
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Conflicts List */}
      {conflicts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center space-y-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h3 className="text-base font-semibold text-zinc-100">Conflict Queue Clear</h3>
          <p className="text-xs text-zinc-400 max-w-md">
            No multiple registrations claiming identical LeetCode handles were found. If a conflict arises during student onboarding, it will immediately appear in this queue.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {conflicts.map((c) => (
            <DuplicateConflictCard
              key={c.leetcodeUsername}
              conflict={c}
              onResolved={handleResolved}
            />
          ))}
        </div>
      )}
    </div>
  );
}
