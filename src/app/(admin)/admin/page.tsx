import { db } from "@/lib/db";
import { assertAdmin } from "@/server/auth/rbac";
import Link from "next/link";
import {
  Users,
  Award,
  RefreshCw,
  Copy,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const adminUser = await assertAdmin();

  // Load high-level operational statistics
  const [
    totalUsers,
    activeUsers,
    disabledUsers,
    totalAchievements,
    pendingSyncCount,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { status: "ACTIVE" } }),
    db.user.count({ where: { status: "DISABLED" } }),
    db.achievement.count({ where: { status: "PUBLISHED" } }),
    db.linkedCodingAccount.count({ where: { syncStatus: "PENDING" } }),
  ]);

  const cards = [
    {
      title: "User Management",
      description: "Search, filter, edit profile metadata, and manage account statuses.",
      href: "/admin/users",
      icon: Users,
      stats: `${totalUsers} registered (${activeUsers} active, ${disabledUsers} disabled)`,
      accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Duplicate Resolution",
      description: "Detect contested LeetCode usernames and unlink duplicate accounts.",
      href: "/admin/duplicates",
      icon: Copy,
      stats: "Contested Handle Resolution Queue",
      accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Achievement Studio",
      description: "Author and publish gamification badges with validated condition AST rules.",
      href: "/admin/achievements",
      icon: Award,
      stats: `${totalAchievements} active published badges`,
      accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Sync Operations",
      description: "Monitor LeetCode background synchronization health and trigger manual syncs.",
      href: "/admin/sync",
      icon: RefreshCw,
      stats: `${pendingSyncCount} accounts pending synchronization`,
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
          <ShieldCheck className="h-4 w-4" />
          <span>Administration Console</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
          Welcome, {adminUser.displayName}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Supervise user accounts, monitor external synchronization, and configure collegiate gamification.
        </p>
      </div>

      {/* Overview Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <span className="text-xs text-zinc-400">Total Registered</span>
          <p className="mt-2 text-2xl font-bold text-zinc-100">{totalUsers}</p>
          <span className="text-[11px] text-zinc-500">Student & admin records</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <span className="text-xs text-zinc-400">Active Accounts</span>
          <p className="mt-2 text-2xl font-bold text-emerald-400">{activeUsers}</p>
          <span className="text-[11px] text-zinc-500">Participating in leaderboards</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <span className="text-xs text-zinc-400">Disabled / Moderated</span>
          <p className="mt-2 text-2xl font-bold text-rose-400">{disabledUsers}</p>
          <span className="text-[11px] text-zinc-500">Hidden from rankings</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <span className="text-xs text-zinc-400">Published Achievements</span>
          <p className="mt-2 text-2xl font-bold text-purple-400">{totalAchievements}</p>
          <span className="text-[11px] text-zinc-500">Dynamic collegiate badges</span>
        </div>
      </div>

      {/* Control Area Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900/90"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl border ${c.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 group-hover:text-indigo-400 transition-colors">
                    <span>Manage</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-zinc-100">
                  {c.title}
                </h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80 text-[11px] font-medium text-zinc-500">
                {c.stats}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
