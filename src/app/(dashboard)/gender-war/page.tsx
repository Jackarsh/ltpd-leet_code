import { Suspense } from "react";
import type { Metadata } from "next";
import { getGenderWarData } from "@/server/services/gender-war.service";
import { ComparisonHeader } from "@/components/gender-war/ComparisonHeader";
import { SymmetricalPanels } from "@/components/gender-war/SymmetricalPanels";
import { MetricComparisonCharts } from "@/components/gender-war/MetricComparisonCharts";
import { WithinGroupLeaderboards } from "@/components/gender-war/WithinGroupLeaderboards";
import type { GenderWarTimeWindow } from "@/types/gender-war";

export const metadata: Metadata = {
  title: "Gender War Arena | CodeRank",
  description: "Transparent, size-normalized coding performance comparison between Male and Female students.",
};
export const revalidate = 300;

const VALID_WINDOWS: GenderWarTimeWindow[] = [
  "CURRENT_WEEK",
  "CURRENT_MONTH",
  "SEMESTER",
  "ACADEMIC_YEAR",
  "ALL_TIME",
];

interface GenderWarPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GenderWarPage({ searchParams }: GenderWarPageProps) {
  const resolved = await searchParams;
  const rawPeriod = (resolved.period as string) ?? "ALL_TIME";
  const timeWindow: GenderWarTimeWindow = VALID_WINDOWS.includes(rawPeriod as GenderWarTimeWindow)
    ? (rawPeriod as GenderWarTimeWindow)
    : "ALL_TIME";
  const periodId = (resolved.periodId as string) ?? null;
  const data = await getGenderWarData(timeWindow, periodId);

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#090d16] text-[#1c1917] dark:text-[#f1f5f9] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-200">
      {/* Page Title & Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-stone-900 dark:text-white">
          Gender War Arena
        </h1>
      </div>

      <div className="space-y-8">
        <Suspense
          fallback={
            <div className="space-y-3">
              <div className="h-9 w-64 rounded-full bg-stone-200 animate-pulse" />
            </div>
          }
        >
          <ComparisonHeader currentWindow={timeWindow} computedAt={data.computedAt} />
        </Suspense>

        <SymmetricalPanels male={data.male} female={data.female} />

        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="h-80 rounded-2xl bg-white border border-stone-200 animate-pulse" />
              <div className="h-80 rounded-2xl bg-white border border-stone-200 animate-pulse" />
            </div>
          }
        >
          <WithinGroupLeaderboards
            maleTop10={data.maleTop10}
            femaleTop10={data.femaleTop10}
            maleParticipantCount={data.male.participantCount}
            femaleParticipantCount={data.female.participantCount}
          />
        </Suspense>

        <MetricComparisonCharts male={data.male} female={data.female} />
      </div>
    </div>
  );
}
