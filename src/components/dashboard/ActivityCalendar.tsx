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
    if (count === 0) return "bg-[#21262d] border border-[#30363d]/40";
    if (count === 1) return "bg-[#0e4429] border border-[#006d32]/40";
    if (count <= 3) return "bg-[#006d32] border border-[#26a641]/40";
    return "bg-[#39d353] border border-[#39d353]/60";
  };

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#e6edf3]">
          Submission Activity (Last 60 Days)
        </h3>
        <span className="text-xs text-[#848d97]">
          Active Days: <strong className="text-[#e6edf3]">{totalActiveDays}</strong>
        </span>
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

      <div className="flex items-center justify-end gap-2 text-[11px] text-[#6e7681] pt-1">
        <span>Less</span>
        <div className="h-3 w-3 rounded-sm bg-[#21262d] border border-[#30363d]/40" />
        <div className="h-3 w-3 rounded-sm bg-[#0e4429]" />
        <div className="h-3 w-3 rounded-sm bg-[#006d32]" />
        <div className="h-3 w-3 rounded-sm bg-[#39d353]" />
        <span>More</span>
      </div>
    </div>
  );
}
