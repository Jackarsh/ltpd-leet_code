"use client";

import { CheckCircle2, Award, Sparkles, Clock, History } from "lucide-react";
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

  const getItemIcon = (type: ActivityFeedItemDTO["type"]) => {
    switch (type) {
      case "ACHIEVEMENT_EARNED":
        return <Award className="h-4 w-4 text-amber-400" />;
      case "HARD_SOLVED":
        return <Sparkles className="h-4 w-4 text-rose-400" />;
      case "MILESTONE_REACHED":
        return <Sparkles className="h-4 w-4 text-indigo-400" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    }
  };

  if (!feed || feed.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-200 uppercase tracking-wider mb-4">
          <History className="h-4 w-4 text-indigo-400" />
          <span>Recent Activity</span>
        </div>
        <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-6 text-center text-xs text-zinc-400">
          No recent activity recorded yet.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-200 uppercase tracking-wider">
          <History className="h-4 w-4 text-indigo-400" />
          <span>Recent Activity</span>
        </div>
        <span className="text-xs text-zinc-400 font-mono">
          {feed.length} {feed.length === 1 ? "event" : "events"}
        </span>
      </div>

      <div className="space-y-3">
        {feed.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl bg-zinc-950/70 border border-zinc-850 p-3 hover:border-zinc-750 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-zinc-900 p-2 border border-zinc-800 shrink-0">
                {getItemIcon(item.type)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-zinc-200 truncate">
                  {item.title}
                </div>
                <div className="text-xs text-zinc-400">{item.subtitle}</div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-zinc-400 shrink-0 ml-3">
              <Clock className="h-3 w-3" />
              <span>{formatTime(item.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}