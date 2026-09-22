"use client";

import { X, Award, CheckCircle2 } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl text-slate-900 dark:text-white animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {studentName ? `${studentName}'s Score Breakdown` : "College Ranking Methodology"}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Deterministic, transparent collegiate competitive programming index
          </p>
        </div>

        {/* Dynamic Student Breakdown (if provided) */}
        {breakdown ? (
          <div className="mb-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Contribution Calculation
            </div>
            <div className="space-y-2.5 text-xs font-semibold">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="font-medium">Easy Solved</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {breakdown.easySolved} &times; {breakdown.easyWeight} ={" "}
                  <strong className="text-slate-900 dark:text-white">{breakdown.easyContribution}</strong> pts
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="font-medium">Medium Solved</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {breakdown.mediumSolved} &times; {breakdown.mediumWeight} ={" "}
                  <strong className="text-slate-900 dark:text-white">{breakdown.mediumContribution}</strong> pts
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="font-medium">Hard Solved</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {breakdown.hardSolved} &times; {breakdown.hardWeight} ={" "}
                  <strong className="text-slate-900 dark:text-white">{breakdown.hardContribution}</strong> pts
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="font-medium">Contest Rating</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {breakdown.contestRating ? Math.round(breakdown.contestRating) : 0} &times;{" "}
                  {breakdown.contestRatingWeight} ={" "}
                  <strong className="text-slate-900 dark:text-white">
                    {breakdown.contestRatingContribution.toFixed(1)}
                  </strong>{" "}
                  pts
                </span>
              </div>

              <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-black text-slate-900 dark:text-white">
                <span>Total Weighted Score</span>
                <span className="text-sm font-mono text-blue-600 dark:text-blue-400">
                  {breakdown.totalWeightedScore} pts
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Official Scoring Formula
            </div>
            <code className="text-xs font-mono text-slate-800 dark:text-slate-200 block bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed font-semibold">
              Score = (1.0 &times; Easy) + (3.0 &times; Medium) + (6.0 &times; Hard) + (0.5 &times; Contest Rating)
            </code>
          </div>
        )}

        {/* Deterministic Tie-Breaking Rules */}
        <div className="space-y-2 mb-6">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Deterministic Tie-Breaking Sequence
          </div>
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            {RANKING_CONFIG.tieBreakingSequence.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                <span className="font-medium text-slate-700 dark:text-slate-300">{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="rounded-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 px-5 py-2 text-xs font-bold text-white transition-colors shadow-sm btn-press"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
