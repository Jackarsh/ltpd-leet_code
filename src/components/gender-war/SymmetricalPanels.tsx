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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-[#21262d] bg-[#161b22]">
        <div className="text-sm">
          <span className="font-semibold text-[#e6edf3]">{commentary}</span>
        </div>
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-[11px] text-[#6e7681] mr-1">Emotion Metric:</span>
          {([
            { key: "SOLVED", label: "Avg Solved" },
            { key: "HARD", label: "Hard Solved" },
            { key: "RATING", label: "Contest Rating" },
          ] as const).map((m) => (
            <button key={m.key} onClick={() => setActiveMetric(m.key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeMetric === m.key ? "bg-[#30363d] text-[#e6edf3]" : "bg-[#21262d] text-[#848d97] hover:text-[#e6edf3]"
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Female Panel */}
        <div className="card-hover relative flex flex-col justify-between p-6 rounded-2xl border border-[#21262d] bg-[#161b22]">
          <div>
            <div className="flex flex-col items-center justify-center pt-2 pb-4 border-b border-[#21262d]">
              <StickmanAvatar gender="FEMALE" emotion={femaleEmotion} size={95} />
              <div className="mt-2 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#21262d] text-[#e6edf3] border border-[#30363d]">
                  Female Coders ({female.participantCount})
                </span>
                <p className="text-[11px] text-[#6e7681] mt-1 capitalize">Status: {femaleEmotion.toLowerCase().replace("_", " ")}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: "Avg Solved / Student", val: fmt(female.avgSolvedPerStudent), bold: true },
                { label: "Avg Hard Solved", val: fmt(female.avgHardPerStudent), bold: true },
                { label: "Avg Contest Rating", val: female.avgContestRating ? String(Math.round(female.avgContestRating)) : "Unrated", bold: true },
                { label: "Active Coders", val: `${female.activeCodersCount} / ${female.participantCount} (${female.participantCount > 0 ? Math.round((female.activeCodersCount / female.participantCount) * 100) : 0}%)`, bold: false },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between pb-2 border-b border-[#21262d]">
                  <span className="text-xs text-[#848d97]">{m.label}</span>
                  <span className={`font-mono text-${m.bold ? "base font-bold" : "sm font-semibold"} text-[#e6edf3]`}>{m.val}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#848d97]">Total Group Solves</span>
                <span className="font-mono text-xs font-semibold text-[#6e7681]">{fmtInt(female.totalSolved)} solves</span>
              </div>
            </div>
          </div>
          {female.isLowSampleSize && (
            <div className="mt-4 p-2 rounded-lg bg-[#21262d] border border-[#30363d] text-[11px] text-[#848d97]">
              Small cohort (&lt; 5 coders). Normalized averages may have high variance.
            </div>
          )}
        </div>

        {/* Male Panel */}
        <div className="card-hover relative flex flex-col justify-between p-6 rounded-2xl border border-[#21262d] bg-[#161b22]">
          <div>
            <div className="flex flex-col items-center justify-center pt-2 pb-4 border-b border-[#21262d]">
              <StickmanAvatar gender="MALE" emotion={maleEmotion} size={95} />
              <div className="mt-2 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#21262d] text-[#e6edf3] border border-[#30363d]">
                  Male Coders ({male.participantCount})
                </span>
                <p className="text-[11px] text-[#6e7681] mt-1 capitalize">Status: {maleEmotion.toLowerCase().replace("_", " ")}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: "Avg Solved / Student", val: fmt(male.avgSolvedPerStudent), bold: true },
                { label: "Avg Hard Solved", val: fmt(male.avgHardPerStudent), bold: true },
                { label: "Avg Contest Rating", val: male.avgContestRating ? String(Math.round(male.avgContestRating)) : "Unrated", bold: true },
                { label: "Active Coders", val: `${male.activeCodersCount} / ${male.participantCount} (${male.participantCount > 0 ? Math.round((male.activeCodersCount / male.participantCount) * 100) : 0}%)`, bold: false },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between pb-2 border-b border-[#21262d]">
                  <span className="text-xs text-[#848d97]">{m.label}</span>
                  <span className={`font-mono text-${m.bold ? "base font-bold" : "sm font-semibold"} text-[#e6edf3]`}>{m.val}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#848d97]">Total Group Solves</span>
                <span className="font-mono text-xs font-semibold text-[#6e7681]">{fmtInt(male.totalSolved)} solves</span>
              </div>
            </div>
          </div>
          {male.isLowSampleSize && (
            <div className="mt-4 p-2 rounded-lg bg-[#21262d] border border-[#30363d] text-[11px] text-[#848d97]">
              Small cohort (&lt; 5 coders). Normalized averages may have high variance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
