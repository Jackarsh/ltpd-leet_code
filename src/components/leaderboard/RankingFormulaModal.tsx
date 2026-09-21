"use client";

import { X } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#30363d] bg-[#161b22] p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#848d97] hover:bg-[#21262d] hover:text-[#e6edf3] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-5 border-b border-[#21262d] pb-3">
          <h2 className="text-base font-bold text-[#e6edf3]">
            {studentName ? `${studentName}'s Score Breakdown` : "College Ranking Methodology"}
          </h2>
          <p className="text-xs text-[#848d97] mt-0.5">
            Deterministic, transparent scoring across all collegiate participants
          </p>
        </div>

        {/* Dynamic Student Breakdown (if provided) */}
        {breakdown ? (
          <div className="mb-5 rounded-xl border border-[#30363d] bg-[#0d1117] p-4">
            <div className="text-[11px] font-semibold text-[#848d97] uppercase tracking-wider mb-3">
              Contribution Calculation
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#848d97] font-medium">Easy Solved</span>
                <span className="text-[#e6edf3] font-mono">
                  {breakdown.easySolved} &times; {breakdown.easyWeight} ={" "}
                  <strong className="text-[#e6edf3]">{breakdown.easyContribution}</strong> pts
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#848d97] font-medium">Medium Solved</span>
                <span className="text-[#e6edf3] font-mono">
                  {breakdown.mediumSolved} &times; {breakdown.mediumWeight} ={" "}
                  <strong className="text-[#e6edf3]">{breakdown.mediumContribution}</strong> pts
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#848d97] font-medium">Hard Solved</span>
                <span className="text-[#e6edf3] font-mono">
                  {breakdown.hardSolved} &times; {breakdown.hardWeight} ={" "}
                  <strong className="text-[#e6edf3]">{breakdown.hardContribution}</strong> pts
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#848d97] font-medium">Contest Rating</span>
                <span className="text-[#e6edf3] font-mono">
                  {breakdown.contestRating ? Math.round(breakdown.contestRating) : 0} &times;{" "}
                  {breakdown.contestRatingWeight} ={" "}
                  <strong className="text-[#e6edf3]">
                    {breakdown.contestRatingContribution.toFixed(1)}
                  </strong>{" "}
                  pts
                </span>
              </div>

              <div className="pt-2.5 border-t border-[#21262d] flex items-center justify-between font-bold">
                <span className="text-[#848d97]">Total Weighted Score</span>
                <span className="text-[#e6edf3] text-sm font-mono">
                  {breakdown.totalWeightedScore}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-5 rounded-xl border border-[#30363d] bg-[#0d1117] p-4">
            <div className="text-[11px] font-semibold text-[#848d97] mb-2 uppercase tracking-wide">
              Standard Formula
            </div>
            <code className="text-xs font-mono text-[#e6edf3] block bg-[#161b22] p-2.5 rounded-lg border border-[#21262d]">
              Score = (1.0 &times; Easy) + (3.0 &times; Medium) + (6.0 &times; Hard) + (0.5 &times; Contest Rating)
            </code>
          </div>
        )}

        {/* Deterministic Tie-Breaking Rules */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-[#848d97] uppercase tracking-wider">
            Deterministic Tie-Breaking Sequence
          </div>
          <div className="space-y-1.5 text-xs text-[#848d97]">
            {RANKING_CONFIG.tieBreakingSequence.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#6e7681] font-mono text-[11px] shrink-0">{idx + 1}.</span>
                <span className="text-[#c9d1d9]">{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#21262d] border border-[#30363d] px-4 py-2 text-xs font-semibold text-[#e6edf3] hover:bg-[#30363d] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
