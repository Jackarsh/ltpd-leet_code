import Link from "next/link";
import { ArrowRight, Code2, Trophy, Swords, ShieldCheck, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[350px] bg-indigo-500/10 blur-[100px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">CodeCampus</span>
              <span className="ml-2 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                COLLEGE EDITION
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-32">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Real-time LeetCode Sync &amp; College Leaderboards</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Elevate Your Coding. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Compete With Your Campus.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Connect your LeetCode profile, track daily progress, climb the college leaderboard, 
            and battle in campus-wide coding tournaments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-600/25 hover:from-indigo-500 hover:to-purple-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Claim Your Profile <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-7 py-3.5 text-base font-semibold text-zinc-300 hover:bg-zinc-800/80 hover:text-white transition-all backdrop-blur-md"
            >
              Student Login
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">
          <div className="group rounded-2xl border border-zinc-800/90 bg-zinc-900/40 p-6 backdrop-blur-md hover:border-indigo-500/50 hover:bg-zinc-900/60 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4 group-hover:scale-110 transition-transform">
              <Trophy className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">College Leaderboards</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Transparent, automated standings ranked by solved problem difficulty, contest ratings, and submission consistency.
            </p>
          </div>

          <div className="group rounded-2xl border border-zinc-800/90 bg-zinc-900/40 p-6 backdrop-blur-md hover:border-purple-500/50 hover:bg-zinc-900/60 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4 group-hover:scale-110 transition-transform">
              <Swords className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Gender War Tournament</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Campus tournament tracking average points, participation rates, and solving velocity between cohorts.
            </p>
          </div>

          <div className="group rounded-2xl border border-zinc-800/90 bg-zinc-900/40 p-6 backdrop-blur-md hover:border-pink-500/50 hover:bg-zinc-900/60 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Privacy &amp; Fair Play</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Verified accounts, zero invasive tracking, protected institutional identities, and automated anti-cheat audits.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/80 bg-zinc-950/80 py-8 text-center text-xs text-zinc-600">
        <p>College Coding Platform &bull; Built for competitive coders</p>
      </footer>
    </div>
  );
}