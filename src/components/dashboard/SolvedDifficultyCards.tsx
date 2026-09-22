"use client";

import React from "react";

interface Props {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
}

export function SolvedDifficultyCards({
  totalSolved,
  easySolved,
  mediumSolved,
  hardSolved,
  acceptanceRate,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-stone-900 dark:text-white">
          Verified Problems Solved
        </h3>
        <span className="rounded-full bg-stone-100 dark:bg-slate-800 border border-stone-200/80 dark:border-slate-700 px-2.5 py-0.5 text-xs text-stone-600 dark:text-slate-300">
          Accuracy: <span className="font-bold text-stone-900 dark:text-white">{acceptanceRate}%</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Solved */}
        <div className="card-hover rounded-2xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="text-[10px] font-bold text-stone-400 dark:text-slate-500 uppercase tracking-wider">Total Solved</div>
          <div className="font-mono text-2xl font-black text-stone-900 dark:text-white mt-1.5">{totalSolved}</div>
          <div className="text-[11px] text-stone-500 dark:text-slate-400 mt-0.5">Across difficulties</div>
        </div>

        {/* Easy */}
        <div className="card-hover rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 shadow-sm">
          <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Easy</div>
          <div className="font-mono text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1.5">{easySolved}</div>
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/70 mt-0.5">Fundamentals</div>
        </div>

        {/* Medium */}
        <div className="card-hover rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4 shadow-sm">
          <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Medium</div>
          <div className="font-mono text-2xl font-black text-amber-700 dark:text-amber-400 mt-1.5">{mediumSolved}</div>
          <div className="text-[11px] text-amber-600/80 dark:text-amber-400/70 mt-0.5">Core DSA</div>
        </div>

        {/* Hard */}
        <div className="card-hover rounded-2xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-4 shadow-sm">
          <div className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Hard</div>
          <div className="font-mono text-2xl font-black text-rose-700 dark:text-rose-400 mt-1.5">{hardSolved}</div>
          <div className="text-[11px] text-rose-600/80 dark:text-rose-400/70 mt-0.5">Advanced mastery</div>
        </div>
      </div>
    </div>
  );
}
