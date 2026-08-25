import { NextResponse } from 'next/server';
import { buildSpotQuotes } from '@/lib/market-prices';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    source: 'reference',
    quotes: buildSpotQuotes(),
  });
}
