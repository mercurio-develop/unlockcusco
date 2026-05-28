import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const businesses = await prisma.business.findMany({
    select: {
      name: true,
      reviewsCount: true,
      _count: {
        select: { reviews: true }
      }
    },
    orderBy: {
      reviewsCount: 'desc'
    }
  });
  
  const withReviews = businesses.filter(b => b._count.reviews > 0);
  const withoutReviews = businesses.length - withReviews.length;
  
  // Group by buckets based on actual review records in our DB
  const buckets = {
    '15+': withReviews.filter(b => b._count.reviews >= 15).length,
    '10-14': withReviews.filter(b => b._count.reviews >= 10 && b._count.reviews < 15).length,
    '5-9': withReviews.filter(b => b._count.reviews >= 5 && b._count.reviews < 10).length,
    '1-4': withReviews.filter(b => b._count.reviews >= 1 && b._count.reviews < 5).length,
    '0': withoutReviews
  };
  
  console.log(`\n=== REVIEW SUMMARY ===`);
  console.log(`Total Businesses in DB: ${businesses.length}`);
  console.log(`Businesses with actual review records: ${withReviews.length}`);
  console.log(`Businesses with zero review records: ${withoutReviews}`);
  console.log(`\n=== REVIEW DISTRIBUTION (Actual Records) ===`);
  console.log(`15+ Reviews : ${buckets['15+']} businesses`);
  console.log(`10-14 Reviews: ${buckets['10-14']} businesses`);
  console.log(`5-9 Reviews  : ${buckets['5-9']} businesses`);
  console.log(`1-4 Reviews  : ${buckets['1-4']} businesses`);
  console.log(`0 Reviews    : ${buckets['0']} businesses`);
  
  console.log('\n=== TOP 5 MOST REVIEWED BUSINESSES ===');
  withReviews.sort((a,b) => b._count.reviews - a._count.reviews).slice(0, 5).forEach(b => {
    console.log(`- ${b.name}: ${b._count.reviews} records`);
  });
}

main().finally(() => prisma.$disconnect());