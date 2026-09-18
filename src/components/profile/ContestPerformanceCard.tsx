"use client";

import { Zap, Trophy, Award, TrendingUp } from "lucide-react";
import { ContestStatsDTO } from "@/types/profile";

interface ContestPerformanceCardProps {
  contest: ContestStatsDTO | null;
  isSynced: boolean;
}

export function ContestPerformanceCard({ contest, isSynced }: ContestPerformanceCardProps) {
  if (!isSynced || !contest || (contest.contestsAttended === 0 && !contest.currentRating)) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-200 uppercase tracking-wider mb-4">
          <Zap className="h-4 w-4 text-indigo-400" />
          <span>Contest Performance</span>
        </div>
        <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-5 text-center">
          <Award className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-zinc-300">No contest participation yet</p>
          <p className="text-xs text-zinc-400 mt-1">
            Ratings and global ranking will appear after participating in a weekly or biweekly contest.
          </p>
        </div>
      </div>
    );
  }

  const { currentRating, highestRating, globalRank, contestsAttended } = contest;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-200 uppercase tracking-wider">
          <Zap className="h-4 w-4 text-indigo-400" />
          <span>Contest Performance</span>
        </div>
        <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
          {contestsAttended} {contestsAttended === 1 ? "Contest" : "Contests"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Current Rating */}
        <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-3.5">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Current Rating
          </div>
          <div className="text-2xl font-black text-indigo-400 font-mono">
            {currentRating ? Math.round(currentRating) : "—"}
          </div>
        </div>

        {/* Highest Peak Rating (FR-313) */}
        <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-3.5">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-amber-400" />
            <span>Peak Rating</span>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {highestRating ? Math.round(highestRating) : currentRating ? Math.round(currentRating) : "—"}
          </div>
        </div>

        {/* Global Contest Rank */}
        <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-3.5 col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Trophy className="h-3 w-3 text-zinc-400" />
            <span>LeetCode Rank</span>
          </div>
          <div className="text-2xl font-black text-zinc-200 font-mono">
            {globalRank ? `#${globalRank.toLocaleString()}` : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}