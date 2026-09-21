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
        <h3 className="font-display text-sm font-bold text-[#e6edf3]">
          Verified Problems Solved
        </h3>
        <span className="text-xs text-[#848d97]">
          Accuracy: <span className="font-semibold text-[#e6edf3]">{acceptanceRate}%</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Solved */}
        <div className="card-hover rounded-xl border border-[#30363d] bg-[#161b22] p-3.5">
          <div className="text-[10px] font-bold text-[#848d97] uppercase tracking-wider">Total Solved</div>
          <div className="font-mono text-2xl font-bold text-[#e6edf3] mt-1.5">{totalSolved}</div>
          <div className="text-[11px] text-[#6e7681] mt-0.5">Across all difficulties</div>
        </div>

        {/* Easy */}
        <div className="card-hover rounded-xl border border-[#30363d] bg-[#161b22] p-3.5">
          <div className="text-[10px] font-bold text-[#848d97] uppercase tracking-wider">Easy</div>
          <div className="font-mono text-2xl font-bold text-[#e6edf3] mt-1.5">{easySolved}</div>
          <div className="text-[11px] text-[#6e7681] mt-0.5">Fundamentals</div>
        </div>

        {/* Medium */}
        <div className="card-hover rounded-xl border border-[#30363d] bg-[#161b22] p-3.5">
          <div className="text-[10px] font-bold text-[#848d97] uppercase tracking-wider">Medium</div>
          <div className="font-mono text-2xl font-bold text-[#e6edf3] mt-1.5">{mediumSolved}</div>
          <div className="text-[11px] text-[#6e7681] mt-0.5">Core DSA</div>
        </div>

        {/* Hard */}
        <div className="card-hover rounded-xl border border-[#30363d] bg-[#161b22] p-3.5">
          <div className="text-[10px] font-bold text-[#848d97] uppercase tracking-wider">Hard</div>
          <div className="font-mono text-2xl font-bold text-[#e6edf3] mt-1.5">{hardSolved}</div>
          <div className="text-[11px] text-[#6e7681] mt-0.5">Advanced mastery</div>
        </div>
      </div>
    </div>
  );
}
