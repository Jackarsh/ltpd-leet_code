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

function MetricRow({
  label,
  maleValue,
  femaleValue,
  maleLabel,
  femaleLabel,
  unit = "",
}: ComparisonBarProps) {
  const maleLeads = maleValue > femaleValue;
  const femaleLeads = femaleValue > maleValue;

  return (
    <div className="grid grid-cols-4 items-center py-3 border-b border-stone-100 dark:border-slate-800 last:border-0 last:pb-0 gap-2 sm:gap-4">
      <div className="col-span-2 text-xs font-bold text-stone-800 dark:text-stone-200 pr-2">
        {label}
      </div>
      <div className={`col-span-1 text-right font-mono text-sm ${maleLeads ? "font-black text-blue-700 dark:text-blue-400" : "font-medium text-stone-600 dark:text-stone-400"}`}>
        {maleLabel}{unit && <span className="text-xs font-normal opacity-70 ml-1">{unit}</span>}
      </div>
      <div className={`col-span-1 text-right font-mono text-sm ${femaleLeads ? "font-black text-pink-700 dark:text-pink-400" : "font-medium text-stone-600 dark:text-stone-400"}`}>
        {femaleLabel}{unit && <span className="text-xs font-normal opacity-70 ml-1">{unit}</span>}
      </div>
    </div>
  );
}

export function MetricComparisonCharts({ male, female }: MetricComparisonChartsProps) {
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
      label: "Hard Problems Solved",
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
      label: "Active Coders Count",
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
      label: "Accepted Submissions in Period",
      maleValue: male.recentSubmissionsCount,
      femaleValue: female.recentSubmissionsCount,
      maleLabel: male.recentSubmissionsCount.toLocaleString(),
      femaleLabel: female.recentSubmissionsCount.toLocaleString(),
      isNormalized: false,
    },
    {
      label: "Total Group Solves",
      maleValue: male.totalSolved,
      femaleValue: female.totalSolved,
      maleLabel: male.totalSolved.toLocaleString(),
      femaleLabel: female.totalSolved.toLocaleString(),
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
          Stats
        </h2>
      </div>

      <div className="rounded-2xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 sm:px-6 shadow-sm transition-colors">
        <div className="grid grid-cols-4 items-center pb-3 border-b-2 border-stone-100 dark:border-slate-800 gap-2 sm:gap-4">
          <div className="col-span-2 text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-slate-400">
            Metric
          </div>
          <div className="col-span-1 text-right text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Male
          </div>
          <div className="col-span-1 text-right text-[10px] font-black uppercase tracking-wider text-pink-600 dark:text-pink-400">
            Female
          </div>
        </div>
        {charts.map((chart) => (
          <MetricRow key={chart.label} {...chart} />
        ))}
      </div>
    </section>
  );
}
