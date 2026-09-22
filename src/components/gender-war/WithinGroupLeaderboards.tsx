"use client";

import { useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { Users, ChevronDown, ChevronUp, AlertTriangle, ExternalLink } from "lucide-react";
import type { LeaderboardRowDTO, GenderGroup } from "@/types/gender-war";

interface LeaderboardPanelProps {
  gender: GenderGroup;
  label: string;
  accentClass: string;
  badgeBg: string;
  initialRows: LeaderboardRowDTO[];
  participantCount: number;
}

interface WithinGroupLeaderboardsProps {
  maleTop10: LeaderboardRowDTO[];
  femaleTop10: LeaderboardRowDTO[];
  maleParticipantCount: number;
  femaleParticipantCount: number;
}

function LeaderboardRow({
  row,
  accentClass,
  badgeBg,
}: {
  row: LeaderboardRowDTO;
  accentClass: string;
  badgeBg: string;
}) {
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
      className="group flex items-center gap-3 px-4 py-3 transition-all hover:bg-stone-50 dark:hover:bg-slate-800/60"
      aria-label={`View profile of ${row.displayName}`}
    >
      {/* Group rank badge */}
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
          row.groupRank === 1
            ? `${badgeBg} ${accentClass} ring-2 ring-amber-400 font-black`
            : row.groupRank <= 3
            ? `${badgeBg} ${accentClass} font-extrabold`
            : "bg-stone-100 text-stone-600 dark:bg-slate-800 dark:text-slate-300 font-bold"
        }`}
      >
        #{row.groupRank}
      </span>

      {/* Avatar */}
      {row.avatarUrl ? (
        <img
          src={row.avatarUrl}
          alt={row.displayName}
          className="h-9 w-9 shrink-0 rounded-xl object-cover border border-stone-200 dark:border-slate-700 group-hover:border-stone-400 transition-colors shadow-sm"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs font-black text-stone-700 dark:text-slate-300 group-hover:border-stone-400 transition-colors">
          {initials}
        </div>
      )}

      {/* Name + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-xs sm:text-sm font-bold text-stone-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {row.displayName}
          </span>
          <ExternalLink className="h-3 w-3 shrink-0 text-stone-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {academicMeta && (
          <span className="text-[11px] text-stone-500 dark:text-slate-400 font-medium">{academicMeta}</span>
        )}
      </div>

      {/* Stats */}
      <div className="flex shrink-0 items-center gap-3 text-right text-xs font-mono">
        <div className="hidden sm:block">
          <div className="font-bold text-stone-900 dark:text-slate-100">{row.totalSolved}</div>
          <div className="text-[10px] text-stone-500 dark:text-slate-400 font-sans">solved</div>
        </div>

        <div className="hidden md:block">
          <div className="font-bold text-rose-600 dark:text-rose-400">{row.hardSolved}</div>
          <div className="text-[10px] text-stone-500 dark:text-slate-400 font-sans">hard</div>
        </div>

        <div>
          <div className="font-bold text-amber-600 dark:text-amber-400">
            {row.contestRating != null ? Math.round(row.contestRating) : "—"}
          </div>
          <div className="text-[10px] text-stone-500 dark:text-slate-400 font-sans">rating</div>
        </div>

        <div className="hidden sm:block">
          <div className="font-bold text-stone-700 dark:text-slate-300">
            {row.collegeRank != null ? `#${row.collegeRank}` : "—"}
          </div>
          <div className="text-[10px] text-stone-500 dark:text-slate-400 font-sans">college</div>
        </div>
      </div>
    </Link>
  );
}

function TieBreakingLegend() {
  return (
    <p className="mt-1 text-xs text-stone-500 dark:text-slate-400 font-medium">
      Ranked by total solved · ties broken by hard solved · then college rank
    </p>
  );
}

function LeaderboardPanel({
  gender,
  label,
  accentClass,
  badgeBg,
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
        const data = (await res.json()) as {
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
      loadMore();
    }
    setExpanded((prev) => !prev);
  };

  const displayedRows = expanded ? rows : rows.slice(0, 10);

  return (
    <div className="flex flex-col rounded-2xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-100 dark:border-slate-800 bg-stone-50/70 dark:bg-slate-800/60 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Users className={`h-4 w-4 ${accentClass}`} />
          <span className={`text-sm font-extrabold ${accentClass}`}>{label} Leaderboard</span>
        </div>
        <span className="text-xs font-bold text-stone-500 dark:text-slate-400">
          {participantCount} coder{participantCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-3 border-b border-stone-100 dark:border-slate-800 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-500 bg-stone-50/30 dark:bg-slate-800/30">
        <span className="w-7 shrink-0 text-center">#</span>
        <span className="w-9 shrink-0" aria-hidden />
        <span className="flex-1">Student</span>
        <div className="flex shrink-0 items-center gap-3 text-right">
          <span className="hidden w-10 sm:block text-right">Solved</span>
          <span className="hidden w-8 md:block text-right">Hard</span>
          <span className="w-10 text-right">Rating</span>
          <span className="hidden w-12 sm:block text-right">Rank</span>
        </div>
      </div>

      {/* Rows */}
      <div className="flex flex-col divide-y divide-stone-100 dark:divide-slate-800">
        {displayedRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Users className="h-8 w-8 text-stone-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-stone-700 dark:text-slate-300">No participants yet</p>
            <p className="text-xs text-stone-500 dark:text-slate-400 max-w-xs">
              Students in this group will appear here once they link and sync their LeetCode profile.
            </p>
          </div>
        ) : (
          displayedRows.map((row) => (
            <LeaderboardRow
              key={row.username}
              row={row}
              accentClass={accentClass}
              badgeBg={badgeBg}
            />
          ))
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 border-t border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-4 py-2 text-xs text-rose-700 dark:text-rose-300 font-semibold">
          <AlertTriangle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}

      {/* View Full Leaderboard toggle */}
      {displayedRows.length > 0 && (initialRows.length === 10 || expanded) && (
        <button
          onClick={handleToggleExpand}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-1.5 border-t border-stone-100 dark:border-slate-800 py-3 text-xs font-bold text-stone-700 dark:text-slate-300 transition-colors hover:bg-stone-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-60"
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

      {/* Load more */}
      {expanded && hasMore && !isPending && (
        <button
          onClick={loadMore}
          className="flex w-full items-center justify-center gap-1.5 border-t border-stone-100 dark:border-slate-800 py-2.5 text-xs font-bold text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30"
        >
          Load 25 more
        </button>
      )}
    </div>
  );
}

export function WithinGroupLeaderboards({
  maleTop10,
  femaleTop10,
  maleParticipantCount,
  femaleParticipantCount,
}: WithinGroupLeaderboardsProps) {
  return (
    <section aria-labelledby="within-group-leaderboards-heading">
      <div className="mb-4">
        <h2
          id="within-group-leaderboards-heading"
          className="text-lg font-black text-stone-900 dark:text-white"
        >
          Within-Group Leaderboards
        </h2>
        <TieBreakingLegend />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <LeaderboardPanel
          gender="MALE"
          label="Male"
          accentClass="text-blue-700 dark:text-blue-400"
          badgeBg="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
          initialRows={maleTop10}
          participantCount={maleParticipantCount}
        />
        <LeaderboardPanel
          gender="FEMALE"
          label="Female"
          accentClass="text-pink-700 dark:text-pink-400"
          badgeBg="bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-900"
          initialRows={femaleTop10}
          participantCount={femaleParticipantCount}
        />
      </div>
    </section>
  );
}
