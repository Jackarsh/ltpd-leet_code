"use client";

import { useState } from "react";
import { Calendar, Flame, Activity, Zap, Info } from "lucide-react";
import { HeatmapDayDTO, ActivityMetricsDTO } from "@/types/profile";

interface ActivityHeatmapProps {
  days: HeatmapDayDTO[];
  metrics: ActivityMetricsDTO;
}

export function ActivityHeatmap({ days, metrics }: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDayDTO | null>(null);

  const getShadeClass = (count: number) => {
    if (count === 0) return "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/60 hover:border-slate-400";
    if (count <= 2) return "bg-emerald-200 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-900/60 hover:border-emerald-500";
    if (count <= 5) return "bg-emerald-400 dark:bg-emerald-700/80 border-emerald-500 dark:border-emerald-600/60 hover:border-emerald-300";
    return "bg-emerald-600 dark:bg-emerald-500 border-emerald-700 dark:border-emerald-400 hover:border-emerald-200";
  };

  // Group days into columns of 7 days (weeks)
  const weeks: HeatmapDayDTO[][] = [];
  let currentWeek: HeatmapDayDTO[] = [];

  days.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm mb-8">
      {/* Header with Hover Inspection */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>12-Month Submission Heatmap (Accepted Only)</span>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 font-mono h-5 flex items-center">
          {hoveredDay ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {hoveredDay.count} {hoveredDay.count === 1 ? "solve" : "solves"} on {hoveredDay.date}
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">Hover day to inspect</span>
          )}
        </div>
      </div>

      {/* Responsive Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-[680px]">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`h-3 w-3 rounded-xs border transition-transform duration-100 hover:scale-125 cursor-pointer ${getShadeClass(
                    day.count
                  )}`}
                  title={`${day.date}: ${day.count} accepted solves`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
        <div className="flex items-center gap-1">
          <Info className="h-3 w-3 text-slate-400" />
          <span>Counts verified accepted submissions only</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <span className="h-2.5 w-2.5 rounded-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <span className="h-2.5 w-2.5 rounded-xs bg-emerald-200 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-900/60" />
          <span className="h-2.5 w-2.5 rounded-xs bg-emerald-400 dark:bg-emerald-700/80 border border-emerald-500 dark:border-emerald-600/60" />
          <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-500 border border-emerald-700 dark:border-emerald-400" />
          <span>More</span>
        </div>
      </div>

      {/* The 6 Key Activity Summary Metrics (FR-317) */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Daily Activity */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 p-3">
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Recent Daily
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {metrics.dailyActivity} <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">solves</span>
          </div>
        </div>

        {/* Metric 2: Active Days */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 p-3">
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Active Days
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {metrics.activeDays} <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">days</span>
          </div>
        </div>

        {/* Metric 3: Current Streak */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 p-3">
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Flame className="h-3 w-3 text-amber-500" />
            <span>Streak</span>
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">
            {metrics.currentStreak} <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">days</span>
          </div>
        </div>

        {/* Metric 4: Longest Streak */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 p-3">
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Longest Streak
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {metrics.longestStreak} <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">days</span>
          </div>
        </div>

        {/* Metric 5: Total Activity */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 p-3">
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Total Solves
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {metrics.totalActivity}
          </div>
        </div>

        {/* Metric 6: Average Activity on Active Days */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 p-3">
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Avg / Active Day
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {metrics.averageActivityOnActiveDays !== null ? metrics.averageActivityOnActiveDays : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}