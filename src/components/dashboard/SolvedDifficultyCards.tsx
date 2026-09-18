import React from "react";
import { CheckCircle2, Award, Zap, Target } from "lucide-react";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
          <Target className="h-4 w-4 text-indigo-400" />
          Problems Solved
        </h3>
        <span className="text-xs text-zinc-400">
          Accuracy: <span className="font-semibold text-zinc-200">{acceptanceRate}%</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Solved */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-zinc-900/60 to-zinc-900/40 p-4 relative overflow-hidden">
          <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Total</div>
          <div className="text-3xl font-extrabold text-white mt-2">{totalSolved}</div>
          <div className="text-[11px] text-zinc-400 mt-1">Solved overall</div>
        </div>

        {/* Easy */}
        <div className="rounded-2xl border border-emerald-500/20 bg-zinc-900/40 p-4">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Easy
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-2">{easySolved}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Fundamentals</div>
        </div>

        {/* Medium */}
        <div className="rounded-2xl border border-amber-500/20 bg-zinc-900/40 p-4">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Zap className="h-3 w-3" /> Medium
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-2">{mediumSolved}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Interview core</div>
        </div>

        {/* Hard */}
        <div className="rounded-2xl border border-rose-500/20 bg-zinc-900/40 p-4">
          <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <Award className="h-3 w-3" /> Hard
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-2">{hardSolved}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Advanced mastery</div>
        </div>
      </div>
    </div>
  );
}