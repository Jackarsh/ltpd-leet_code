import { NextResponse } from 'next/server';
import { getRecognitionCards } from '@/server/services/recognition.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cards = await getRecognitionCards();
    return NextResponse.json(cards);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve recognition cards';
    console.error('Recognition API error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}