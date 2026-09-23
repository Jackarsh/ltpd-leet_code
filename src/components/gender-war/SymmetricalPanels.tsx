"use client";

import { useState } from "react";
import type { GroupMetricsDTO } from "@/types/gender-war";
import { StickmanAvatar, GenderEmotion } from "@/components/gender-war/StickmanAvatar";

interface SymmetricalPanelsProps {
  male: GroupMetricsDTO;
  female: GroupMetricsDTO;
}

function fmt(value: number | null, decimals = 1): string {
  if (value === null || value === undefined) return "\u2014";
  return value.toFixed(decimals);
}

function fmtInt(value: number | null): string {
  if (value === null || value === undefined) return "\u2014";
  return Math.round(value).toLocaleString();
}

export function SymmetricalPanels({ male, female }: SymmetricalPanelsProps) {
  const [activeMetric, setActiveMetric] = useState<"SOLVED" | "HARD" | "RATING">("SOLVED");

  let maleVal = 0, femaleVal = 0;
  if (activeMetric === "SOLVED") { maleVal = male.avgSolvedPerStudent ?? 0; femaleVal = female.avgSolvedPerStudent ?? 0; }
  else if (activeMetric === "HARD") { maleVal = male.avgHardPerStudent ?? 0; femaleVal = female.avgHardPerStudent ?? 0; }
  else { maleVal = male.avgContestRating ?? 0; femaleVal = female.avgContestRating ?? 0; }

  const diffPercent = ((femaleVal - maleVal) / (maleVal > 0 ? maleVal : 1)) * 100;

  let femaleEmotion: GenderEmotion = "NEUTRAL_BALANCED";
  let maleEmotion: GenderEmotion = "NEUTRAL_BALANCED";
  let commentary = "Neck-and-neck! Both cohorts are evenly matched.";
  const metricLabel = activeMetric === "SOLVED" ? "problems solved" : activeMetric === "HARD" ? "hard problems" : "contest rating";

  if (diffPercent >= 15) { femaleEmotion = "VICTORIOUS"; maleEmotion = "DEJECTED"; commentary = `Girls have a commanding lead (+${diffPercent.toFixed(0)}%) in ${metricLabel}!`; }
  else if (diffPercent >= 5) { femaleEmotion = "CONFIDENT"; maleEmotion = "PERPLEXED"; commentary = `Girls are pulling ahead (+${diffPercent.toFixed(0)}%) with strong consistency.`; }
  else if (diffPercent <= -15) { femaleEmotion = "DEJECTED"; maleEmotion = "VICTORIOUS"; commentary = `Boys have a commanding lead (+${Math.abs(diffPercent).toFixed(0)}%) in ${metricLabel}!`; }
  else if (diffPercent <= -5) { femaleEmotion = "PERPLEXED"; maleEmotion = "CONFIDENT"; commentary = `Boys are pulling ahead (+${Math.abs(diffPercent).toFixed(0)}%) with strong consistency.`; }

  return (
    <div className="space-y-6">
      {/* Commentary + Metric Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
        <div className="text-sm">
          <span className="font-extrabold text-stone-900 dark:text-white">{commentary}</span>
        </div>
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-xs font-semibold text-stone-500 dark:text-slate-400 mr-1 hidden sm:inline">Compare by:</span>
          {([
            { key: "SOLVED", label: "Avg Solved" },
            { key: "HARD", label: "Hard Solved" },
            { key: "RATING", label: "Contest Rating" },
          ] as const).map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeMetric === m.key
                  ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-sm"
                  : "bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-slate-700"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {/* Female Panel */}
        <div className="card-hover relative flex flex-col justify-between p-6 rounded-2xl border border-pink-200/80 dark:border-pink-900/60 bg-white dark:bg-slate-900 shadow-sm transition-colors">
          <div className="flex h-full flex-col items-center justify-center pt-2">
            <StickmanAvatar gender="FEMALE" emotion={femaleEmotion} size={95} />
            <div className="mt-3 text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 shadow-sm">
                Female Coders ({female.participantCount})
              </span>
              <p className="text-xs font-medium text-stone-500 dark:text-slate-400 mt-1.5 capitalize">
                Status: <strong className="text-stone-700 dark:text-slate-200">{femaleEmotion.toLowerCase().replace("_", " ")}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Male Panel */}
        <div className="card-hover relative flex flex-col justify-between p-6 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-white dark:bg-slate-900 shadow-sm transition-colors">
          <div className="flex h-full flex-col items-center justify-center pt-2">
            <StickmanAvatar gender="MALE" emotion={maleEmotion} size={95} />
            <div className="mt-3 text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm">
                Male Coders ({male.participantCount})
              </span>
              <p className="text-xs font-medium text-stone-500 dark:text-slate-400 mt-1.5 capitalize">
                Status: <strong className="text-stone-700 dark:text-slate-200">{maleEmotion.toLowerCase().replace("_", " ")}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
