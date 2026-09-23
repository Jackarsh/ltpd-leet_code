"use client";

import { useState } from "react";
import Link from "next/link";
import { Info, ExternalLink, Star, Trophy, Flame } from "lucide-react";
import { LeaderboardRowDTO } from "@/types/leaderboard";
import { RankingFormulaModal } from "@/components/leaderboard/RankingFormulaModal";
import { normalizeBranch } from "@/lib/constants/branches";

interface LeaderboardRowProps {
  row: LeaderboardRowDTO;
  isCurrentUser?: boolean;
}

export function LeaderboardRow({ row, isCurrentUser = false }: LeaderboardRowProps) {
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const academicDetails = [
    row.graduationYear ? `Batch ${row.graduationYear}` : null,
    normalizeBranch(row.branch),
    `@${row.leetcodeUsername}`,
  ]
    .filter(Boolean)
    .join(" \u00B7 ");

  const getRankBadgeClass = (rank?: number | null) => {
    if (rank === 1) {
      return "bg-blue-600 text-white ring-2 ring-amber-400 shadow-md";
    }
    if (rank === 2) {
      return "bg-blue-600 text-white ring-2 ring-slate-300 shadow-sm";
    }
    if (rank === 3) {
      return "bg-blue-600 text-white ring-2 ring-amber-600/60 shadow-sm";
    }
    return "bg-blue-600 text-white";
  };

  return (
    <>
      <div
        className={`card-hover relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all ${
          isCurrentUser
            ? "border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 ring-2 ring-blue-500/20 shadow-md"
            : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400/50 dark:hover:border-blue-500/50 shadow-sm"
        }`}
      >
        {/* Left: Avatar + Identity + Stats */}
        <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
          {/* Avatar container (IMDb movie poster style) */}
          <div className="shrink-0 relative">
            <Link href={`/profiles/${encodeURIComponent(row.leetcodeUsername)}`}>
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner group">
                {row.avatarUrl ? (
                  <img
                    src={row.avatarUrl}
                    alt={row.displayName}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-display font-black text-xl sm:text-2xl group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                    {row.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Details Section */}
          <div className="min-w-0 flex-1">
            {/* Top row: Rank badge + Student Name + Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-black tracking-wide ${getRankBadgeClass(
                  row.collegeRank
                )}`}
              >
                #{row.collegeRank ?? "—"}
              </span>

              <Link
                href={`/profiles/${encodeURIComponent(row.leetcodeUsername)}`}
                className="font-display text-base sm:text-lg font-black text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
              >
                {row.displayName}
              </Link>

              {isCurrentUser && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  You
                </span>
              )}

              {row.isStale && (
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  Stale
                </span>
              )}
            </div>

            {/* Academic metadata */}
            <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5 mb-2 font-medium">
              <span>{academicDetails}</span>
            </div>

            {/* Metrics Chips Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Star Rating / Weighted Score */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 font-extrabold text-xs">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>{row.weightedScore ? row.weightedScore.toFixed(1) : "0.0"} pts</span>
              </div>

              {/* Total Solved Chip */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                <span className="font-mono font-bold text-slate-900 dark:text-white">{row.totalSolved ?? 0}</span>
                <span className="text-slate-500 dark:text-slate-400">Solved</span>
              </div>

              {/* Solved breakdown E / M / H */}
              <div className="flex items-center gap-1 font-mono text-[11px] font-bold">
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                  {row.easySolved ?? 0}E
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                  {row.mediumSolved ?? 0}M
                </span>
                <span className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
                  {row.hardSolved ?? 0}H
                </span>
              </div>

              {/* Contest Rating */}
              {row.contestRating ? (
                <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-medium text-xs">
                  <Trophy className="h-3 w-3 text-indigo-500 dark:text-indigo-400" />
                  <span>{Math.round(row.contestRating)} Rating</span>
                </div>
              ) : null}

              {/* Streak */}
              {(row.currentStreak ?? 0) > 0 ? (
                <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-800/60 text-orange-700 dark:text-orange-300 font-medium text-xs">
                  <Flame className="h-3 w-3 text-orange-500 dark:text-orange-400" />
                  <span>{row.currentStreak}d</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Action column removed per requirements */}
      </div>

      {showFormulaModal && (
        <RankingFormulaModal
          isOpen={showFormulaModal}
          onClose={() => setShowFormulaModal(false)}
        />
      )}
    </>
  );
}
