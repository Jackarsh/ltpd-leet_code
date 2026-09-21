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

  return (
    <>
      <div
        className={`card-hover relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
          isCurrentUser
            ? "border-[#484f58] bg-[#161b22] ring-1 ring-[#484f58]"
            : "border-[#21262d] bg-[#161b22] hover:border-[#30363d]"
        }`}
      >
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="shrink-0">
            <Link href={`/profiles/${encodeURIComponent(row.leetcodeUsername)}`}>
              <div className="h-14 w-14 rounded-lg overflow-hidden border border-[#21262d] bg-[#0d1117] flex items-center justify-center">
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
                  <div className="h-full w-full flex items-center justify-center bg-[#21262d] text-[#e6edf3] font-display font-bold text-lg">
                    {row.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </Link>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#21262d] text-[#e6edf3] border border-[#30363d]">
                #{row.collegeRank ?? "—"}
              </span>

              <Link
                href={`/profiles/${encodeURIComponent(row.leetcodeUsername)}`}
                className="font-display text-base font-bold text-[#e6edf3] hover:text-[#c9d1d9] transition-colors truncate"
              >
                {row.displayName}
              </Link>

              {isCurrentUser && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#21262d] text-[#848d97] border border-[#30363d]">
                  You
                </span>
              )}

              {row.isStale && (
                <span className="text-[11px] text-[#6e7681] bg-[#21262d] px-1.5 py-0.5 rounded border border-[#30363d]">
                  Stale
                </span>
              )}
            </div>

            <div className="text-xs text-[#848d97] flex flex-wrap items-center gap-1.5 mb-2">
              <span>{academicDetails}</span>
              {row.lastSyncAt && (
                <>
                  <span>&middot;</span>
                  <span>Synced {formatRelativeTime(row.lastSyncAt)}</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#e6edf3]">
              <div className="font-medium">
                <span className="text-[#848d97]">Rating: </span>
                <span className="font-mono font-bold">{row.contestRating ? Math.round(row.contestRating) : "Unrated"}</span>
              </div>

              <div>
                <span className="font-mono font-bold">{row.totalSolved ?? 0}</span>
                <span className="text-[#848d97] ml-1">
                  Solved ({row.easySolved ?? 0}E &middot; {row.mediumSolved ?? 0}M &middot; {row.hardSolved ?? 0}H)
                </span>
              </div>

              {(row.currentStreak ?? 0) > 0 && (
                <div className="text-[#848d97]">
                  <span className="font-mono font-semibold text-[#e6edf3]">{row.currentStreak}d</span> streak
                </div>
              )}

              <div className="hidden md:flex items-center gap-3 pl-2 border-l border-[#30363d]">
                <Link
                  href={`/profiles/${encodeURIComponent(row.leetcodeUsername)}`}
                  className="text-[#848d97] hover:text-[#e6edf3] hover:underline text-[11px] font-medium"
                >
                  Profile
                </Link>
                <a
                  href={`https://leetcode.com/u/${encodeURIComponent(row.leetcodeUsername)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#848d97] hover:text-[#e6edf3] text-[11px] flex items-center gap-1"
                >
                  <span>LeetCode</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Score + Info */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#21262d]">
          <div className="text-left sm:text-right">
            <div className="text-[10px] uppercase tracking-wider text-[#6e7681] font-semibold">
              Score
            </div>
            <div className="font-mono text-base font-bold text-[#e6edf3]">
              {row.weightedScore ? row.weightedScore.toFixed(1) : "0.0"}
            </div>
          </div>

          <button
            onClick={() => setShowFormulaModal(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#30363d] bg-[#21262d] text-[#848d97] hover:text-[#e6edf3] hover:border-[#484f58] transition-colors"
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
