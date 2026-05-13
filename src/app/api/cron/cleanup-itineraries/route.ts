import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    // Calculate the date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Delete records older than 30 days
    const result = await prisma.savedItinerary.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    console.log(`Cron /cleanup-itineraries: Deleted ${result.count} old itineraries.`);

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      cutoffDate: thirtyDaysAgo.toISOString()
    });
  } catch (error) {
    console.error('Failed to cleanup old itineraries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
