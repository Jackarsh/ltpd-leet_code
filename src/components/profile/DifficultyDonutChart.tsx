"use client";

import { CheckCircle, Target } from "lucide-react";
import { DifficultyBreakdownDTO } from "@/types/profile";

interface DifficultyDonutChartProps {
  stats: DifficultyBreakdownDTO | null;
  isSynced: boolean;
}

export function DifficultyDonutChart({ stats, isSynced }: DifficultyDonutChartProps) {
  if (!isSynced || !stats) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md text-center">
        <Target className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-zinc-300">Coding Statistics</h3>
        <p className="text-xs text-zinc-400 mt-1">Not yet available (pending synchronization)</p>
      </div>
    );
  }

  const { totalSolved, easySolved, mediumSolved, hardSolved, easyPercentage, mediumPercentage, hardPercentage } =
    stats;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-indigo-400" />
          Problems Solved
        </h3>
        <span className="text-2xl font-black text-zinc-100 font-mono">{totalSolved}</span>
      </div>

      {/* Segmented Visual Bar */}
      <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden flex mb-6">
        <div
          style={{ width: `${easyPercentage ?? 0}%` }}
          className="bg-emerald-500 transition-all duration-500"
          title={`Easy: ${easyPercentage}%`}
        />
        <div
          style={{ width: `${mediumPercentage ?? 0}%` }}
          className="bg-amber-500 transition-all duration-500"
          title={`Medium: ${mediumPercentage}%`}
        />
        <div
          style={{ width: `${hardPercentage ?? 0}%` }}
          className="bg-rose-500 transition-all duration-500"
          title={`Hard: ${hardPercentage}%`}
        />
      </div>

      {/* Difficulty Breakdown Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Easy */}
        <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-3">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-1">
            <span>Easy</span>
            <span className="text-zinc-400">{easyPercentage !== null ? `${easyPercentage}%` : "—"}</span>
          </div>
          <div className="text-xl font-bold text-zinc-100 font-mono">{easySolved}</div>
        </div>

        {/* Medium */}
        <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-3">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400 mb-1">
            <span>Medium</span>
            <span className="text-zinc-400">{mediumPercentage !== null ? `${mediumPercentage}%` : "—"}</span>
          </div>
          <div className="text-xl font-bold text-zinc-100 font-mono">{mediumSolved}</div>
        </div>

        {/* Hard */}
        <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-3">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-400 mb-1">
            <span>Hard</span>
            <span className="text-zinc-400">{hardPercentage !== null ? `${hardPercentage}%` : "—"}</span>
          </div>
          <div className="text-xl font-bold text-zinc-100 font-mono">{hardSolved}</div>
        </div>
      </div>
    </div>
  );
}