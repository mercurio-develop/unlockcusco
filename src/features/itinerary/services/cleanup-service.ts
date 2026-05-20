import { prisma } from '@/lib/prisma';

export async function cleanupOldItineraries() {
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

  return {
    success: true,
    deletedCount: result.count,
    cutoffDate: thirtyDaysAgo.toISOString()
  };
}
