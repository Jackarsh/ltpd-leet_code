/**
 * Activity & Streak Calculation Utilities
 */

export function calculateCurrentStreak(
  submissionCalendarJson: string | Record<string, number> | null | undefined
): number {
  if (!submissionCalendarJson) return 0;

  let calendar: Record<string, number>;
  if (typeof submissionCalendarJson === 'string') {
    try {
      calendar = JSON.parse(submissionCalendarJson);
    } catch {
      return 0;
    }
  } else {
    calendar = submissionCalendarJson;
  }

  const timestamps = Object.keys(calendar)
    .map((k) => parseInt(k, 10))
    .filter((ts) => !isNaN(ts) && (calendar[ts.toString()] ?? 0) > 0);

  if (timestamps.length === 0) return 0;

  // Convert all submission timestamps into local date strings (YYYY-MM-DD)
  const submissionDateSet = new Set<string>();
  for (const ts of timestamps) {
    const d = new Date(ts * 1000);
    const dateStr = d.toISOString().split('T')[0];
    submissionDateSet.add(dateStr);
  }

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let checkDate: Date;
  if (submissionDateSet.has(todayStr)) {
    checkDate = today;
  } else if (submissionDateSet.has(yesterdayStr)) {
    checkDate = yesterday;
  } else {
    return 0; // Streak broken
  }

  let streak = 0;
  const runner = new Date(checkDate);

  while (true) {
    const runnerStr = runner.toISOString().split('T')[0];
    if (submissionDateSet.has(runnerStr)) {
      streak++;
      runner.setDate(runner.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function isUserActive(
  lastSubmissionTimestamp: Date | string | null | undefined,
  thresholdDays: number = 30
): boolean {
  if (!lastSubmissionTimestamp) return false;
  const date = typeof lastSubmissionTimestamp === 'string'
    ? new Date(lastSubmissionTimestamp)
    : lastSubmissionTimestamp;

  if (isNaN(date.getTime())) return false;

  const diffMs = Date.now() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= thresholdDays;
}