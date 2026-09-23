"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  const options = [
    {
      value: "light" as const,
      label: "Light",
      description: "Clean white interface",
      Icon: Sun,
    },
    {
      value: "dark" as const,
      label: "Dark",
      description: "Easy on the eyes",
      Icon: Moon,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#21262d] pb-3">
        <Monitor className="h-4 w-4 text-slate-500 dark:text-[#848d97]" />
        <h2 className="text-sm font-semibold text-slate-900 dark:text-[#e6edf3]">Appearance</h2>
      </div>

      <p className="text-xs text-slate-500 dark:text-[#848d97]">
        Choose how CodeRank looks for you. Your preference is saved and applied across all pages.
      </p>

      <div className="flex gap-3">
        {options.map(({ value, label, description, Icon }) => {
          const isActive = theme === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={[
                "flex-1 flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
                isActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-sm"
                  : "border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#0d1117] hover:border-slate-300 dark:hover:border-[#484f58]",
              ].join(" ")}
              aria-pressed={isActive}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-[#848d97]"
                }`}
              />
              <div>
                <p
                  className={`text-xs font-bold ${
                    isActive ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-[#e6edf3]"
                  }`}
                >
                  {label}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-[#848d97] mt-0.5">{description}</p>
              </div>
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
