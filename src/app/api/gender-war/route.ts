import { NextRequest, NextResponse } from 'next/server';
import { getGenderWarData } from '@/server/services/gender-war.service';
import type { GenderWarTimeWindow } from '@/types/gender-war';

export const dynamic = 'force-dynamic';

const VALID_WINDOWS: GenderWarTimeWindow[] = [
  'CURRENT_WEEK',
  'CURRENT_MONTH',
  'SEMESTER',
  'ACADEMIC_YEAR',
  'ALL_TIME',
];

/**
 * GET /api/gender-war
 *
 * Query params:
 *   period   — one of CURRENT_WEEK | CURRENT_MONTH | SEMESTER | ACADEMIC_YEAR | ALL_TIME
 *              Defaults to ALL_TIME.
 *   periodId — optional academic period ID (for SEMESTER / ACADEMIC_YEAR).
 *
 * Returns GroupMetricsDTO for both genders plus top-10 within-group leaderboards.
 * Email is never present in any returned field (constitution).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const rawPeriod = searchParams.get('period') ?? 'ALL_TIME';
    const timeWindow: GenderWarTimeWindow = VALID_WINDOWS.includes(rawPeriod as GenderWarTimeWindow)
      ? (rawPeriod as GenderWarTimeWindow)
      : 'ALL_TIME';

    const periodId = searchParams.get('periodId') ?? null;

    const data = await getGenderWarData(timeWindow, periodId);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve Gender War data';
    console.error('[gender-war] GET error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
