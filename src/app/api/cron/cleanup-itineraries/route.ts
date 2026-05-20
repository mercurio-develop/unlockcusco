import { NextResponse } from 'next/server';
import { cleanupOldItineraries } from '@/features/itinerary/services/cleanup-service';

export async function GET(request: Request) {
  // Validate Vercel Cron Secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await cleanupOldItineraries();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to cleanup old itineraries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
