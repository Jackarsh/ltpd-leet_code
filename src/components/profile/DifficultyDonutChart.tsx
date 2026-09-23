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
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center shadow-sm">
        <Target className="h-8 w-8 text-slate-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Coding Statistics</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Not yet available (pending synchronization)</p>
      </div>
    );
  }

  const { totalSolved, easySolved, mediumSolved, hardSolved, easyPercentage, mediumPercentage, hardPercentage } =
    stats;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-blue-600 dark:text-indigo-400" />
          Problems Solved
        </h3>
        <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalSolved}</span>
      </div>

      {/* Segmented Visual Bar */}
      <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex mb-6">
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
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 p-3">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <span>Easy</span>
            <span className="text-slate-500 dark:text-slate-400">{easyPercentage !== null ? `${easyPercentage}%` : "—"}</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">{easySolved}</div>
        </div>

        {/* Medium */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 p-3">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
            <span>Medium</span>
            <span className="text-slate-500 dark:text-slate-400">{mediumPercentage !== null ? `${mediumPercentage}%` : "—"}</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">{mediumSolved}</div>
        </div>

        {/* Hard */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 p-3">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
            <span>Hard</span>
            <span className="text-slate-500 dark:text-slate-400">{hardPercentage !== null ? `${hardPercentage}%` : "—"}</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">{hardSolved}</div>
        </div>
      </div>
    </div>
  );
}