"use client";

import React from "react";

interface GenderSelectProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

// FR-003, US6: Exactly two options — Male and Female.
// No other values, no free-text, no "Other", no "Prefer not to say".
// FR-025: Gender is NEVER pre-selected or inferred.
export function GenderSelect({ value, onChange, error, disabled }: GenderSelectProps) {
  const options = [
    { label: "Male", value: "MALE" },
    { label: "Female", value: "FEMALE" },
  ];

  return (
    <fieldset className="space-y-1.5" disabled={disabled}>
      <legend className="text-xs font-semibold text-slate-700 dark:text-[#848d97]">
        Gender <span className="text-rose-500 dark:text-[#f85149]">*</span>
      </legend>
      <div className="flex gap-4">
        {options.map((option) => (
          <label
            key={option.value}
            className={[
              "flex items-center gap-2.5 cursor-pointer rounded-lg border px-4 py-2 text-xs font-medium transition-all",
              value === option.value
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-300 shadow-sm"
                : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#848d97] dark:hover:border-[#484f58]",
              disabled ? "opacity-50 cursor-not-allowed" : "",
            ].join(" ")}
          >
            <input
              type="radio"
              name="gender"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
              aria-label={option.label}
            />
            <div
              className={[
                "h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all",
                value === option.value
                  ? "border-blue-600 dark:border-indigo-500"
                  : "border-slate-300 dark:border-[#484f58]",
              ].join(" ")}
            >
              {value === option.value && (
                <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-indigo-500" />
              )}
            </div>
            <span className="font-semibold">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="text-xs text-rose-500 dark:text-[#f85149] mt-1">{error}</p>
      )}
    </fieldset>
  );
}
