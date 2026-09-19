"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Settings, BarChart3, Trophy, Swords, Share2 } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-400" />
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              CodeRank
            </span>
          </Link>

          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 hover:text-indigo-400 transition-colors"
          >
            <Trophy className="h-4 w-4 text-amber-400" />
            <span>Leaderboard</span>
          </Link>

          <Link
            href="/gender-war"
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 hover:text-indigo-400 transition-colors"
          >
            <Swords className="h-4 w-4 text-indigo-400" />
            <span>Gender War</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                Dashboard
              </Link>
              <Link
                href="/studio/card"
                className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-indigo-400 transition-colors"
              >
                <Share2 className="h-4 w-4 text-indigo-400" />
                <span>Card Studio</span>
              </Link>
              <Link href="/settings/profile" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                <Settings className="h-5 w-5" />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}