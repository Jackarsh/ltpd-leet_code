import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getLeaderboardData } from "@/server/services/leaderboard.service";
import { LeaderboardFilterParams, LeaderboardSortDimension, LeaderboardSortDirection } from "@/types/leaderboard";
import { LeaderboardFilters } from "@/components/leaderboard/LeaderboardFilters";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { LeaderboardRefreshButton } from "@/components/leaderboard/LeaderboardRefreshButton";
import { LeaderboardHero } from "@/components/leaderboard/LeaderboardHero";
import { Navbar } from "@/components/layout/Navbar";
import { SessionProvider } from "@/components/auth/SessionProvider";

export const metadata = {
  title: "College Leaderboard — CodeRank",
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

  const topStudent = leaderboardData.students[0];

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen flex flex-col bg-[#faf8f5] dark:bg-[#090d16] text-[#1c1917] dark:text-[#f1f5f9] relative selection:bg-blue-600 selection:text-white transition-colors duration-200">
        <Navbar />

        {/* Clean Hero Section */}
        <LeaderboardHero topStudent={topStudent} totalCoders={leaderboardData.total} />

        {/* Main Canvas */}
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {/* Quick bar with refresh */}
          <div className="flex items-center justify-end mb-4">
            <LeaderboardRefreshButton lastPlatformSyncAt={leaderboardData.lastPlatformSyncAt} />
          </div>

          <div className="flex flex-col gap-8 items-start">
            <section className="flex-1 min-w-0 w-full">
              <Suspense fallback={<div className="h-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />}>
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
