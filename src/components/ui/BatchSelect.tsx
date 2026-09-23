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
}: BatchSelectProps) {
  const options = mode === "admission" ? ADMISSION_YEAR_OPTIONS : GRADUATION_YEAR_OPTIONS;
  const label = mode === "admission" ? "Admission Year" : "Graduation Year";
  const id = mode === "admission" ? "admissionYear" : "graduationYear";

  const selectCls =
    "w-full appearance-none rounded-md border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-3.5 py-2 pr-8 text-xs text-slate-900 dark:text-[#e6edf3] focus:border-blue-500 dark:focus:border-[#484f58] focus:outline-none transition-colors disabled:opacity-50 cursor-pointer shadow-sm";

  const labelCls = "text-xs font-semibold text-slate-700 dark:text-[#848d97]";

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
          <option value="" className="bg-white dark:bg-[#0d1117] text-slate-900 dark:text-[#e6edf3]">
            — Select year —
          </option>
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-white dark:bg-[#0d1117] text-slate-900 dark:text-[#e6edf3]"
            >
              {opt.label}
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
