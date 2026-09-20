import { NextRequest, NextResponse } from 'next/server';
import {
  getCardDataByIdentifier,
  renderCardSvg,
  generateUnavailableCardSvg,
} from '@/server/services/card-svg.service';
import type { CardLayout, CardTheme } from '@/types/profile-card';

export const dynamic = 'force-dynamic';

// In-memory IP rate limiter: 120 requests/minute (spec FR-409/clarification)
// ponytail: In-memory sliding window provides clean, zero-external-dependency rate limiting.
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 120;
const ipRequestCounts = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipRequestCounts.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipRequestCounts.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count += 1;
  return false;
}

// Clean up stale rate limiter entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestCounts.entries()) {
    if (now - record.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
      ipRequestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const rawId = resolvedParams.id;

  // Clean extension if user requested /api/cards/username.svg or username.png
  const identifier = rawId.replace(/\.(svg|png)$/i, '');

  // Extract client IP for rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  if (isRateLimited(ip)) {
    return new NextResponse('Rate limit exceeded (120 requests/minute).', {
      status: 429,
      headers: {
        'Content-Type': 'text/plain',
        'Retry-After': '60',
      },
    });
  }

  const { searchParams } = request.nextUrl;
  const themeParam = searchParams.get('theme') as CardTheme | null;
  const layoutParam = searchParams.get('layout') as CardLayout | null;

  try {
    const cardData = await getCardDataByIdentifier(identifier);

    let svgContent: string;
    if (!cardData) {
      svgContent = generateUnavailableCardSvg(themeParam ?? 'github-dark');
    } else {
      svgContent = renderCardSvg(
        cardData.metrics,
        cardData.config,
        layoutParam ?? undefined,
        themeParam ?? undefined
      );
    }

    return new NextResponse(svgContent, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error(`[cards/route] Error generating profile card for "${identifier}":`, error);
    const fallbackSvg = generateUnavailableCardSvg(themeParam ?? 'github-dark');
    return new NextResponse(fallbackSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
