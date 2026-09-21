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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#21262d]">
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {WINDOWS.map((item, index) => {
          const isActive = item.value === currentWindow;
          return (
            <span key={item.value} className="inline-flex items-center">
              <button onClick={() => handleWindowChange(item.value)} disabled={isPending}
                className={`font-display font-semibold transition-all px-2.5 py-1 rounded-md ${
                  isActive ? "bg-[#21262d] text-[#e6edf3]" : "text-[#848d97] hover:text-[#e6edf3] hover:bg-[#161b22]"
                }`}>
                {item.label}
              </button>
              {index < WINDOWS.length - 1 && <span className="text-[#30363d] px-1 select-none">|</span>}
            </span>
          );
        })}
      </div>
      {computedAt && <div className="text-xs text-[#6e7681]">Updated {formatComputedAt(computedAt)}</div>}
    </div>
  );
}
