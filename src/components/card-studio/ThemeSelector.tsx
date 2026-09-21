"use client";

import { CARD_THEMES } from "@/lib/card-themes";
import type { CardTheme } from "@/types/profile-card";

interface ThemeSelectorProps {
  selectedTheme: CardTheme;
  onSelectTheme: (theme: CardTheme) => void;
}

export function ThemeSelector({
  selectedTheme,
  onSelectTheme,
}: ThemeSelectorProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#30363d] bg-[#161b22] p-5">
      <div className="border-b border-[#21262d] pb-3">
        <h3 className="text-sm font-semibold text-[#e6edf3]">Visual Theme Presets</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {Object.values(CARD_THEMES).map((t) => {
          const isSelected = selectedTheme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTheme(t.id)}
              className={`group flex flex-col gap-2 rounded-xl border p-3.5 text-left transition-all relative overflow-hidden ${
                isSelected
                  ? "border-[#484f58] bg-[#21262d] shadow-sm"
                  : "border-[#30363d] bg-[#0d1117] hover:border-[#484f58]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold transition-colors ${
                    isSelected ? "text-[#e6edf3]" : "text-[#c9d1d9] group-hover:text-[#e6edf3]"
                  }`}
                >
                  {t.label}
                </span>
                <span
                  className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-inner"
                  style={{ backgroundColor: t.colors.accent }}
                  title={`Accent: ${t.colors.accent}`}
                />
              </div>

              <span className="text-[11px] text-[#848d97] leading-relaxed line-clamp-2">
                {t.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
