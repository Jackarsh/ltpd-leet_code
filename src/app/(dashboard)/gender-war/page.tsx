import { Suspense } from "react";
import type { Metadata } from "next";
import { getGenderWarData } from "@/server/services/gender-war.service";
import { ComparisonHeader } from "@/components/gender-war/ComparisonHeader";
import { SymmetricalPanels } from "@/components/gender-war/SymmetricalPanels";
import { MetricComparisonCharts } from "@/components/gender-war/MetricComparisonCharts";
import { WithinGroupLeaderboards } from "@/components/gender-war/WithinGroupLeaderboards";
import { MethodologyPanel } from "@/components/gender-war/MethodologyPanel";
import type { GenderWarTimeWindow } from "@/types/gender-war";

export const metadata: Metadata = {
  title: "Gender War | CodeRank",
  description:
    "Transparent, size-normalized coding performance comparison between Male and Female students. Multi-dimensional metrics — no single winner declared.",
};

// Revalidate at most every 5 minutes; real invalidation happens after sync batch (FR-416)
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

/**
 * Gender War dashboard page (US1 / FR-406 / FR-408).
 *
 * Publicly accessible without authentication (assumption from spec.md).
 * Server-rendered on every request within the revalidation window.
 *
 * Layout order (top → bottom):
 *   1. ComparisonHeader — time-period selector + last-updated badge
 *   2. MethodologyPanel — collapsible formula explanation (US6)
 *   3. SymmetricalPanels — side-by-side metric cards (US1 / US2)
 *   4. MetricComparisonCharts — visual bars (US4)
 *   5. WithinGroupLeaderboards — ranked students per group (US5)
 */
export default async function GenderWarPage({ searchParams }: GenderWarPageProps) {
  const resolved = await searchParams;

  // Parse and validate the time window (FR-417)
  const rawPeriod = (resolved.period as string) ?? "ALL_TIME";
  const timeWindow: GenderWarTimeWindow = VALID_WINDOWS.includes(
    rawPeriod as GenderWarTimeWindow
  )
    ? (rawPeriod as GenderWarTimeWindow)
    : "ALL_TIME";

  const periodId = (resolved.periodId as string) ?? null;

  // Fetch all data server-side (SC-401: must render within 3s under normal load)
  const data = await getGenderWarData(timeWindow, periodId);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* 1. Header: page title + time-period selector (FR-417 / US3) */}
        <Suspense
          fallback={
            <div className="space-y-3">
              <div className="h-9 w-64 rounded-lg bg-zinc-800/60 animate-pulse" />
              <div className="h-5 w-96 rounded bg-zinc-800/40 animate-pulse" />
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-9 w-28 rounded-lg bg-zinc-800/50 animate-pulse" />
                ))}
              </div>
            </div>
          }
        >
          <ComparisonHeader
            currentWindow={timeWindow}
            computedAt={data.computedAt}
          />
        </Suspense>

        {/* 2. Methodology — collapsible (US6 / FR-422) */}
        <MethodologyPanel />

        {/* 3. Symmetrical group metric panels (US1 / US2 / FR-406 / FR-407) */}
        <SymmetricalPanels male={data.male} female={data.female} />

        {/* 4. Visual comparison charts (US4 / FR-425 / FR-426) */}
        <MetricComparisonCharts male={data.male} female={data.female} />

        {/* 5. Within-group leaderboards (US5 / FR-428) */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="h-80 rounded-xl bg-zinc-900/40 animate-pulse" />
              <div className="h-80 rounded-xl bg-zinc-900/40 animate-pulse" />
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

      </div>
    </div>
  );
}
