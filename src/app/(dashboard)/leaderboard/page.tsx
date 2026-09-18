import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getLeaderboardData } from "@/server/services/leaderboard.service";
import { getRecognitionCards } from "@/server/services/recognition.service";
import { LeaderboardFilterParams, LeaderboardSortDimension, LeaderboardSortDirection } from "@/types/leaderboard";
import { RecognitionCards } from "@/components/leaderboard/RecognitionCards";
import { LeaderboardFilters } from "@/components/leaderboard/LeaderboardFilters";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { LeaderboardRefreshButton } from "@/components/leaderboard/LeaderboardRefreshButton";
import { Trophy } from "lucide-react";

export const metadata = {
  title: "College Leaderboard | CodeRank",
  description: "Collegiate competitive coding ranking and LeetCode performance index.",
};

interface LeaderboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
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

  // Concurrent data fetching on the server for instant page load
  const [session, leaderboardData, recognitionCards] = await Promise.all([
    auth(),
    getLeaderboardData(filterParams),
    getRecognitionCards(),
  ]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              College Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Deterministic ranking based on weighted LeetCode problem difficulty and verified contest ratings.
            </p>
          </div>
        </div>
      </div>

      {/* Recognition Cards (Top Solvers, Contest Leaders) */}
      <RecognitionCards cards={recognitionCards} />

      {/* Data Freshness & UI Refresh Bar */}
      <LeaderboardRefreshButton lastPlatformSyncAt={leaderboardData.lastPlatformSyncAt} />

      {/* Filter & Search Bar wrapped in Suspense */}
      <Suspense fallback={<div className="h-20 rounded-xl bg-zinc-900/40 animate-pulse mb-6" />}>
        <LeaderboardFilters currentFilters={filterParams} />
      </Suspense>

      {/* Interactive Leaderboard Table */}
      <Suspense fallback={<div className="h-96 rounded-xl bg-zinc-900/40 animate-pulse" />}>
        <LeaderboardTable
          data={leaderboardData}
          currentUserId={session?.user?.id}
          sortBy={sortBy}
          sortDir={sortDir}
        />
      </Suspense>
    </div>
  );
}