import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getLeaderboardData } from "@/server/services/leaderboard.service";
import { LeaderboardFilterParams, LeaderboardSortDimension, LeaderboardSortDirection } from "@/types/leaderboard";
import { LeaderboardFilters } from "@/components/leaderboard/LeaderboardFilters";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { LeaderboardRefreshButton } from "@/components/leaderboard/LeaderboardRefreshButton";
import { Navbar } from "@/components/layout/Navbar";
import { SessionProvider } from "@/components/auth/SessionProvider";

export const metadata = {
  title: "College Leaderboard \u2014 CodeRank",
  description: "Collegiate competitive coding ranking and LeetCode performance index.",
};

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;

  const page = parseInt((resolvedParams.page as string) || "1", 10);
  const limit = parseInt((resolvedParams.limit as string) || "25", 10);
  const search = (resolvedParams.search as string) || undefined;
  const branch = (resolvedParams.branch as string) || undefined;
  const batch = (resolvedParams.batch as string) || undefined;
  const genderRaw = resolvedParams.gender as string;
  const gender = genderRaw === "MALE" || genderRaw === "FEMALE" ? genderRaw : undefined;
  const minSolvedStr = resolvedParams.minSolved as string;
  const minSolved = minSolvedStr ? parseInt(minSolvedStr, 10) : undefined;
  const minRatingStr = resolvedParams.minRating as string;
  const minRating = minRatingStr ? parseFloat(minRatingStr) : undefined;
  const activityStatusRaw = resolvedParams.activityStatus as string;
  const activityStatus =
    activityStatusRaw === "ACTIVE" || activityStatusRaw === "INACTIVE"
      ? activityStatusRaw
      : undefined;
  const sortBy = (resolvedParams.sortBy as LeaderboardSortDimension) || "RANK";
  const sortDir = (resolvedParams.sortDir as LeaderboardSortDirection) || (sortBy === "RANK" ? "asc" : "desc");

  const filterParams: LeaderboardFilterParams = {
    page: isNaN(page) ? 1 : page,
    limit: isNaN(limit) ? 25 : limit,
    search,
    branch,
    batch,
    gender,
    minSolved: isNaN(minSolved as number) ? undefined : minSolved,
    minRating: isNaN(minRating as number) ? undefined : minRating,
    activityStatus,
    sortBy,
    sortDir,
  };

  const [session, leaderboardData] = await Promise.all([
    auth(),
    getLeaderboardData(filterParams),
  ]);

  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col bg-[#0b0f14] text-[#ece8e1] relative selection:bg-[#c89b68]/30 selection:text-[#f3cf98]">
        {/* Subtle ambient lighting: deep petrol & warm camel glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-60"
        >
          <div
            className="absolute -top-32 -left-40 h-[600px] w-[600px] rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(34, 81, 94, 0.22) 0%, transparent 70%)" }}
          />
          <div
            className="absolute top-20 right-0 h-[500px] w-[500px] rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(200, 155, 104, 0.08) 0%, transparent 70%)" }}
          />
        </div>

        <Navbar />

        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#ece8e1]">
              College Coding Leaderboard
            </h1>
            <LeaderboardRefreshButton lastPlatformSyncAt={leaderboardData.lastPlatformSyncAt} />
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <aside className="w-full lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-6">
              <Suspense fallback={<div className="h-96 rounded-xl bg-[#121820] animate-pulse" />}>
                <LeaderboardFilters currentFilters={filterParams} />
              </Suspense>
            </aside>

            <section className="flex-1 min-w-0 w-full">
              <Suspense fallback={<div className="h-96 rounded-xl bg-[#121820] animate-pulse" />}>
                <LeaderboardTable
                  data={leaderboardData}
                  currentUserId={session?.user?.id}
                  sortBy={sortBy}
                  sortDir={sortDir}
                />
              </Suspense>
            </section>
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}
