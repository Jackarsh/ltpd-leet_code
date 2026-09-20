"use client";

import { Palette } from "lucide-react";
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
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <Palette className="h-4 w-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-zinc-100">Visual Theme Presets</h3>
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
                  ? "border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/50 shadow-sm"
                  : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-800/40"
              }`}
            >
              {/* Header: Title + Swatch circle */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold transition-colors ${
                    isSelected ? "text-indigo-200 font-bold" : "text-zinc-200 group-hover:text-zinc-100"
                  }`}
                >
                  {t.label}
                </span>
                <div
                  className="h-3.5 w-3.5 rounded-full border border-zinc-700 ring-2 ring-zinc-900 shadow-sm"
                  style={{ backgroundColor: t.colors.accent }}
                  title={`Accent: ${t.colors.accent}`}
                />
              </div>

              {/* Theme description */}
              <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                {t.description}
              </p>

              {/* Swatch Preview Strip */}
              <div className="mt-1 flex items-center gap-1.5 h-3 rounded px-1.5 border border-zinc-800/80 bg-zinc-900/60">
                <span
                  className="h-2 w-4 rounded-sm border border-zinc-700/50"
                  style={{ backgroundColor: t.colors.background }}
                  title="Background"
                />
                <span
                  className="h-2 w-3 rounded-sm"
                  style={{ backgroundColor: t.colors.textPrimary }}
                  title="Primary Text"
                />
                <span
                  className="h-2 w-3 rounded-sm"
                  style={{ backgroundColor: t.colors.accent }}
                  title="Accent Color"
                />
                <span
                  className="h-2 w-2 rounded-sm"
                  style={{ backgroundColor: t.colors.textSecondary }}
                  title="Secondary Text"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
