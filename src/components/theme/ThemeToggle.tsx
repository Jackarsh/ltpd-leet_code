"use client";

import React, { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-full border border-white/15 bg-white/10" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="btn-press flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:scale-105 transition-all shadow-sm focus:outline-none"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-300 transition-transform duration-200" />
      ) : (
        <Moon className="h-4 w-4 text-slate-200 transition-transform duration-200" />
      )}
    </button>
  );
}
