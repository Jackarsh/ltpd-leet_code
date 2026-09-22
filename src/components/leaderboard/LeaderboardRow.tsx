"use client";

import { useState } from "react";
import Link from "next/link";
import { Info, ExternalLink } from "lucide-react";
import { LeaderboardRowDTO } from "@/types/leaderboard";
import { RankingFormulaModal } from "@/components/leaderboard/RankingFormulaModal";

interface LeaderboardRowProps {
  row: LeaderboardRowDTO;
  isCurrentUser?: boolean;
}

export function LeaderboardRow({ row, isCurrentUser = false }: LeaderboardRowProps) {
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const academicDetails = [
    row.graduationYear ? `Batch ${row.graduationYear}` : null,
    row.branch ? row.branch.toUpperCase() : null,
    `@${row.leetcodeUsername}`,
  ]
    .filter(Boolean)
    .join(" \u00B7 ");

  const formatRelativeTime = (isoString: string | null) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    const diffHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getRankBadgeStyle = (rank?: number | null) => {
    if (rank === 1) return "bg-[#c89b68]/20 text-[#f3cf98] border-[#c89b68]/50 shadow-sm shadow-[#c89b68]/10";
    if (rank === 2) return "bg-[#3a4959]/35 text-[#d8e2ec] border-[#4f6479]/50";
    if (rank === 3) return "bg-[#8c5e32]/25 text-[#e4b285] border-[#8c5e32]/50";
    return "bg-[#18212b] text-[#8d98a5] border-[#25303e]";
  };

  return (
    <>
      <div
        className={`card-hover relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
          isCurrentUser
            ? "border-[#c89b68]/50 bg-[#141c26] ring-1 ring-[#c89b68]/30 shadow-md shadow-black/30"
            : "border-[#1e2632] bg-[#121820] hover:border-[#384a5e] shadow-sm shadow-black/20"
        }`}
      >
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="shrink-0">
            <Link href={`/profiles/${encodeURIComponent(row.leetcodeUsername)}`}>
              <div className="h-14 w-14 rounded-lg overflow-hidden border border-[#1e2632] bg-[#0b0f14] flex items-center justify-center">
                {row.avatarUrl ? (
                  <img
                    src={row.avatarUrl}
                    alt={row.displayName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-[#18212b] text-[#f3cf98] font-display font-bold text-lg">
                    {row.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </Link>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold border ${getRankBadgeStyle(row.collegeRank)}`}>
                #{row.collegeRank ?? "—"}
              </span>

              <Link
                href={`/profiles/${encodeURIComponent(row.leetcodeUsername)}`}
                className="font-display text-base font-bold text-[#ece8e1] hover:text-[#e5b882] transition-colors truncate"
              >
                {row.displayName}
              </Link>

              {isCurrentUser && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#c89b68]/15 text-[#e5b882] border border-[#c89b68]/30">
                  You
                </span>
              )}

              {row.isStale && (
                <span className="text-[11px] text-[#6b7785] bg-[#18212b] px-1.5 py-0.5 rounded border border-[#25303e]">
                  Stale
                </span>
              )}
            </div>

            <div className="text-xs text-[#8d98a5] flex flex-wrap items-center gap-1.5 mb-2">
              <span>{academicDetails}</span>
              {row.lastSyncAt && (
                <>
                  <span>&middot;</span>
                  <span>Synced {formatRelativeTime(row.lastSyncAt)}</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#ece8e1]">
              <div className="font-medium">
                <span className="text-[#8d98a5]">Rating: </span>
                <span className="font-mono font-bold text-[#ece8e1]">{row.contestRating ? Math.round(row.contestRating) : "Unrated"}</span>
              </div>

              <div>
                <span className="font-mono font-bold">{row.totalSolved ?? 0}</span>
                <span className="text-[#8d98a5] ml-1">
                  Solved (<span className="text-[#5fa999]">{row.easySolved ?? 0}E</span> &middot; <span className="text-[#d4a373]">{row.mediumSolved ?? 0}M</span> &middot; <span className="text-[#cf6679]">{row.hardSolved ?? 0}H</span>)
                </span>
              </div>

              {(row.currentStreak ?? 0) > 0 && (
                <div className="text-[#8d98a5]">
                  <span className="font-mono font-semibold text-[#e59866]">{row.currentStreak}d</span> streak
                </div>
              )}

              <div className="hidden md:flex items-center gap-3 pl-2 border-l border-[#25303e]">
                <Link
                  href={`/profiles/${encodeURIComponent(row.leetcodeUsername)}`}
                  className="text-[#8d98a5] hover:text-[#ece8e1] hover:underline text-[11px] font-medium"
                >
                  Profile
                </Link>
                <a
                  href={`https://leetcode.com/u/${encodeURIComponent(row.leetcodeUsername)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8d98a5] hover:text-[#ece8e1] text-[11px] flex items-center gap-1"
                >
                  <span>LeetCode</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Score + Info */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1e2632]">
          <div className="text-left sm:text-right">
            <div className="text-[10px] uppercase tracking-wider text-[#6b7785] font-semibold">
              Score
            </div>
            <div className="font-mono text-base font-bold text-[#ece8e1]">
              {row.weightedScore ? row.weightedScore.toFixed(1) : "0.0"}
            </div>
          </div>

          <button
            onClick={() => setShowFormulaModal(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#25303e] bg-[#18212b] text-[#8d98a5] hover:text-[#ece8e1] hover:border-[#c89b68]/40 transition-colors"
            title="View score formula"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
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
