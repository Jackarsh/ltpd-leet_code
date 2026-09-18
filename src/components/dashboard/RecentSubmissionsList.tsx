import React from "react";
import { formatRelativeTime } from "@/lib/sync-utils";
import { CheckCircle2, ExternalLink, Code2 } from "lucide-react";

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
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 text-center text-sm text-zinc-500">
        No recent submissions recorded yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
          <Code2 className="h-4 w-4 text-indigo-400" />
          Recent Accepted Submissions
        </h3>
        <span className="text-xs text-zinc-500">{submissions.length} latest</span>
      </div>

      <div className="divide-y divide-zinc-800/60">
        {submissions.map((sub) => (
          <div key={sub.id} className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <a
                href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-zinc-200 hover:text-indigo-400 transition-colors truncate flex items-center gap-1 group"
              >
                <span>{sub.title}</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400" />
              </a>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-xs text-zinc-500">
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-mono text-zinc-400">
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