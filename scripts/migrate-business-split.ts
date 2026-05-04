import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Phase 1: Migrate Dining → Restaurant ---');
  const dining = await prisma.business.findMany({
    where: { category: 'Dining' },
  });
  console.log(`Found ${dining.length} Dining records`);

  let restaurantOk = 0;
  for (const b of dining) {
    await prisma.restaurant.upsert({
      where: { slug: b.slug },
      create: {
        id: b.id,
        slug: b.slug,
        name: b.name,
        lat: b.lat,
        lng: b.lng,
        rating: b.rating,
        scoreQuality: b.scoreQuality,
        scoreVibe: b.scoreVibe,
        scoreService: b.scoreService,
        editorialSummary: b.editorialSummary,
        editorialCategory: b.editorialCategory,
        operatingHours: b.operatingHours,
        contactPhone: b.contactPhone,
        priceTier: b.priceTier,
        reviewsCount: b.reviewsCount,
        imageUrl: b.imageUrl,
        whatsapp: b.whatsapp,
        isClaimed: b.isClaimed,
        locationSlug: b.locationSlug,
        instagramHandle: b.instagramHandle,
        instagramFollowers: b.instagramFollowers,
        heroImages: b.heroImages,
        avgDwellTimeMins: b.avgDwellTimeMins,
        marginTier: b.marginTier,
        viewsCount: b.viewsCount,
        whatsappClicksCount: b.whatsappClicksCount,
        aiRecommendationsCount: b.aiRecommendationsCount,
      },
      update: {},
    });
    restaurantOk++;
  }
  console.log(`✓ Migrated ${restaurantOk} restaurants`);

  console.log('\n--- Phase 2: Migrate Stays + Descanso → Lodging ---');
  const stays = await prisma.business.findMany({
    where: { category: { in: ['Stays', 'Descanso'] } },
  });
  console.log(`Found ${stays.length} lodging records`);

  let lodgingOk = 0;
  for (const b of stays) {
    await prisma.lodging.upsert({
      where: { slug: b.slug },
      create: {
        id: b.id,
        slug: b.slug,
        name: b.name,
        lat: b.lat,
        lng: b.lng,
        rating: b.rating,
        scoreQuality: b.scoreQuality,
        scoreVibe: b.scoreVibe,
        scoreService: b.scoreService,
        editorialSummary: b.editorialSummary,
        editorialCategory: b.editorialCategory,
        contactPhone: b.contactPhone,
        priceTier: b.priceTier,
        reviewsCount: b.reviewsCount,
        imageUrl: b.imageUrl,
        whatsapp: b.whatsapp,
        isClaimed: b.isClaimed,
        locationSlug: b.locationSlug,
        instagramHandle: b.instagramHandle,
        instagramFollowers: b.instagramFollowers,
        heroImages: b.heroImages,
        marginTier: b.marginTier,
        viewsCount: b.viewsCount,
        whatsappClicksCount: b.whatsappClicksCount,
        aiRecommendationsCount: b.aiRecommendationsCount,
      },
      update: {},
    });
    lodgingOk++;
  }
  console.log(`✓ Migrated ${lodgingOk} lodging records`);

  console.log('\n--- Phase 3: Normalize Spanish dupes in Business ---');
  const aventura = await prisma.business.updateMany({
    where: { category: 'Aventura' },
    data: { category: 'Adventure', categorySlug: 'adventure' },
  });
  const cultura = await prisma.business.updateMany({
    where: { category: 'Cultura' },
    data: { category: 'Culture', categorySlug: 'culture' },
  });
  const bienestar = await prisma.business.updateMany({
    where: { category: 'Bienestar' },
    data: { category: 'Wellness', categorySlug: 'wellness' },
  });
  console.log(`✓ Aventura→Adventure: ${aventura.count}`);
  console.log(`✓ Cultura→Culture: ${cultura.count}`);
  console.log(`✓ Bienestar→Wellness: ${bienestar.count}`);

  console.log('\n--- Final counts ---');
  const [rCount, lCount] = await Promise.all([
    prisma.restaurant.count(),
    prisma.lodging.count(),
  ]);
  const byCat = await prisma.business.groupBy({
    by: ['category'],
    _count: { category: true },
    orderBy: { _count: { category: 'desc' } },
  });
  console.log(`Restaurant table: ${rCount}`);
  console.log(`Lodging table:    ${lCount}`);
  console.log('Business categories remaining:');
  byCat.forEach(c => console.log(`  ${c.category}: ${c._count.category}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
