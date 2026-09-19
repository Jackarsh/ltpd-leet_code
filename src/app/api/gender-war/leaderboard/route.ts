import { NextRequest, NextResponse } from 'next/server';
import { getWithinGroupLeaderboard } from '@/server/services/gender-war.service';
import type { GenderGroup } from '@/types/gender-war';

export const dynamic = 'force-dynamic';

const PAGE_SIZES = [10, 25, 50] as const;
type PageSize = typeof PAGE_SIZES[number];

/**
 * GET /api/gender-war/leaderboard
 *
 * Query params:
 *   gender — "MALE" | "FEMALE" (required)
 *   page   — 1-indexed page number (default: 1)
 *   limit  — entries per page: 10 | 25 | 50 (default: 10)
 *
 * Returns a paginated within-group leaderboard (FR-428 / FR-431).
 * Rows are ordered: totalSolved DESC → hardSolved DESC → collegeRank ASC (FR-430).
 * Email is never present in any returned field (constitution).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Validate gender (FR-401: only MALE and FEMALE are valid)
    const rawGender = searchParams.get('gender');
    if (rawGender !== 'MALE' && rawGender !== 'FEMALE') {
      return NextResponse.json(
        { error: 'gender must be "MALE" or "FEMALE"' },
        { status: 400 }
      );
    }
    const gender: GenderGroup = rawGender;

    // Parse and clamp pagination params
    const rawPage = parseInt(searchParams.get('page') ?? '1', 10);
    const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

    const rawLimit = parseInt(searchParams.get('limit') ?? '10', 10);
    const limit: PageSize = PAGE_SIZES.includes(rawLimit as PageSize)
      ? (rawLimit as PageSize)
      : 10;

    const offset = (page - 1) * limit;

    const rows = await getWithinGroupLeaderboard(gender, offset, limit);

    return NextResponse.json({
      gender,
      page,
      limit,
      rows,
      // hasMore helps the client know whether to show a "Load more" control
      hasMore: rows.length === limit,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve leaderboard';
    console.error('[gender-war/leaderboard] GET error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
