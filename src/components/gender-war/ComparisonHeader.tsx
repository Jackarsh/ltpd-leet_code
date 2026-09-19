"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { GenderWarTimeWindow } from "@/types/gender-war";

interface ComparisonHeaderProps {
  /** The currently active time window (from URL search params). */
  currentWindow: GenderWarTimeWindow;
  /**
   * Optional: ISO-8601 timestamp of when aggregates were last computed.
   * Displayed as a "last updated" note when provided.
   */
  computedAt?: string;
}

const WINDOWS: { value: GenderWarTimeWindow; label: string; shortLabel: string }[] = [
  { value: "CURRENT_WEEK",   label: "Current Week",       shortLabel: "This Week" },
  { value: "CURRENT_MONTH",  label: "Current Month",      shortLabel: "This Month" },
  { value: "SEMESTER",       label: "Current Semester",   shortLabel: "Semester" },
  { value: "ACADEMIC_YEAR",  label: "Current Academic Year", shortLabel: "Academic Year" },
  { value: "ALL_TIME",       label: "All Time",           shortLabel: "All Time" },
];

/** Formats an ISO date string as a human-readable relative or absolute label. */
function formatComputedAt(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1)  return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24)  return `${diffHr}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * ComparisonHeader — Time-period selector for the Gender War dashboard (FR-417 / US3).
 *
 * Updates the `period` URL query param via the Next.js router.
 * The URL change triggers a server-side re-fetch of aggregate data.
 */
export function ComparisonHeader({ currentWindow, computedAt }: ComparisonHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleWindowChange = (window: GenderWarTimeWindow) => {
    const params = new URLSearchParams(searchParams.toString());
    if (window === "ALL_TIME") {
      params.delete("period");
    } else {
      params.set("period", window);
    }
    // Clear periodId when switching windows (FR-419: period boundaries come from R7 config)
    params.delete("periodId");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* Page title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Gender War
          </h1>
          <p className="mt-0.5 text-sm text-zinc-400">
            Transparent, size-normalized comparison of Male vs Female coding performance.
          </p>
        </div>

        {/* Last updated badge */}
        {computedAt && (
          <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-[11px] font-medium text-zinc-400 backdrop-blur-sm whitespace-nowrap">
            <span
              className={`h-1.5 w-1.5 rounded-full ${isPending ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`}
            />
            Updated {formatComputedAt(computedAt)}
          </span>
        )}
      </div>

      {/* Time-window pill selector (FR-417) */}
      <div
        role="tablist"
        aria-label="Comparison time period"
        className="flex flex-wrap gap-2"
      >
        {WINDOWS.map(({ value, label, shortLabel }) => {
          const isActive = currentWindow === value;
          return (
            <button
              key={value}
              role="tab"
              aria-selected={isActive}
              aria-label={label}
              onClick={() => handleWindowChange(value)}
              disabled={isPending}
              className={[
                "relative rounded-lg border px-4 py-1.5 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                isActive
                  ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-300 shadow-sm shadow-indigo-900/30"
                  : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 hover:bg-zinc-800/50",
                isPending ? "opacity-60 cursor-wait" : "",
              ].join(" ")}
            >
              {/* Show short label on small screens, full label on wider */}
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden sm:inline">{label}</span>

              {/* Active underline accent */}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-3/5 rounded-full bg-indigo-400 opacity-70"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* FR-419: Display semester / academic year date boundaries when selected.
          The actual period dates come from the R7 AcademicPeriod config; until R7
          is available, we show a contextual note so the user understands what window
          applies. */}
      {(currentWindow === "SEMESTER" || currentWindow === "ACADEMIC_YEAR") && (
        <p className="text-[12px] text-amber-400/80 border border-amber-900/40 bg-amber-950/20 rounded-lg px-3 py-2">
          <span className="font-semibold">Note:</span>{" "}
          {currentWindow === "SEMESTER"
            ? "Semester boundaries are configured by administrators. Contact your platform admin if the displayed window looks incorrect."
            : "Academic year boundaries are configured by administrators."}
        </p>
      )}
    </div>
  );
}
