import type { HeatmapDayDTO, ActivityMetricsDTO } from "../../types/profile.ts";

export function generate12MonthHeatmap(
  submissionCalendarJson: string | Record<string, number> | null | undefined
): {
  days: HeatmapDayDTO[];
  metrics: ActivityMetricsDTO;
} {
  let calendar: Record<string, number> = {};
  if (typeof submissionCalendarJson === "string") {
    try {
      calendar = JSON.parse(submissionCalendarJson);
    } catch {
      calendar = {};
    }
  } else if (submissionCalendarJson) {
    calendar = submissionCalendarJson;
  }

  // Aggregate accepted submissions by date string (YYYY-MM-DD)
  const dailyCountMap = new Map<string, number>();
  for (const [tsStr, count] of Object.entries(calendar)) {
    const ts = parseInt(tsStr, 10);
    if (!isNaN(ts) && count > 0) {
      const d = new Date(ts * 1000);
      const dateStr = d.toISOString().split("T")[0];
      dailyCountMap.set(dateStr, (dailyCountMap.get(dateStr) ?? 0) + count);
    }
  }

  // Generate continuous past 365 calendar days up to today
  const today = new Date();
  const days: HeatmapDayDTO[] = [];
  const daysCount = 365;

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const count = dailyCountMap.get(dateStr) ?? 0;
    days.push({
      date: dateStr,
      count,
      hasData: true,
    });
  }

  // Metric 1: Total Activity
  let totalActivity = 0;
  // Metric 2: Active Days
  let activeDays = 0;
  // Metric 3: Daily Activity on most recently active day
  let dailyActivity = 0;
  let mostRecentActiveDate = "";

  // Metric 4: Longest Streak
  let longestStreak = 0;
  let currentRun = 0;

  for (const day of days) {
    if (day.count > 0) {
      totalActivity += day.count;
      activeDays++;
      dailyActivity = day.count;
      mostRecentActiveDate = day.date;
      currentRun++;
      if (currentRun > longestStreak) {
        longestStreak = currentRun;
      }
    } else {
      currentRun = 0;
    }
  }

  // Metric 5: Current Streak (ending today or yesterday)
  const todayStr = today.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let currentStreak = 0;
  let checkDate: Date | null = null;

  if ((dailyCountMap.get(todayStr) ?? 0) > 0) {
    checkDate = today;
  } else if ((dailyCountMap.get(yesterdayStr) ?? 0) > 0) {
    checkDate = yesterday;
  }

  if (checkDate) {
    const runner = new Date(checkDate);
    while (true) {
      const runnerStr = runner.toISOString().split("T")[0];
      if ((dailyCountMap.get(runnerStr) ?? 0) > 0) {
        currentStreak++;
        runner.setDate(runner.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Metric 6: Average Activity on active days
  const averageActivityOnActiveDays =
    activeDays > 0 ? Number((totalActivity / activeDays).toFixed(1)) : null;

  return {
    days,
    metrics: {
      dailyActivity,
      activeDays,
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      totalActivity,
      averageActivityOnActiveDays,
    },
  };
}