"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { ENGINEERING_BRANCHES, normalizeBranch } from "@/lib/constants/branches";

interface BranchSelectProps {
  /** Currently selected branch value (may be a legacy abbreviation — normalised automatically). */
  value?: string | null;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  /** Tailwind class string applied to the outer wrapper div. */
  className?: string;
  /** Visual variant: "dark" uses the dark-mode palette used in auth/settings forms. */
  variant?: "dark" | "default";
}

/**
 * BranchSelect — shared dropdown for Engineering Branch selection.
 * Normalises legacy abbreviated values (e.g. "CSE") to full names on mount.
 */
export function BranchSelect({
  value,
  onChange,
  error,
  disabled,
  className,
  variant = "dark",
}: BranchSelectProps) {
  // Normalise legacy abbreviated value so the dropdown shows the correct option.
  const normalised = normalizeBranch(value) ?? "";

  const isDark = variant === "dark";

  const selectCls = isDark
    ? "w-full appearance-none rounded-md border border-[#30363d] bg-[#0d1117] px-3.5 py-2 pr-8 text-xs text-[#e6edf3] focus:border-[#484f58] focus:outline-none transition-colors disabled:opacity-50 cursor-pointer"
    : "w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 px-3 py-2 pr-8 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none cursor-pointer transition-all disabled:opacity-50";

  const labelCls = isDark
    ? "text-xs font-medium text-[#848d97]"
    : "text-xs font-medium text-slate-600 dark:text-slate-400";

  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <label htmlFor="branch" className={labelCls}>
        Engineering Branch
      </label>
      <div className="relative">
        <select
          id="branch"
          name="branch"
          value={normalised}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={selectCls}
        >
          <option value="">— Select a branch —</option>
          {ENGINEERING_BRANCHES.map((b) => (
            <option
              key={b.value}
              value={b.value}
              className={isDark ? "bg-[#0d1117] text-[#e6edf3]" : "bg-white dark:bg-slate-900 text-slate-900 dark:text-white"}
            >
              {b.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${
            isDark ? "text-[#848d97]" : "text-slate-400"
          }`}
        />
      </div>
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  );
}
