"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";

/**
 * MethodologyPanel — Publicly accessible comparison methodology (US6 / FR-422).
 *
 * Spec compliance:
 * - FR-422: Lists which metrics are included, their definitions, and how normalisation is applied.
 * - FR-424: Explicitly states that group membership is based exclusively on the student's
 *           stored gender field and is never inferred.
 * - FR-404: Documents the gender-change historical attribution policy.
 * - FR-414: States that normalized metrics are the primary comparison basis.
 * - FR-423: Content reflects current state; when R7 admin config changes comparison
 *           settings, the data shown here updates because the page is server-rendered.
 */
export function MethodologyPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section aria-labelledby="methodology-heading" className="mt-2">
      <button
        id="methodology-toggle"
        aria-expanded={open}
        aria-controls="methodology-content"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-left transition-colors hover:bg-zinc-800/50"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-400 shrink-0" />
          <span id="methodology-heading" className="text-sm font-semibold text-zinc-200">
            Comparison Methodology
          </span>
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
            Public
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
        )}
      </button>

      {open && (
        <div
          id="methodology-content"
          role="region"
          aria-labelledby="methodology-heading"
          className="mt-1 rounded-xl border border-zinc-800 bg-zinc-900/40 px-5 py-5 text-sm text-zinc-300 space-y-5"
        >
          {/* 1. Group Membership — FR-424 */}
          <div>
            <h3 className="mb-1.5 text-xs font-bold uppercase tracking-widest text-zinc-400">
              1. Group Membership
            </h3>
            <p className="text-[13px] leading-relaxed text-zinc-300">
              Group membership is determined <strong className="text-zinc-100">exclusively</strong> by
              the student&apos;s explicitly selected gender field stored in their profile.
              Gender is <strong className="text-zinc-100">never</strong> inferred from name, email address,
              avatar, LeetCode profile, or any other signal. Only <em>Male</em> and <em>Female</em> are
              recognised as valid groups (FR-401).
            </p>
          </div>

          {/* 2. Metric Definitions — FR-422 */}
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
              2. Metric Definitions
            </h3>
            <div className="rounded-lg border border-zinc-800 overflow-x-auto">
              <table className="w-full text-[12px] min-w-[320px]">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-800/40">
                    <th className="py-2 px-3 text-left font-semibold text-zinc-300">Metric</th>
                    <th className="py-2 px-3 text-left font-semibold text-zinc-300">Definition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {[
                    ["Participant Count", "Total students registered in the group."],
                    ["Total Problems Solved", "Cumulative LeetCode problems accepted across all difficulties."],
                    ["Avg Problems / Student", "Total Solved ÷ Participant Count."],
                    ["Total / Avg Hard Solved", "Hard-difficulty problems only; average = Hard ÷ Participant Count."],
                    ["Total / Avg Medium Solved", "Medium-difficulty problems only."],
                    ["Total / Avg Easy Solved", "Easy-difficulty problems only."],
                    [
                      "Avg Contest Rating",
                      "Sum of contest ratings ÷ Number of participants with a confirmed rating. Students with no contest rating are excluded from both numerator and denominator (FR-412). The count of rated participants is shown alongside.",
                    ],
                    ["Total / Avg Contests Attended", "Total contests attended; average = Total ÷ Participant Count."],
                    [
                      "Active Coders (period)",
                      "Participants with ≥1 accepted submission OR ≥1 contest attended within the selected time window.",
                    ],
                    [
                      "Accepted Submissions (period)",
                      "Total accepted submissions within the selected time window.",
                    ],
                    [
                      "Avg Current Streak",
                      "Each participant's current consecutive-day streak is computed from their submission calendar. The group average = Sum of streaks ÷ Participant Count.",
                    ],
                  ].map(([metric, def]) => (
                    <tr key={metric}>
                      <td className="py-2 px-3 font-medium text-zinc-200 align-top whitespace-nowrap">
                        {metric}
                      </td>
                      <td className="py-2 px-3 text-zinc-400 leading-relaxed">{def}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Normalisation — FR-422 / FR-414 */}
          <div>
            <h3 className="mb-1.5 text-xs font-bold uppercase tracking-widest text-zinc-400">
              3. Normalisation
            </h3>
            <p className="text-[13px] leading-relaxed text-zinc-300">
              The comparison is based{" "}
              <strong className="text-zinc-100">primarily on per-participant normalised metrics</strong>{" "}
              (averages and rates), not raw totals alone (FR-414). This ensures that the group with
              more members does not receive an automatic advantage.
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-300">
              When a denominator is zero (e.g., no participants in a group), the metric is displayed
              as &ldquo;—&rdquo; rather than zero or an error (FR-413).
            </p>
          </div>

          {/* 4. Gender Change Attribution — FR-404 / US8 */}
          <div>
            <h3 className="mb-1.5 text-xs font-bold uppercase tracking-widest text-zinc-400">
              4. Gender Change Attribution
            </h3>
            <p className="text-[13px] leading-relaxed text-zinc-300">
              When a student changes their gender selection, their statistics are attributed{" "}
              <strong className="text-zinc-100">entirely to the new group</strong> for{" "}
              <strong className="text-zinc-100">all time periods</strong> (Current Week, Month,
              Semester, Academic Year, and All Time) at the next computation cycle. No historical
              gender state is stored; the platform does not attempt to re-attribute historical
              activity to the previous group. This policy is applied uniformly to all students (FR-403).
            </p>
          </div>

          {/* 5. Computation Schedule — FR-416 */}
          <div>
            <h3 className="mb-1.5 text-xs font-bold uppercase tracking-widest text-zinc-400">
              5. Computation Schedule & Caching
            </h3>
            <p className="text-[13px] leading-relaxed text-zinc-300">
              Aggregates are recomputed asynchronously after every platform-wide LeetCode sync
              batch completes, and at least once every 6 hours. Cached results are invalidated
              immediately upon administrator configuration changes (FR-416).
            </p>
          </div>

          {/* 6. Low Sample Size — FR-415 */}
          <div>
            <h3 className="mb-1.5 text-xs font-bold uppercase tracking-widest text-zinc-400">
              6. Low Sample Size
            </h3>
            <p className="text-[13px] leading-relaxed text-zinc-300">
              When a group has fewer than 5 active participants, a{" "}
              <strong className="text-zinc-100">Low sample size (&lt;5 participants)</strong>{" "}
              informational badge is displayed alongside the group&apos;s metrics. Per-student averages
              in this state are disproportionately influenced by individual outliers (FR-415).
            </p>
          </div>

          {/* 7. No binary winner — FR-421 / FR-436 */}
          <div>
            <h3 className="mb-1.5 text-xs font-bold uppercase tracking-widest text-zinc-400">
              7. Multi-Dimensional Comparison
            </h3>
            <p className="text-[13px] leading-relaxed text-zinc-300">
              This platform does not declare a single binary &ldquo;winner&rdquo; between the two
              groups. The dashboard presents metric-by-metric category leaders (e.g., higher average
              problems solved, higher average contest rating) to give a balanced, multi-dimensional
              view of performance (FR-421). No language, colour scheme, or scoring mechanism implies
              that one gender is inherently better than the other (FR-436).
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
