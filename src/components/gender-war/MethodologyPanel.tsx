"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function MethodologyPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section aria-labelledby="methodology-heading" className="mt-2">
      <button
        id="methodology-toggle"
        aria-expanded={open}
        aria-controls="methodology-content"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-[#30363d] bg-[#161b22] px-4 py-3 text-xs font-semibold text-[#848d97] hover:text-[#e6edf3] hover:border-[#484f58] transition-all"
      >
        <span id="methodology-heading">Comparison Methodology & Attribution Policies</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-[#848d97]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#848d97]" />
        )}
      </button>

      {open && (
        <div
          id="methodology-content"
          role="region"
          aria-labelledby="methodology-heading"
          className="mt-1 rounded-xl border border-[#30363d] bg-[#161b22] px-5 py-5 text-sm text-[#848d97] space-y-5"
        >
          <div>
            <h3 className="mb-1.5 text-xs font-bold uppercase tracking-widest text-[#e6edf3]">
              1. Group Membership
            </h3>
            <p className="text-[13px] leading-relaxed text-[#848d97]">
              Group membership is determined <strong className="text-[#e6edf3]">exclusively</strong> by
              the student&apos;s explicitly selected gender field stored in their profile.
              Gender is <strong className="text-[#e6edf3]">never</strong> inferred from name, email address,
              avatar, LeetCode profile, or any other signal.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-[#e6edf3]">
              2. Metric Definitions
            </h3>
            <div className="rounded-lg border border-[#30363d] overflow-x-auto">
              <table className="w-full text-[12px] min-w-[320px]">
                <thead>
                  <tr className="border-b border-[#30363d] bg-[#0d1117]">
                    <th className="py-2 px-3 text-left font-semibold text-[#e6edf3]">Metric</th>
                    <th className="py-2 px-3 text-left font-semibold text-[#e6edf3]">Definition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262d]">
                  {[
                    ["Participant Count", "Total students registered in the group."],
                    ["Total Problems Solved", "Cumulative LeetCode problems accepted across all difficulties."],
                    ["Avg Problems / Student", "Total Solved \u00F7 Participant Count."],
                    ["Total / Avg Hard Solved", "Hard-difficulty problems only; average = Hard \u00F7 Participant Count."],
                    ["Total / Avg Medium Solved", "Medium-difficulty problems only."],
                    ["Total / Avg Easy Solved", "Easy-difficulty problems only."],
                    [
                      "Avg Contest Rating",
                      "Sum of contest ratings \u00F7 Number of participants with a confirmed rating. Students with no contest rating are excluded from both numerator and denominator.",
                    ],
                    ["Total / Avg Contests Attended", "Total contests attended; average = Total \u00F7 Participant Count."],
                    [
                      "Active Coders (period)",
                      "Participants with \u22651 accepted submission OR \u22651 contest attended within the selected time window.",
                    ],
                    [
                      "Accepted Submissions (period)",
                      "Total accepted submissions within the selected time window.",
                    ],
                    [
                      "Avg Current Streak",
                      "Each participant's current consecutive-day streak is computed from their submission calendar. The group average = Sum of streaks \u00F7 Participant Count.",
                    ],
                  ].map(([metric, def]) => (
                    <tr key={metric}>
                      <td className="py-2 px-3 font-medium text-[#e6edf3] align-top whitespace-nowrap">
                        {metric}
                      </td>
                      <td className="py-2 px-3 text-[#848d97] leading-relaxed">{def}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-1.5 text-xs font-bold uppercase tracking-widest text-[#e6edf3]">
              3. Normalisation
            </h3>
            <p className="text-[13px] leading-relaxed text-[#848d97]">
              The comparison is based{" "}
              <strong className="text-[#e6edf3]">primarily on per-participant normalised metrics</strong>{" "}
              (averages and rates), not raw totals alone. This ensures that the group with
              more members does not receive an automatic advantage.
            </p>
          </div>

          <div>
            <h3 className="mb-1.5 text-xs font-bold uppercase tracking-widest text-[#e6edf3]">
              4. Multi-Dimensional Comparison
            </h3>
            <p className="text-[13px] leading-relaxed text-[#848d97]">
              This platform does not declare a single binary &ldquo;winner&rdquo; between the two
              groups. The dashboard presents metric-by-metric category leaders to give a balanced,
              multi-dimensional view of performance.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
