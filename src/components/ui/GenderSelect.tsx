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
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-sm font-medium text-zinc-300">
        Gender <span className="text-rose-400">*</span>
      </legend>
      <div className="flex gap-4">
        {options.map((option) => (
          <label
            key={option.value}
            className={[
              "flex items-center gap-2 cursor-pointer rounded-lg border px-4 py-2.5 transition-all",
              value === option.value
                ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-500",
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
                value === option.value ? "border-indigo-500" : "border-zinc-600",
              ].join(" ")}
            >
              {value === option.value && (
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
              )}
            </div>
            <span className="text-sm font-medium">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="text-sm text-rose-400 mt-1">{error}</p>
      )}
    </fieldset>
  );
}
