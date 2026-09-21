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
    <div className="card-hover rounded-xl border border-[#30363d] bg-[#161b22] p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-[#21262d] pb-2.5">
        <div>
          <h3 className="font-display text-sm font-bold text-[#e6edf3]">Contest Performance</h3>
          <p className="text-[11px] text-[#848d97]">Verified LeetCode rating</p>
        </div>

        {contestRating ? (
          <span className="font-mono text-lg font-bold text-[#e6edf3]">
            {Math.round(contestRating)}
          </span>
        ) : (
          <span className="text-xs text-[#848d97] font-medium">Unrated</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#848d97] font-semibold">
            Global Rank
          </span>
          <div className="font-mono text-sm font-bold text-[#e6edf3] mt-0.5">
            {globalContestRank ? `#${globalContestRank.toLocaleString()}` : "—"}
          </div>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#848d97] font-semibold">
            Contests Attended
          </span>
          <div className="font-mono text-sm font-bold text-[#e6edf3] mt-0.5">
            {contestsAttended}
          </div>
        </div>
      </div>
    </div>
  );
}
