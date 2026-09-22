"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { GenderWarTimeWindow } from "@/types/gender-war";

interface ComparisonHeaderProps { currentWindow: GenderWarTimeWindow; computedAt?: string; }

const WINDOWS: { value: GenderWarTimeWindow; label: string }[] = [
  { value: "CURRENT_WEEK", label: "Current Week" },
  { value: "CURRENT_MONTH", label: "Current Month" },
  { value: "SEMESTER", label: "Semester" },
  { value: "ACADEMIC_YEAR", label: "Academic Year" },
  { value: "ALL_TIME", label: "All Time" },
];

function formatComputedAt(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ComparisonHeader({ currentWindow, computedAt }: ComparisonHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleWindowChange = (window: GenderWarTimeWindow) => {
    if (window === currentWindow || isPending) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", window);
    startTransition(() => { router.push(`${pathname}?${params.toString()}`); });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200 dark:border-slate-800">
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {WINDOWS.map((item) => {
          const isActive = item.value === currentWindow;
          return (
            <button
              key={item.value}
              onClick={() => handleWindowChange(item.value)}
              disabled={isPending}
              className={`font-display text-xs font-bold transition-all px-3.5 py-1.5 rounded-full ${
                isActive
                  ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-sm"
                  : "text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {computedAt && (
        <span className="text-[11px] text-stone-400 dark:text-slate-500 font-medium">
          Updated {formatComputedAt(computedAt)}
        </span>
      )}
    </div>
  );
}
