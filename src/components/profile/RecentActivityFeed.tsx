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
      <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-sm">
        <div className="text-sm font-bold text-[#e6edf3] uppercase tracking-wider mb-4">
          Recent Activity
        </div>
        <div className="rounded-xl bg-[#0d1117] border border-[#21262d] p-6 text-center text-xs text-[#848d97]">
          No recent activity recorded yet.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-[#21262d] pb-3">
        <div className="text-sm font-bold text-[#e6edf3] uppercase tracking-wider">
          Recent Activity
        </div>
        <span className="text-xs text-[#848d97]">{feed.length} events</span>
      </div>

      <div className="divide-y divide-[#21262d]">
        {feed.map((item) => (
          <div key={item.id} className="py-3 flex items-start justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#e6edf3] truncate">
                {item.title}
              </span>
              {item.subtitle && (
                <span className="text-[11px] text-[#848d97] mt-0.5">
                  {item.subtitle}
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#6e7681] shrink-0 font-mono">
              {formatTime(item.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
