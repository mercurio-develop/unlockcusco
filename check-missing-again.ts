import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const missing = await prisma.business.findMany({
    where: {
      description: ""
    },
    include: { reviews: true }
  });

  console.log(`Total missing: ${missing.length}`);
  const noReviews = missing.filter(b => b.reviews.length === 0);
  console.log(`Missing with 0 reviews: ${noReviews.length}`);
  const hasReviews = missing.filter(b => b.reviews.length > 0);
  console.log(`Missing with >0 reviews: ${hasReviews.length}`);
  
  if (hasReviews.length > 0) {
    const hasPositives = hasReviews.filter(b => b.reviews.some(r => r.rating >= 4));
    console.log(`Missing with >=1 positive review: ${hasPositives.length}`);
    const noPositives = hasReviews.filter(b => !b.reviews.some(r => r.rating >= 4));
    console.log(`Missing with 0 positive reviews (only bad reviews): ${noPositives.length}`);
  }
}
main().finally(() => prisma.$disconnect());
