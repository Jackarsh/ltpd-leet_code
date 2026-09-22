import React from "react";

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

  const days: { dateStr: string; count: number }[] = [];
  const now = new Date();
  let totalActiveDays = 0;

  for (let i = 59; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const epochSec = Math.floor(d.getTime() / 1000);

    const count = calendarData[epochSec.toString()] || 0;
    if (count > 0) totalActiveDays++;

    days.push({
      dateStr: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count,
    });
  }

  const getCellColor = (count: number) => {
    if (count === 0) return "bg-stone-100 dark:bg-slate-800 border border-stone-200/70 dark:border-slate-700/60";
    if (count === 1) return "bg-emerald-200 dark:bg-emerald-800/80 border border-emerald-300 dark:border-emerald-700";
    if (count <= 3) return "bg-emerald-400 dark:bg-emerald-600 border border-emerald-500 dark:border-emerald-500";
    return "bg-emerald-600 dark:bg-emerald-500 border border-emerald-700 dark:border-emerald-400";
  };

  return (
    <div className="rounded-2xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-stone-900 dark:text-white">
          Submission Activity (Last 60 Days)
        </h3>
        <span className="rounded-full bg-stone-100 dark:bg-slate-800 border border-stone-200/80 dark:border-slate-700 px-2.5 py-0.5 text-xs text-stone-600 dark:text-slate-300">
          Active Days: <strong className="font-bold text-stone-900 dark:text-white">{totalActiveDays}</strong>
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 overflow-x-auto py-2">
        {days.map((day, idx) => (
          <div
            key={idx}
            title={`${day.dateStr}: ${day.count} submissions`}
            className={`h-4 w-4 rounded-md transition-transform hover:scale-125 cursor-pointer shadow-xs ${getCellColor(day.count)}`}
          />
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 text-[11px] text-stone-400 dark:text-slate-500 pt-1">
        <span>Less</span>
        <div className="h-3 w-3 rounded-xs bg-stone-100 dark:bg-slate-800 border border-stone-200/70 dark:border-slate-700/60" />
        <div className="h-3 w-3 rounded-xs bg-emerald-200 dark:bg-emerald-800/80 border border-emerald-300 dark:border-emerald-700" />
        <div className="h-3 w-3 rounded-xs bg-emerald-400 dark:bg-emerald-600 border border-emerald-500 dark:border-emerald-500" />
        <div className="h-3 w-3 rounded-xs bg-emerald-600 dark:bg-emerald-500 border border-emerald-700 dark:border-emerald-400" />
        <span>More</span>
      </div>
    </div>
  );
}
