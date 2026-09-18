import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboardData } from '@/server/services/leaderboard.service';
import { LeaderboardFilterParams, LeaderboardSortDimension, LeaderboardSortDirection } from '@/types/leaderboard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const search = searchParams.get('search') || undefined;
    const branch = searchParams.get('branch') || undefined;
    const batch = searchParams.get('batch') || undefined;
    const genderRaw = searchParams.get('gender');
    const gender = genderRaw === 'MALE' || genderRaw === 'FEMALE' ? genderRaw : undefined;
    const minSolvedStr = searchParams.get('minSolved');
    const minSolved = minSolvedStr ? parseInt(minSolvedStr, 10) : undefined;
    const minRatingStr = searchParams.get('minRating');
    const minRating = minRatingStr ? parseFloat(minRatingStr) : undefined;
    const activityStatusRaw = searchParams.get('activityStatus');
    const activityStatus = activityStatusRaw === 'ACTIVE' || activityStatusRaw === 'INACTIVE' ? activityStatusRaw : undefined;
    const sortBy = (searchParams.get('sortBy') as LeaderboardSortDimension) || undefined;
    const sortDir = (searchParams.get('sortDir') as LeaderboardSortDirection) || undefined;

    const params: LeaderboardFilterParams = {
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

    const data = await getLeaderboardData(params);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve leaderboard data';
    console.error('Leaderboard API error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}