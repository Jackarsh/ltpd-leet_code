"use client";

import { X, Calculator, Info, CheckCircle2 } from "lucide-react";
import { ScoreBreakdownDTO } from "@/types/leaderboard";
import { RANKING_CONFIG } from "@/lib/ranking-config";

interface RankingFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  breakdown?: ScoreBreakdownDTO;
}

export function RankingFormulaModal({
  isOpen,
  onClose,
  studentName,
  breakdown,
}: RankingFormulaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-xl bg-indigo-500/10 p-2.5 border border-indigo-500/20 text-indigo-400">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">
              {studentName ? `${studentName}'s Score Breakdown` : "College Ranking Methodology"}
            </h2>
            <p className="text-xs text-zinc-400">
              Deterministic, transparent scoring across all collegiate participants
            </p>
          </div>
        </div>

        {/* Dynamic Student Breakdown (if provided) */}
        {breakdown ? (
          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Contribution Calculation
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Easy Solved
                </span>
                <span className="text-zinc-300 font-mono">
                  {breakdown.easySolved} × {breakdown.easyWeight} ={" "}
                  <strong className="text-zinc-100">{breakdown.easyContribution}</strong> pts
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-amber-400 flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Medium Solved
                </span>
                <span className="text-zinc-300 font-mono">
                  {breakdown.mediumSolved} × {breakdown.mediumWeight} ={" "}
                  <strong className="text-zinc-100">{breakdown.mediumContribution}</strong> pts
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-rose-400 flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  Hard Solved
                </span>
                <span className="text-zinc-300 font-mono">
                  {breakdown.hardSolved} × {breakdown.hardWeight} ={" "}
                  <strong className="text-zinc-100">{breakdown.hardContribution}</strong> pts
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-indigo-400 flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                  Contest Rating
                </span>
                <span className="text-zinc-300 font-mono">
                  {breakdown.contestRating ? Math.round(breakdown.contestRating) : 0} ×{" "}
                  {breakdown.contestRatingWeight} ={" "}
                  <strong className="text-zinc-100">
                    {breakdown.contestRatingContribution.toFixed(1)}
                  </strong>{" "}
                  pts
                </span>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between font-bold">
                <span className="text-zinc-200">Total Weighted Score</span>
                <span className="text-indigo-400 text-base font-mono">
                  {breakdown.totalWeightedScore}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <div className="text-xs font-bold text-indigo-300 mb-2 uppercase tracking-wide">
              Standard Formula
            </div>
            <code className="text-xs font-mono text-zinc-200 block bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
              Score = (1.0 × Easy) + (3.0 × Medium) + (6.0 × Hard) + (0.5 × Contest Rating)
            </code>
          </div>
        )}

        {/* Deterministic Tie-Breaking Rules (FR-213) */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            <Info className="h-4 w-4 text-indigo-400" />
            Deterministic Tie-Breaking Sequence
          </div>
          <div className="space-y-1.5 text-xs text-zinc-400">
            {RANKING_CONFIG.tieBreakingSequence.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400/80 mt-0.5 shrink-0" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}