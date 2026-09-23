"use client";

import { ActivityFeedItemDTO } from "@/types/profile";

interface RecentActivityFeedProps {
  feed: ActivityFeedItemDTO[];
}

export function RecentActivityFeed({ feed }: RecentActivityFeedProps) {
  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    const diffHours = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays}d ago`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (!feed || feed.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
          Recent Activity
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
          No recent activity recorded yet.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Recent Activity
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">{feed.length} events</span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {feed.map((item) => (
          <div key={item.id} className="py-3 flex items-start justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {item.title}
              </span>
              {item.subtitle && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {item.subtitle}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 font-mono">
              {formatTime(item.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
