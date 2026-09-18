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
    if (count === 0) return "bg-zinc-900 border-zinc-850 hover:border-zinc-700";
    if (count <= 2) return "bg-emerald-950/80 border-emerald-900/60 hover:border-emerald-600";
    if (count <= 5) return "bg-emerald-700/80 border-emerald-600/60 hover:border-emerald-400";
    return "bg-emerald-500 border-emerald-400 hover:border-emerald-300";
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md shadow-lg mb-8">
      {/* Header with Hover Inspection */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-200 uppercase tracking-wider">
          <Calendar className="h-4 w-4 text-emerald-400" />
          <span>12-Month Submission Heatmap (Accepted Only)</span>
        </div>

        <div className="text-xs text-zinc-300 font-mono h-5 flex items-center">
          {hoveredDay ? (
            <span className="text-emerald-400 font-medium">
              {hoveredDay.count} {hoveredDay.count === 1 ? "solve" : "solves"} on {hoveredDay.date}
            </span>
          ) : (
            <span className="text-zinc-400">Hover day to inspect</span>
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
      <div className="flex items-center justify-between mt-3 text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-3">
        <div className="flex items-center gap-1">
          <Info className="h-3 w-3 text-zinc-400" />
          <span>Counts verified accepted submissions only</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <span className="h-2.5 w-2.5 rounded-xs bg-zinc-900 border border-zinc-850" />
          <span className="h-2.5 w-2.5 rounded-xs bg-emerald-950/80 border border-emerald-900/60" />
          <span className="h-2.5 w-2.5 rounded-xs bg-emerald-700/80 border border-emerald-600/60" />
          <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500 border border-emerald-400" />
          <span>More</span>
        </div>
      </div>

      {/* The 6 Key Activity Summary Metrics (FR-317) */}
      <div className="mt-6 pt-5 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Daily Activity */}
        <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-3">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Recent Daily
          </div>
          <div className="text-xl font-bold text-zinc-100 font-mono">
            {metrics.dailyActivity} <span className="text-xs text-zinc-400 font-sans">solves</span>
          </div>
        </div>

        {/* Metric 2: Active Days */}
        <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-3">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Active Days
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {metrics.activeDays} <span className="text-xs text-zinc-400 font-sans">days</span>
          </div>
        </div>

        {/* Metric 3: Current Streak */}
        <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-3">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Flame className="h-3 w-3 text-amber-400" />
            <span>Streak</span>
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">
            {metrics.currentStreak} <span className="text-xs text-zinc-400 font-sans">days</span>
          </div>
        </div>

        {/* Metric 4: Longest Streak */}
        <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-3">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Longest Streak
          </div>
          <div className="text-xl font-bold text-zinc-100 font-mono">
            {metrics.longestStreak} <span className="text-xs text-zinc-400 font-sans">days</span>
          </div>
        </div>

        {/* Metric 5: Total Activity */}
        <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-3">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Total Solves
          </div>
          <div className="text-xl font-bold text-zinc-100 font-mono">
            {metrics.totalActivity}
          </div>
        </div>

        {/* Metric 6: Average Activity on Active Days */}
        <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-3">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Avg / Active Day
          </div>
          <div className="text-xl font-bold text-zinc-100 font-mono">
            {metrics.averageActivityOnActiveDays !== null ? metrics.averageActivityOnActiveDays : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}