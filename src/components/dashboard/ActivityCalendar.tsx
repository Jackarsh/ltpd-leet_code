import React from "react";
import { Calendar, Flame } from "lucide-react";

interface Props {
  calendarJson: string | null;
}

export function ActivityCalendar({ calendarJson }: Props) {
  let calendarData: Record<string, number> = {};
  if (calendarJson) {
    try {
      calendarData = JSON.parse(calendarJson);
    } catch {
      calendarData = {};
    }
  }

  // Generate last 60 days
  const days: { dateStr: string; count: number }[] = [];
  const now = new Date();
  let totalActiveDays = 0;

  for (let i = 59; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const epochSec = Math.floor(d.getTime() / 1000);

    // LeetCode timestamps are UTC midnight or nearby
    const count = calendarData[epochSec.toString()] || 0;
    if (count > 0) totalActiveDays++;

    days.push({
      dateStr: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count,
    });
  }

  const getCellColor = (count: number) => {
    if (count === 0) return "bg-zinc-800/60 border border-zinc-800";
    if (count === 1) return "bg-emerald-950 border border-emerald-800 text-emerald-300";
    if (count <= 3) return "bg-emerald-700 border border-emerald-600 text-white";
    return "bg-emerald-500 border border-emerald-400 text-white";
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-400" />
          Submission Activity (Last 60 Days)
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Flame className="h-3.5 w-3.5 text-amber-400" />
          <span>Active Days: <strong className="text-zinc-200">{totalActiveDays}</strong></span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 overflow-x-auto py-2">
        {days.map((day, idx) => (
          <div
            key={idx}
            title={`${day.dateStr}: ${day.count} submissions`}
            className={`h-4 w-4 rounded-sm transition-transform hover:scale-125 cursor-pointer ${getCellColor(day.count)}`}
          />
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 text-[11px] text-zinc-500 pt-1">
        <span>Less</span>
        <div className="h-3 w-3 rounded-sm bg-zinc-800/60" />
        <div className="h-3 w-3 rounded-sm bg-emerald-950 border border-emerald-800" />
        <div className="h-3 w-3 rounded-sm bg-emerald-700" />
        <div className="h-3 w-3 rounded-sm bg-emerald-500" />
        <span>More</span>
      </div>
    </div>
  );
}