"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { GRADUATION_YEAR_OPTIONS, ADMISSION_YEAR_OPTIONS } from "@/lib/constants/batches";

interface BatchSelectProps {
  /** The currently selected year value as a string or number. */
  value?: number | string | null;
  onChange: (value: string) => void;
  /** Which mode to display: admission year list or graduation year list. */
  mode: "admission" | "graduation";
  error?: string;
  disabled?: boolean;
  className?: string;
  /** Visual variant: "dark" uses the dark-mode palette used in auth/settings forms. */
  variant?: "dark" | "default";
}

/**
 * BatchSelect — shared dropdown for Admission/Graduation year selection.
 * Covers the range 2021–2030 from centralized batch constants.
 */
export function BatchSelect({
  value,
  onChange,
  mode,
  error,
  disabled,
  className,
  variant = "dark",
}: BatchSelectProps) {
  const options = mode === "admission" ? ADMISSION_YEAR_OPTIONS : GRADUATION_YEAR_OPTIONS;
  const label = mode === "admission" ? "Admission Year" : "Graduation Year";
  const id = mode === "admission" ? "admissionYear" : "graduationYear";

  const isDark = variant === "dark";

  const selectCls = isDark
    ? "w-full appearance-none rounded-md border border-[#30363d] bg-[#0d1117] px-3.5 py-2 pr-8 text-xs text-[#e6edf3] focus:border-[#484f58] focus:outline-none transition-colors disabled:opacity-50 cursor-pointer"
    : "w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 px-3 py-2 pr-8 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none cursor-pointer transition-all disabled:opacity-50";

  const labelCls = isDark
    ? "text-xs font-medium text-[#848d97]"
    : "text-xs font-medium text-slate-600 dark:text-slate-400";

  // Normalise value: ensure we compare as string
  const stringValue = value != null ? String(value) : "";

  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={id}
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={selectCls}
        >
          <option value="">— Select year —</option>
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className={isDark ? "bg-[#0d1117] text-[#e6edf3]" : "bg-white dark:bg-slate-900 text-slate-900 dark:text-white"}
            >
              {opt.label}
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
