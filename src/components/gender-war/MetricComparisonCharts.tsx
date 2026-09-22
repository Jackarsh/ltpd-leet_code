"use client";

import type { GroupMetricsDTO } from "@/types/gender-war";

interface MetricComparisonChartsProps {
  male: GroupMetricsDTO;
  female: GroupMetricsDTO;
}

function fmt(value: number | null, decimals = 1): string {
  if (value === null) return "0";
  return value.toFixed(decimals);
}

interface ComparisonBarProps {
  label: string;
  maleValue: number;
  femaleValue: number;
  maleLabel: string;
  femaleLabel: string;
  isNormalized?: boolean;
  unit?: string;
}

function ComparisonBar({
  label,
  maleValue,
  femaleValue,
  maleLabel,
  femaleLabel,
  unit = "",
}: ComparisonBarProps) {
  const max = Math.max(maleValue, femaleValue, 1);
  const maleWidth = (maleValue / max) * 100;
  const femaleWidth = (femaleValue / max) * 100;

  const maleLeads = maleValue > femaleValue;
  const femaleLeads = femaleValue > maleValue;
  const tied = Math.abs(maleValue - femaleValue) < 0.01;

  return (
    <div className="space-y-2 pb-3 border-b border-stone-100 dark:border-slate-800 last:border-b-0 last:pb-0">
      {/* Metric label */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
          {label}
        </span>
        {!tied && (
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              maleLeads
                ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                : "border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300"
            }`}
          >
            {maleLeads ? "Male leads" : "Female leads"}
          </span>
        )}
      </div>

      {/* Male bar */}
      <div className="flex items-center gap-2.5">
        <span className="w-12 text-right text-[11px] font-bold text-blue-700 dark:text-blue-400 shrink-0">
          Male
        </span>
        <div className="flex-1 rounded-full bg-stone-100 dark:bg-slate-800 h-3 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              maleLeads ? "bg-blue-600" : "bg-blue-400"
            }`}
            style={{ width: `${maleWidth}%` }}
            role="presentation"
          />
        </div>
        <span className="w-16 sm:w-20 text-[11px] font-mono font-bold text-stone-900 dark:text-stone-100 shrink-0">
          {maleLabel}
          {unit && <span className="text-stone-500 dark:text-slate-400 font-normal"> {unit}</span>}
        </span>
      </div>

      {/* Female bar */}
      <div className="flex items-center gap-2.5">
        <span className="w-12 text-right text-[11px] font-bold text-pink-700 dark:text-pink-400 shrink-0">
          Female
        </span>
        <div className="flex-1 rounded-full bg-stone-100 dark:bg-slate-800 h-3 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              femaleLeads ? "bg-pink-600" : "bg-pink-400"
            }`}
            style={{ width: `${femaleWidth}%` }}
            role="presentation"
          />
        </div>
        <span className="w-16 sm:w-20 text-[11px] font-mono font-bold text-stone-900 dark:text-stone-100 shrink-0">
          {femaleLabel}
          {unit && <span className="text-stone-500 dark:text-slate-400 font-normal"> {unit}</span>}
        </span>
      </div>
    </div>
  );
}

export function MetricComparisonCharts({ male, female }: MetricComparisonChartsProps) {
  const charts: ComparisonBarProps[] = [
    {
      label: "Problems Solved (Avg per Student)",
      maleValue: male.avgSolvedPerStudent,
      femaleValue: female.avgSolvedPerStudent,
      maleLabel: fmt(male.avgSolvedPerStudent),
      femaleLabel: fmt(female.avgSolvedPerStudent),
      isNormalized: true,
    },
    {
      label: "Hard Problems Solved (Avg per Student)",
      maleValue: male.avgHardPerStudent,
      femaleValue: female.avgHardPerStudent,
      maleLabel: fmt(male.avgHardPerStudent),
      femaleLabel: fmt(female.avgHardPerStudent),
      isNormalized: true,
    },
    {
      label: "Contest Rating (Cohort Avg)",
      maleValue: male.avgContestRating ?? 0,
      femaleValue: female.avgContestRating ?? 0,
      maleLabel: male.avgContestRating !== null ? Math.round(male.avgContestRating).toString() : "—",
      femaleLabel: female.avgContestRating !== null ? Math.round(female.avgContestRating).toString() : "—",
      isNormalized: false,
    },
    {
      label: "Active Coders Count",
      maleValue: male.activeCodersCount,
      femaleValue: female.activeCodersCount,
      maleLabel: male.activeCodersCount.toString(),
      femaleLabel: female.activeCodersCount.toString(),
      isNormalized: false,
    },
    {
      label: "Current Streak (Days Avg)",
      maleValue: male.avgStreakDays,
      femaleValue: female.avgStreakDays,
      maleLabel: fmt(male.avgStreakDays),
      femaleLabel: fmt(female.avgStreakDays),
      isNormalized: true,
      unit: "days",
    },
    {
      label: "Contests Attended (Avg per Student)",
      maleValue: male.avgContestsPerStudent,
      femaleValue: female.avgContestsPerStudent,
      maleLabel: fmt(male.avgContestsPerStudent),
      femaleLabel: fmt(female.avgContestsPerStudent),
      isNormalized: true,
    },
    {
      label: "Accepted Submissions in Period",
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
          className="text-lg font-black text-stone-900 dark:text-white"
        >
          Normalized Metric Comparison
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600" />
            Male Cohort
          </span>
          <span className="flex items-center gap-1.5 text-pink-700 dark:text-pink-400">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-pink-600" />
            Female Cohort
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-5 sm:px-6 sm:py-6 space-y-4 shadow-sm transition-colors">
        {charts.map((chart) => (
          <ComparisonBar key={chart.label} {...chart} />
        ))}
      </div>
    </section>
  );
}
