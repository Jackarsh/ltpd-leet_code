"use client";

import { TrendingUp } from "lucide-react";
import { ContestStatsDTO } from "@/types/profile";

interface ContestPerformanceCardProps {
  contest: ContestStatsDTO | null;
  isSynced: boolean;
}

export function ContestPerformanceCard({ contest, isSynced }: ContestPerformanceCardProps) {
  if (!isSynced || !contest || (contest.contestsAttended === 0 && !contest.currentRating)) {
    return (
      <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-sm">
        <div className="text-sm font-bold text-[#e6edf3] uppercase tracking-wider mb-4">
          Contest Performance
        </div>
        <div className="rounded-xl bg-[#0d1117] border border-[#21262d] p-5 text-center">
          <p className="text-sm font-medium text-[#e6edf3]">No contest participation yet</p>
          <p className="text-xs text-[#848d97] mt-1">
            Ratings and global ranking will appear after participating in a weekly or biweekly contest.
          </p>
        </div>
      </div>
    );
  }

  const { currentRating, highestRating, globalRank, contestsAttended } = contest;

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="text-sm font-bold text-[#e6edf3] uppercase tracking-wider">
          Contest Performance
        </div>
        <span className="rounded-lg bg-[#21262d] px-2.5 py-1 text-xs font-semibold text-[#e6edf3] border border-[#30363d]">
          {contestsAttended} {contestsAttended === 1 ? "Contest" : "Contests"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Current Rating */}
        <div className="rounded-xl bg-[#0d1117] border border-[#21262d] p-3.5">
          <div className="text-[11px] font-semibold text-[#848d97] uppercase tracking-wider mb-1">
            Current Rating
          </div>
          <div className="text-2xl font-bold text-[#e6edf3] font-mono">
            {currentRating ? Math.round(currentRating) : "—"}
          </div>
        </div>

        {/* Highest Peak Rating */}
        <div className="rounded-xl bg-[#0d1117] border border-[#21262d] p-3.5">
          <div className="text-[11px] font-semibold text-[#848d97] uppercase tracking-wider mb-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-[#848d97]" />
            <span>Peak Rating</span>
          </div>
          <div className="text-2xl font-bold text-[#e6edf3] font-mono">
            {highestRating ? Math.round(highestRating) : currentRating ? Math.round(currentRating) : "—"}
          </div>
        </div>

        {/* Global Contest Rank */}
        <div className="rounded-xl bg-[#0d1117] border border-[#21262d] p-3.5 col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-[#848d97] uppercase tracking-wider mb-1">
            LeetCode Rank
          </div>
          <div className="text-2xl font-bold text-[#e6edf3] font-mono">
            {globalRank ? `#${globalRank.toLocaleString()}` : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
