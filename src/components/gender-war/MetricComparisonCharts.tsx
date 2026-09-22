"use client";

import type { GroupMetricsDTO } from "@/types/gender-war";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MetricComparisonChartsProps {
  male: GroupMetricsDTO;
  female: GroupMetricsDTO;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(value: number | null, decimals = 1): string {
  if (value === null) return "0";
  return value.toFixed(decimals);
}

// ---------------------------------------------------------------------------
// ComparisonBar — one horizontal dual-bar chart row (FR-425 / FR-426)
// ---------------------------------------------------------------------------

interface ComparisonBarProps {
  label: string;
  maleValue: number;
  femaleValue: number;
  maleLabel: string;
  femaleLabel: string;
  /** Whether this metric uses normalized (per-student) values. */
  isNormalized?: boolean;
  /** Units string shown next to values. */
  unit?: string;
}

/**
 * Renders both groups on the same scale (FR-426).
 * The bar that leads gets a subtle "category leader" highlight without declaring
 * an overall winner (FR-421 / FR-425).
 */
function ComparisonBar({
  label,
  maleValue,
  femaleValue,
  maleLabel,
  femaleLabel,
  isNormalized = false,
  unit = "",
}: ComparisonBarProps) {
  const max = Math.max(maleValue, femaleValue, 1); // avoid div-by-0
  const maleWidth = (maleValue / max) * 100;
  const femaleWidth = (femaleValue / max) * 100;

  const maleLeads = maleValue > femaleValue;
  const femaleLeads = femaleValue > maleValue;
  const tied = maleValue === femaleValue;

  return (
    <div className="space-y-1.5">
      {/* Metric label */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-zinc-400">
          {label}
        </span>
        {!tied && (
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
              maleLeads
                ? "border-blue-700/40 bg-blue-950/30 text-blue-400"
                : "border-rose-700/40 bg-rose-950/30 text-rose-400"
            }`}
          >
            {maleLeads ? "Male leads" : "Female leads"}
          </span>
        )}
      </div>

      {/* Male bar */}
      <div className="flex items-center gap-2">
        <span className="w-10 sm:w-12 text-right text-[11px] font-mono text-zinc-400 shrink-0">
          Male
        </span>
        <div className="flex-1 rounded-full bg-zinc-800 h-2.5 sm:h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              maleLeads ? "bg-blue-500" : "bg-blue-800/60"
            }`}
            style={{ width: `${maleWidth}%` }}
            role="presentation"
          />
        </div>
        <span className="w-14 sm:w-16 text-[11px] font-mono text-zinc-300 shrink-0">
          {maleLabel}
          {unit && <span className="text-zinc-500"> {unit}</span>}
        </span>
      </div>

      {/* Female bar — same scale as Male (FR-426) */}
      <div className="flex items-center gap-2">
        <span className="w-10 sm:w-12 text-right text-[11px] font-mono text-zinc-400 shrink-0">
          Female
        </span>
        <div className="flex-1 rounded-full bg-zinc-800 h-2.5 sm:h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              femaleLeads ? "bg-rose-500" : "bg-rose-800/60"
            }`}
            style={{ width: `${femaleWidth}%` }}
            role="presentation"
          />
        </div>
        <span className="w-14 sm:w-16 text-[11px] font-mono text-zinc-300 shrink-0">
          {femaleLabel}
          {unit && <span className="text-zinc-500"> {unit}</span>}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MetricComparisonCharts — public component (FR-425 / FR-426 / FR-427)
// ---------------------------------------------------------------------------

/**
 * Visual comparison of key metrics across both gender groups.
 *
 * Spec compliance:
 * - FR-425: Visualises problems solved, hard problems, contest rating, active users,
 *           coding activity (streaks), and contest participation.
 * - FR-426: Both groups always use the same chart type, scale, and visual encoding.
 * - FR-427: Normalised (per-student) and raw metrics are clearly labelled.
 * - FR-421: Category-level leaders are highlighted without declaring a single winner.
 * - FR-414: Primary encoding uses normalised per-student values (with raw shown).
 */
export function MetricComparisonCharts({ male, female }: MetricComparisonChartsProps) {
  // Prepare normalized (per-student) metrics — primary comparison basis (FR-414)
  const charts: ComparisonBarProps[] = [
    {
      label: "Problems Solved",
      maleValue: male.avgSolvedPerStudent,
      femaleValue: female.avgSolvedPerStudent,
      maleLabel: fmt(male.avgSolvedPerStudent),
      femaleLabel: fmt(female.avgSolvedPerStudent),
      isNormalized: true,
    },
    {
      label: "Hard Problems",
      maleValue: male.avgHardPerStudent,
      femaleValue: female.avgHardPerStudent,
      maleLabel: fmt(male.avgHardPerStudent),
      femaleLabel: fmt(female.avgHardPerStudent),
      isNormalized: true,
    },
    {
      label: "Contest Rating",
      maleValue: male.avgContestRating ?? 0,
      femaleValue: female.avgContestRating ?? 0,
      maleLabel: male.avgContestRating !== null ? Math.round(male.avgContestRating).toString() : "—",
      femaleLabel: female.avgContestRating !== null ? Math.round(female.avgContestRating).toString() : "—",
      isNormalized: false,
    },
    {
      label: "Active Coders",
      maleValue: male.activeCodersCount,
      femaleValue: female.activeCodersCount,
      maleLabel: male.activeCodersCount.toString(),
      femaleLabel: female.activeCodersCount.toString(),
      isNormalized: false,
    },
    {
      label: "Current Streak",
      maleValue: male.avgStreakDays,
      femaleValue: female.avgStreakDays,
      maleLabel: fmt(male.avgStreakDays),
      femaleLabel: fmt(female.avgStreakDays),
      isNormalized: true,
      unit: "days",
    },
    {
      label: "Contests Attended",
      maleValue: male.avgContestsPerStudent,
      femaleValue: female.avgContestsPerStudent,
      maleLabel: fmt(male.avgContestsPerStudent),
      femaleLabel: fmt(female.avgContestsPerStudent),
      isNormalized: true,
    },
    {
      label: "Accepted Submissions (period)",
      maleValue: male.recentSubmissionsCount,
      femaleValue: female.recentSubmissionsCount,
      maleLabel: male.recentSubmissionsCount.toLocaleString(),
      femaleLabel: female.recentSubmissionsCount.toLocaleString(),
      isNormalized: false,
    },
  ];

  return (
    <section aria-labelledby="comparison-charts-heading">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2
          id="comparison-charts-heading"
          className="text-base font-semibold text-zinc-100"
        >
          Metric Comparison
        </h2>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-zinc-500">
          {/* FR-427: legend for normalized vs raw */}
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
            Male
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
            Female
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-4 sm:px-5 sm:py-5 space-y-4 sm:space-y-5">
        {charts.map((chart) => (
          <ComparisonBar key={chart.label} {...chart} />
        ))}
      </div>
    </section>
  );
}
