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
}: BranchSelectProps) {
  // Normalise legacy abbreviated value so the dropdown shows the correct option.
  const normalised = normalizeBranch(value) ?? "";

  const selectCls =
    "w-full appearance-none rounded-md border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-3.5 py-2 pr-8 text-xs text-slate-900 dark:text-[#e6edf3] focus:border-blue-500 dark:focus:border-[#484f58] focus:outline-none transition-colors disabled:opacity-50 cursor-pointer shadow-sm";

  const labelCls = "text-xs font-semibold text-slate-700 dark:text-[#848d97]";

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
          <option value="" className="bg-white dark:bg-[#0d1117] text-slate-900 dark:text-[#e6edf3]">
            — Select a branch —
          </option>
          {ENGINEERING_BRANCHES.map((b) => (
            <option
              key={b.value}
              value={b.value}
              className="bg-white dark:bg-[#0d1117] text-slate-900 dark:text-[#e6edf3]"
            >
              {b.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-[#848d97]"
        />
      </div>
      {error && <p className="text-xs text-rose-500 dark:text-[#f85149] mt-1">{error}</p>}
    </div>
  );
}
