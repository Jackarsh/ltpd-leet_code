import { NextResponse } from 'next/server';
import { RANKING_CONFIG } from '@/lib/ranking-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(RANKING_CONFIG);
}