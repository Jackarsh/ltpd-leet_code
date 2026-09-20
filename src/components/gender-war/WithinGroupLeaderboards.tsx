"use client";

import { useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { Users, ChevronDown, ChevronUp, AlertTriangle, ExternalLink } from "lucide-react";
import type { LeaderboardRowDTO, GenderGroup } from "@/types/gender-war";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LeaderboardPanelProps {
  gender: GenderGroup;
  /** Label displayed in the panel header. */
  label: string;
  /** Accent colour class applied to the gender label and rank badge. */
  accentClass: string;
  /** Top-10 rows pre-fetched server-side. */
  initialRows: LeaderboardRowDTO[];
  /** Total participant count for this gender group. */
  participantCount: number;
}

interface WithinGroupLeaderboardsProps {
  maleTop10: LeaderboardRowDTO[];
  femaleTop10: LeaderboardRowDTO[];
  maleParticipantCount: number;
  femaleParticipantCount: number;
}

// ---------------------------------------------------------------------------
// LeaderboardRow — a single ranked student row (FR-429)
// ---------------------------------------------------------------------------

function LeaderboardRow({ row, accentClass }: { row: LeaderboardRowDTO; accentClass: string }) {
  const initials = row.displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const academicMeta = [
    row.batch ? `'${row.batch.toString().slice(-2)}` : null,
    row.branch ?? null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/profiles/${encodeURIComponent(row.username)}`}
      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-zinc-800/60"
      aria-label={`View profile of ${row.displayName}`}
    >
      {/* Group rank badge (FR-429) */}
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
          row.groupRank === 1
            ? `${accentClass} bg-opacity-20 border border-current border-opacity-40`
            : row.groupRank <= 3
            ? "bg-zinc-700/60 text-zinc-200 border border-zinc-600/40"
            : "bg-zinc-900 text-zinc-400 border border-zinc-800"
        }`}
      >
        #{row.groupRank}
      </span>

      {/* Avatar */}
      {row.avatarUrl ? (
        <img
          src={row.avatarUrl}
          alt={row.displayName}
          className="h-8 w-8 shrink-0 rounded-full object-cover border border-zinc-700 group-hover:border-zinc-500 transition-colors"
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-[11px] font-bold text-zinc-300 group-hover:border-zinc-500 transition-colors">
          {initials}
        </div>
      )}

      {/* Name + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-zinc-100 group-hover:text-indigo-300 transition-colors">
            {row.displayName}
          </span>
          <ExternalLink className="h-3 w-3 shrink-0 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {academicMeta && (
          <span className="text-[11px] text-zinc-500">{academicMeta}</span>
        )}
      </div>

      {/* Stats: total solved + hard + rating (FR-429) */}
      <div className="flex shrink-0 items-center gap-3 text-right text-xs font-mono">
        {/* Total solved */}
        <div className="hidden sm:block">
          <div className="font-semibold text-zinc-100">{row.totalSolved}</div>
          <div className="text-[10px] text-zinc-500">solved</div>
        </div>

        {/* Hard solved */}
        <div className="hidden md:block">
          <div className="font-semibold text-rose-400">{row.hardSolved}</div>
          <div className="text-[10px] text-zinc-500">hard</div>
        </div>

        {/* Contest rating — "—" when null (FR-429) */}
        <div>
          <div className="font-semibold text-amber-400">
            {row.contestRating != null ? Math.round(row.contestRating) : "—"}
          </div>
          <div className="text-[10px] text-zinc-500">rating</div>
        </div>

        {/* College rank */}
        <div className="hidden sm:block">
          <div className="font-semibold text-zinc-300">
            {row.collegeRank != null ? `#${row.collegeRank}` : "—"}
          </div>
          <div className="text-[10px] text-zinc-500">college</div>
        </div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Tie-breaking legend
// ---------------------------------------------------------------------------

function TieBreakingLegend() {
  return (
    <p className="mt-1 text-[11px] text-zinc-500">
      Ranked by total solved · ties broken by hard solved · then college rank (FR-430)
    </p>
  );
}

// ---------------------------------------------------------------------------
// LeaderboardPanel — one gender group panel (FR-428)
// ---------------------------------------------------------------------------

function LeaderboardPanel({
  gender,
  label,
  accentClass,
  initialRows,
  participantCount,
}: LeaderboardPanelProps) {
  const [rows, setRows] = useState<LeaderboardRowDTO[]>(initialRows);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [hasMore, setHasMore] = useState(initialRows.length === 10);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const PAGE_SIZE = 25;

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/gender-war/leaderboard?gender=${gender}&page=${nextPage}&limit=${PAGE_SIZE}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as {
          rows: LeaderboardRowDTO[];
          hasMore: boolean;
        };
        setRows((prev) => [...prev, ...data.rows]);
        setHasMore(data.hasMore);
        setPage(nextPage);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load more");
      }
    });
  }, [gender, page]);

  const handleToggleExpand = () => {
    if (!expanded && rows.length <= 10) {
      // First expand: load page 2 with 25/page
      loadMore();
    }
    setExpanded((prev) => !prev);
  };

  const displayedRows = expanded ? rows : rows.slice(0, 10);

  return (
    <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <Users className={`h-4 w-4 ${accentClass}`} />
          <span className={`text-sm font-semibold ${accentClass}`}>{label}</span>
        </div>
        <span className="text-[11px] font-medium text-zinc-500">
          {participantCount} participant{participantCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-3 border-b border-zinc-800/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        <span className="w-7 shrink-0 text-center">#</span>
        <span className="w-8 shrink-0" aria-hidden />
        <span className="flex-1">Student</span>
        <div className="flex shrink-0 items-center gap-3 text-right">
          <span className="hidden w-10 sm:block text-right">Solved</span>
          <span className="hidden w-8 md:block text-right">Hard</span>
          <span className="w-10 text-right">Rating</span>
          <span className="hidden w-12 sm:block text-right">College</span>
        </div>
      </div>

      {/* Rows */}
      <div className="flex flex-col divide-y divide-zinc-800/40">
        {displayedRows.length === 0 ? (
          // FR-433: empty-state message when no participants
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <Users className="h-8 w-8 text-zinc-700" />
            <p className="text-sm font-medium text-zinc-500">No participants yet</p>
            <p className="text-xs text-zinc-600">
              Students in this group will appear here once they join the platform.
            </p>
          </div>
        ) : (
          displayedRows.map((row) => (
            <LeaderboardRow key={row.username} row={row} accentClass={accentClass} />
          ))
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 border-t border-zinc-800 px-4 py-2 text-xs text-rose-400">
          <AlertTriangle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}

      {/* View Full Leaderboard toggle (FR-428) */}
      {displayedRows.length > 0 && (initialRows.length === 10 || expanded) && (
        <button
          onClick={handleToggleExpand}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-1.5 border-t border-zinc-800 py-2.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800/40 hover:text-zinc-200 disabled:opacity-60"
        >
          {isPending ? (
            <span className="animate-pulse">Loading…</span>
          ) : expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Show Top 10
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              View Full Group Leaderboard
            </>
          )}
        </button>
      )}

      {/* Load more (visible only when expanded and more pages exist) */}
      {expanded && hasMore && !isPending && (
        <button
          onClick={loadMore}
          className="flex w-full items-center justify-center gap-1.5 border-t border-zinc-800/60 py-2 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-950/20 hover:text-indigo-300"
        >
          Load 25 more
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// WithinGroupLeaderboards — public composite component (FR-428 / FR-431)
// ---------------------------------------------------------------------------

/**
 * Renders two within-group leaderboards (Male and Female) side-by-side.
 *
 * - Each panel shows the top-10 students by default (FR-428).
 * - "View Full Group Leaderboard" expands with paginated fetch (25/page).
 * - Clicking a row navigates to the student's public profile (FR-432).
 * - An empty-state is shown when a group has zero students (FR-433).
 * - A student appears in exactly one panel based on their stored gender (FR-431).
 */
export function WithinGroupLeaderboards({
  maleTop10,
  femaleTop10,
  maleParticipantCount,
  femaleParticipantCount,
}: WithinGroupLeaderboardsProps) {
  return (
    <section aria-labelledby="within-group-leaderboards-heading">
      <div className="mb-3">
        <h2
          id="within-group-leaderboards-heading"
          className="text-base font-semibold text-zinc-100"
        >
          Within-Group Leaderboards
        </h2>
        <TieBreakingLegend />
      </div>

      {/* Side-by-side panels — stacked on mobile, 2 cols on md+ */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <LeaderboardPanel
          gender="MALE"
          label="Male"
          accentClass="text-blue-400"
          initialRows={maleTop10}
          participantCount={maleParticipantCount}
        />
        <LeaderboardPanel
          gender="FEMALE"
          label="Female"
          accentClass="text-rose-400"
          initialRows={femaleTop10}
          participantCount={femaleParticipantCount}
        />
      </div>
    </section>
  );
}
