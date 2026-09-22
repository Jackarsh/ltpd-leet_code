import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#faf8f5] dark:bg-[#090d16] px-4 transition-colors duration-200">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md py-12">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block group">
            <h1 className="font-display text-3xl font-black tracking-tight text-stone-900 dark:text-white">
              CodeRank
            </h1>
          </Link>
          <p className="mt-1.5 text-xs text-stone-500 dark:text-slate-400 font-medium">Elevated student engineering analytics</p>
        </div>
        <div className="rounded-2xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
