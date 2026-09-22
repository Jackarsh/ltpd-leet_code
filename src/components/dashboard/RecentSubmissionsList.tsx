import React from "react";
import { formatRelativeTime } from "@/lib/sync-utils";
import { ExternalLink } from "lucide-react";

interface Submission {
  id: string;
  title: string;
  titleSlug: string;
  timestamp: Date;
  status: string;
  lang: string;
}

interface Props {
  submissions: Submission[];
}

export function RecentSubmissionsList({ submissions }: Props) {
  if (submissions.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center text-xs text-stone-500 dark:text-slate-400 shadow-sm">
        No recent submissions recorded yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-slate-800 pb-3">
        <h3 className="font-display text-sm font-bold text-stone-900 dark:text-white">
          Recent Accepted Submissions
        </h3>
        <span className="rounded-full bg-stone-100 dark:bg-slate-800 border border-stone-200/80 dark:border-slate-700 px-2.5 py-0.5 text-xs font-medium text-stone-500 dark:text-slate-400">
          {submissions.length} latest
        </span>
      </div>

      <div className="divide-y divide-stone-100 dark:divide-slate-800">
        {submissions.map((sub) => (
          <div key={sub.id} className="py-2.5 flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-2 min-w-0">
              <a
                href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-stone-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate flex items-center gap-1.5"
              >
                <span>{sub.title}</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 dark:text-slate-500" />
              </a>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-xs text-stone-400 dark:text-slate-500">
              <span className="rounded-md bg-stone-100 dark:bg-slate-800 border border-stone-200/80 dark:border-slate-700 px-2 py-0.5 text-[11px] font-mono text-stone-600 dark:text-slate-300 font-medium">
                {sub.lang}
              </span>
              <span>{formatRelativeTime(sub.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
