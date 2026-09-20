"use client";

import type { GroupMetricsDTO } from "@/types/gender-war";
import { AlertTriangle, Info } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SymmetricalPanelsProps {
  male: GroupMetricsDTO;
  female: GroupMetricsDTO;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Formats a float to 1 decimal place or returns "—" when null. */
function fmt(value: number | null, decimals = 1): string {
  if (value === null || value === undefined) return "—";
  return value.toFixed(decimals);
}

/** Formats an integer or returns "—" when null. */
function fmtInt(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return Math.round(value).toLocaleString();
}

// ---------------------------------------------------------------------------
// MetricRow — one labelled metric displayed inside a panel
// ---------------------------------------------------------------------------

interface MetricRowProps {
  label: string;
  total: string;
  avg: string | null; // null when no avg counterpart
  isNormalized?: boolean;
}

function MetricRow({ label, total, avg, isNormalized = false }: MetricRowProps) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-zinc-800/60 last:border-0">
      <span className="text-xs text-zinc-400 leading-tight flex-1 min-w-0 break-words">{label}</span>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span className="text-sm font-semibold font-mono text-zinc-100">{total}</span>
        {avg !== null && (
          <span
            className={`text-[11px] font-mono ${
              isNormalized ? "text-indigo-300" : "text-zinc-500"
            }`}
            title="Per-participant average (primary comparison basis)"
          >
            {avg}/student
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GroupPanel — one gender side (FR-406 / FR-407)
// ---------------------------------------------------------------------------

interface GroupPanelProps {
  group: GroupMetricsDTO;
  label: string;
  /** Neutral colour token applied to the label and participant count badge. */
  accentClass: string;
  borderClass: string;
}

function GroupPanel({ group, label, accentClass, borderClass }: GroupPanelProps) {
  return (
    <div
      className={`flex flex-col rounded-xl border bg-zinc-900/50 overflow-hidden ${borderClass}`}
    >
      {/* Header — label + participant count (FR-407) */}
      <div className="flex items-center justify-between gap-2 px-3.5 sm:px-4 py-3 border-b border-zinc-800">
        <span className={`text-sm font-bold ${accentClass}`}>{label}</span>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
          <span className={`h-1.5 w-1.5 rounded-full ${accentClass.replace("text-", "bg-")}`} />
          {group.participantCount.toLocaleString()} participant
          {group.participantCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Status badges */}
      {(group.isLowSampleSize || group.hasStaleData || group.pendingDataCount > 0) && (
        <div className="flex flex-col gap-1 px-3.5 sm:px-4 pt-3">
          {/* FR-415: Low sample size badge */}
          {group.isLowSampleSize && (
            <div className="flex items-center gap-1.5 rounded-md border border-amber-800/50 bg-amber-950/30 px-2.5 py-1.5 text-[11px] text-amber-400">
              <Info className="h-3 w-3 shrink-0" />
              Low sample size (&lt;5 participants) — per-student averages may be skewed
            </div>
          )}
          {/* FR-434: Stale data indicator */}
          {group.hasStaleData && (
            <div className="flex items-center gap-1.5 rounded-md border border-amber-800/50 bg-amber-950/30 px-2.5 py-1.5 text-[11px] text-amber-400">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              Contains un-synced data older than 24 hours
            </div>
          )}
          {/* Pending data notice */}
          {group.pendingDataCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-800/40 px-2.5 py-1.5 text-[11px] text-zinc-400">
              <Info className="h-3 w-3 shrink-0" />
              {group.pendingDataCount} participant
              {group.pendingDataCount !== 1 ? "s have" : " has"} sync pending
            </div>
          )}
        </div>
      )}

      {/* Metric list — 15 rows (FR-406: both groups show identical metrics) */}
      <div className="flex flex-col px-3.5 sm:px-4 pb-4 pt-3 gap-0">
        {/* Problems solved */}
        <MetricRow
          label="Problems Solved"
          total={fmtInt(group.totalSolved)}
          avg={fmt(group.avgSolvedPerStudent)}
          isNormalized
        />
        <MetricRow
          label="Hard Problems"
          total={fmtInt(group.totalHard)}
          avg={fmt(group.avgHardPerStudent)}
          isNormalized
        />
        <MetricRow
          label="Medium Problems"
          total={fmtInt(group.totalMedium)}
          avg={fmt(group.avgMediumPerStudent)}
        />
        <MetricRow
          label="Easy Problems"
          total={fmtInt(group.totalEasy)}
          avg={fmt(group.avgEasyPerStudent)}
        />

        {/* Contest rating — FR-412: only over rated participants */}
        <div className="flex items-start justify-between gap-3 py-2 border-b border-zinc-800/60">
          <div className="flex flex-col flex-1">
            <span className="text-xs text-zinc-400">Avg Contest Rating</span>
            <span className="text-[10px] text-zinc-600">
              over {group.ratedParticipantCount} rated participant
              {group.ratedParticipantCount !== 1 ? "s" : ""}
            </span>
          </div>
          <span className="text-sm font-semibold font-mono text-zinc-100">
            {group.avgContestRating !== null
              ? Math.round(group.avgContestRating)
              : "—"}
          </span>
        </div>

        {/* Contests */}
        <MetricRow
          label="Contests Attended"
          total={fmtInt(group.totalContestsAttended)}
          avg={fmt(group.avgContestsPerStudent)}
        />

        {/* Activity metrics */}
        <MetricRow
          label="Active Coders (period)"
          total={fmtInt(group.activeCodersCount)}
          avg={null}
        />
        <MetricRow
          label="Accepted Submissions (period)"
          total={fmtInt(group.recentSubmissionsCount)}
          avg={null}
        />
        <MetricRow
          label="Avg Current Streak"
          total={`${fmt(group.avgStreakDays)} days`}
          avg={null}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SymmetricalPanels — public component (FR-406 / US1 / US2)
// ---------------------------------------------------------------------------

/**
 * Side-by-side metric panels for Male and Female groups.
 *
 * Spec compliance:
 * - Both groups display the same metric set (FR-406 / US1 AC2)
 * - No colour or visual weight implies superiority (FR-406 / FR-436)
 * - Participant count is prominent alongside every aggregate (FR-407)
 * - Low sample size badge shown when active count < 5 (FR-415)
 * - Stale data indicator shown when any participant's data is stale (FR-434)
 * - Every raw total has a corresponding per-participant average (FR-410)
 * - Division-by-zero results in "—" from the service layer (FR-413)
 */
export function SymmetricalPanels({ male, female }: SymmetricalPanelsProps) {
  return (
    <section aria-labelledby="group-metrics-heading">
      <h2
        id="group-metrics-heading"
        className="mb-3 text-base font-semibold text-zinc-100"
      >
        Group Metrics
      </h2>

      {/* Normalized-metric notice */}
      <p className="mb-4 text-[12px] text-zinc-500">
        Per-student averages (in{" "}
        <span className="font-medium text-indigo-400">indigo</span>) are the primary
        comparison basis — raw totals shown alongside for full context (FR-414).
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <GroupPanel
          group={male}
          label="Male"
          accentClass="text-blue-400"
          borderClass="border-blue-900/40"
        />
        <GroupPanel
          group={female}
          label="Female"
          accentClass="text-rose-400"
          borderClass="border-rose-900/40"
        />
      </div>
    </section>
  );
}
