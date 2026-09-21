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
      <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 text-center text-xs text-[#848d97]">
        No recent submissions recorded yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#21262d] pb-3">
        <h3 className="text-sm font-semibold text-[#e6edf3]">
          Recent Accepted Submissions
        </h3>
        <span className="text-xs text-[#848d97]">{submissions.length} latest</span>
      </div>

      <div className="divide-y divide-[#21262d]">
        {submissions.map((sub) => (
          <div key={sub.id} className="py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <a
                href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[#e6edf3] hover:text-[#58a6ff] transition-colors truncate flex items-center gap-1 group"
              >
                <span>{sub.title}</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#848d97]" />
              </a>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-xs text-[#848d97]">
              <span className="rounded bg-[#21262d] border border-[#30363d] px-2 py-0.5 text-[11px] font-mono text-[#848d97]">
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
