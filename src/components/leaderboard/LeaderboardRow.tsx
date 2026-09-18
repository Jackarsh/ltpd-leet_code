"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, AlertTriangle, Calculator, ExternalLink } from "lucide-react";
import { LeaderboardRowDTO } from "@/types/leaderboard";
import { RankingFormulaModal } from "@/components/leaderboard/RankingFormulaModal";

interface LeaderboardRowProps {
  row: LeaderboardRowDTO;
  isCurrentUser?: boolean;
}

export function LeaderboardRow({ row, isCurrentUser = false }: LeaderboardRowProps) {
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  // Formatting helpers for missing optional academic info (US10)
  const academicDetails = [
    row.branch ? row.branch.toUpperCase() : null,
    row.graduationYear ? `'${row.graduationYear.toString().slice(-2)}` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  const formatRelativeTime = (isoString: string | null) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    const diffHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <>
      <tr
        className={`border-b border-zinc-850 hover:bg-zinc-900/60 transition-colors ${
          isCurrentUser ? "bg-indigo-950/20 border-l-2 border-l-indigo-500" : ""
        }`}
      >
        {/* 1. College Rank (FR-204) */}
        <td className="py-3.5 pl-4 pr-3 text-sm font-semibold">
          {row.collegeRank ? (
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                  row.collegeRank === 1
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : row.collegeRank === 2
                    ? "bg-slate-400/20 text-slate-200 border border-slate-400/40"
                    : row.collegeRank === 3
                    ? "bg-amber-700/20 text-amber-400 border border-amber-700/40"
                    : "bg-zinc-800 text-zinc-300"
                }`}
              >
                #{row.collegeRank}
              </span>
            </div>
          ) : (
            <span className="text-xs text-zinc-400 font-mono">—</span>
          )}
        </td>

        {/* 2. Student Info (Avatar, Name, Handle, Batch/Branch) */}
        <td className="py-3.5 px-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/profiles/${encodeURIComponent(row.leetcodeUsername)}`}
              className="relative shrink-0 group"
            >
              {row.avatarUrl ? (
                <img
                  src={row.avatarUrl}
                  alt={row.displayName}
                  className="h-9 w-9 rounded-full object-cover border border-zinc-750 group-hover:border-indigo-500 transition-colors"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center font-bold text-xs text-indigo-300 group-hover:border-indigo-400 transition-colors">
                  {row.displayName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
              )}
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/profiles/${encodeURIComponent(row.leetcodeUsername)}`}
                  className="font-medium text-sm text-zinc-100 hover:text-indigo-400 transition-colors truncate"
                >
                  {row.displayName}
                </Link>
                {isCurrentUser && (
                  <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                    You
                  </span>
                )}
                {row.isStale && (
                  <span
                    title={`Data last synced ${formatRelativeTime(row.lastSyncAt)}`}
                    className="flex items-center gap-0.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20"
                  >
                    <AlertTriangle className="h-2.5 w-2.5" />
                    Stale
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>@{row.leetcodeUsername}</span>
                {academicDetails && (
                  <>
                    <span>•</span>
                    <span className="text-zinc-400">{academicDetails}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </td>

        {/* 3. Total Solved */}
        <td className="py-3.5 px-3 text-sm font-semibold text-zinc-100">
          {row.isSynced && row.totalSolved !== null ? (
            row.totalSolved
          ) : (
            <span className="text-xs text-zinc-400 font-mono">Pending</span>
          )}
        </td>

        {/* 4. Problem Difficulty Breakdown (Easy / Med / Hard) */}
        <td className="py-3.5 px-3 text-xs hidden sm:table-cell">
          {row.isSynced ? (
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-emerald-400 font-medium" title="Easy Solved">
                {row.easySolved ?? 0}
              </span>
              <span className="text-zinc-600">/</span>
              <span className="text-amber-400 font-medium" title="Medium Solved">
                {row.mediumSolved ?? 0}
              </span>
              <span className="text-zinc-600">/</span>
              <span className="text-rose-400 font-medium" title="Hard Solved">
                {row.hardSolved ?? 0}
              </span>
            </div>
          ) : (
            <span className="text-zinc-400">—</span>
          )}
        </td>

        {/* 5. Contest Rating (US8 - '—' when unrated) */}
        <td className="py-3.5 px-3 text-sm hidden md:table-cell">
          {row.isSynced && row.contestRating !== null && row.contestRating > 0 ? (
            <div className="font-semibold text-zinc-200">
              {Math.round(row.contestRating)}
            </div>
          ) : (
            <span className="text-xs text-zinc-400 font-mono" title="No contest rating">
              —
            </span>
          )}
        </td>

        {/* 6. Streak */}
        <td className="py-3.5 px-3 text-sm hidden lg:table-cell">
          {row.isSynced && row.currentStreak !== null && row.currentStreak > 0 ? (
            <div className="flex items-center gap-1 text-amber-400 font-semibold text-xs">
              <Flame className="h-3.5 w-3.5 fill-amber-400/20" />
              <span>{row.currentStreak}d</span>
            </div>
          ) : (
            <span className="text-xs text-zinc-400 font-mono">0d</span>
          )}
        </td>

        {/* 7. Overall Weighted Score & Formula Breakdown trigger (US2, US7) */}
        <td className="py-3.5 pl-3 pr-4 text-right">
          {row.isSynced && row.weightedScore !== null ? (
            <button
              onClick={() => setShowFormulaModal(true)}
              title="Click to view transparent score breakdown"
              className="group inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-sm font-bold text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-950/30 transition-all font-mono"
            >
              <span>{row.weightedScore}</span>
              <Calculator className="h-3.5 w-3.5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
            </button>
          ) : (
            <span className="text-xs text-zinc-400 font-mono">—</span>
          )}
        </td>
      </tr>

      {/* Transparent Formula Breakdown Modal for this Student */}
      {row.scoreBreakdown && (
        <RankingFormulaModal
          isOpen={showFormulaModal}
          onClose={() => setShowFormulaModal(false)}
          studentName={row.displayName}
          breakdown={row.scoreBreakdown}
        />
      )}
    </>
  );
}