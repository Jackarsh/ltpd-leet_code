"use client";

import React from "react";

interface Props {
  contestRating: number | null;
  globalContestRank: number | null;
  contestsAttended: number;
}

export function ContestRatingCard({
  contestRating,
  globalContestRank,
  contestsAttended,
}: Props) {
  return (
    <div className="card-hover rounded-2xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="font-display text-sm font-bold text-stone-900 dark:text-white">Contest Performance</h3>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">Verified LeetCode rating & standing</p>
        </div>

        {contestRating ? (
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-slate-800 border border-stone-200/80 dark:border-slate-700 px-3 py-1 rounded-xl">
            <span className="text-xs text-stone-500 dark:text-slate-400 font-medium">Rating</span>
            <span className="font-mono text-base font-black text-stone-900 dark:text-white">
              {Math.round(contestRating)}
            </span>
          </div>
        ) : (
          <span className="text-xs text-stone-400 dark:text-slate-500 font-medium bg-stone-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">Unrated</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-stone-200/80 dark:border-slate-800 bg-stone-50/70 dark:bg-slate-800/40 p-3.5">
          <span className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-slate-500 font-bold">
            Global Rank
          </span>
          <div className="font-mono text-base font-bold text-stone-900 dark:text-white mt-1">
            {globalContestRank ? `#${globalContestRank.toLocaleString()}` : "—"}
          </div>
        </div>

        <div className="rounded-xl border border-stone-200/80 dark:border-slate-800 bg-stone-50/70 dark:bg-slate-800/40 p-3.5">
          <span className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-slate-500 font-bold">
            Contests Attended
          </span>
          <div className="font-mono text-base font-bold text-stone-900 dark:text-white mt-1">
            {contestsAttended}
          </div>
        </div>
      </div>
    </div>
  );
}
