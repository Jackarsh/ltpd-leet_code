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
      <div className="min-h-screen flex flex-col bg-[#0d1117] text-[#e6edf3]">
        <Navbar />

        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#e6edf3]">
              College Coding Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-[#848d97] mt-1">
              Verified student competitive programming rankings based on LeetCode problem difficulty and contest ratings.
            </p>
          </div>

          <LeaderboardRefreshButton lastPlatformSyncAt={leaderboardData.lastPlatformSyncAt} />

          <Suspense fallback={<div className="h-16 rounded-xl bg-[#161b22] animate-pulse mb-6" />}>
            <LeaderboardFilters currentFilters={filterParams} />
          </Suspense>

          <Suspense fallback={<div className="h-96 rounded-xl bg-[#161b22] animate-pulse" />}>
            <LeaderboardTable
              data={leaderboardData}
              currentUserId={session?.user?.id}
              sortBy={sortBy}
              sortDir={sortDir}
            />
          </Suspense>
        </main>
      </div>
    </SessionProvider>
  );
}
