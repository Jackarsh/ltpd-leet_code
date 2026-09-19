"use client";

import type { CardLayout } from "@/types/profile-card";
import { LayoutGrid, Minimize2 } from "lucide-react";

interface LayoutToggleProps {
  selectedLayout: CardLayout;
  onSelectLayout: (layout: CardLayout) => void;
}

export function LayoutToggle({
  selectedLayout,
  onSelectLayout,
}: LayoutToggleProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-zinc-300">Dimension Layout</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onSelectLayout("standard")}
          className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
            selectedLayout === "standard"
              ? "border-indigo-500 bg-indigo-950/25 ring-1 ring-indigo-500/50 text-indigo-200 shadow-sm"
              : "border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/40 hover:text-zinc-200"
          }`}
        >
          <div
            className={`mt-0.5 rounded-lg p-2 ${
              selectedLayout === "standard"
                ? "bg-indigo-600/20 text-indigo-400"
                : "bg-zinc-900 text-zinc-500"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-zinc-200">Standard Banner</span>
            <span className="text-[11px] text-zinc-500">495 × 195px • Full metrics & badges</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectLayout("compact")}
          className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
            selectedLayout === "compact"
              ? "border-indigo-500 bg-indigo-950/25 ring-1 ring-indigo-500/50 text-indigo-200 shadow-sm"
              : "border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/40 hover:text-zinc-200"
          }`}
        >
          <div
            className={`mt-0.5 rounded-lg p-2 ${
              selectedLayout === "compact"
                ? "bg-indigo-600/20 text-indigo-400"
                : "bg-zinc-900 text-zinc-500"
            }`}
          >
            <Minimize2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-zinc-200">Compact Mini</span>
            <span className="text-[11px] text-zinc-500">350 × 120px • Slim sidebar & headers</span>
          </div>
        </button>
      </div>
    </div>
  );
}
