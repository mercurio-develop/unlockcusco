import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Optional: Set to false to actually perform the DB updates/deletes.
const DRY_RUN = false;

async function main() {
  console.log(`Starting duplicate business cleanup... (DRY_RUN=${DRY_RUN})\n`);

  // 1. Fetch all businesses
  const allBusinesses = await prisma.business.findMany({
    include: {
      _count: {
        select: {
          tourPackages: true,
          services: true,
          reviews: true,
          leads: true,
          trips: true,
        },
      },
    },
  });

  // 2. Group by normalized name
  const nameMap = new Map<string, typeof allBusinesses>();

  for (const b of allBusinesses) {
    const normalized = b.name.trim().toLowerCase();
    if (!nameMap.has(normalized)) {
      nameMap.set(normalized, []);
    }
    nameMap.get(normalized)!.push(b);
  }

  // Filter groups with > 1 item
  const duplicateGroups = Array.from(nameMap.entries()).filter(
    ([, group]) => group.length > 1
  );

  if (duplicateGroups.length === 0) {
    console.log('No duplicate businesses found!');
    return;
  }

  console.log(`Found ${duplicateGroups.length} groups of duplicates.\n`);

  // 3. Process each group
  for (const [name, group] of duplicateGroups) {
    console.log(`\nProcessing group: "${name}" (${group.length} duplicates)`);

    // Determine the "primary" business to keep
    // Priority:
    // 1. isClaimed === true
    // 2. Max combined count of related records (packages + services + reviews + leads + trips)
    const sortedGroup = group.sort((a, b) => {
      if (a.isClaimed && !b.isClaimed) return -1;
      if (!a.isClaimed && b.isClaimed) return 1;

      const countA =
        a._count.tourPackages +
        a._count.services +
        a._count.reviews +
        a._count.leads +
        a._count.trips;
      const countB =
        b._count.tourPackages +
        b._count.services +
        b._count.reviews +
        b._count.leads +
        b._count.trips;

      return countB - countA; // Descending
    });

    const primary = sortedGroup[0];
    const duplicates = sortedGroup.slice(1);

    console.log(`  -> Keeping Primary ID: ${primary.id} (Claimed: ${primary.isClaimed}, Name: ${primary.name})`);

    for (const dup of duplicates) {
      console.log(`  -> Merging and deleting Duplicate ID: ${dup.id} (Name: ${dup.name})`);

      if (!DRY_RUN) {
        // Execute operations in a transaction to ensure data integrity
        await prisma.$transaction(async (tx) => {
          // Re-link TourPackages
          if (dup._count.tourPackages > 0) {
            await tx.tourPackage.updateMany({
              where: { businessId: dup.id },
              data: { businessId: primary.id },
            });
            console.log(`    - Migrated ${dup._count.tourPackages} TourPackages`);
          }

          // Re-link BusinessServices
          if (dup._count.services > 0) {
            await tx.businessService.updateMany({
              where: { businessId: dup.id },
              data: { businessId: primary.id },
            });
            console.log(`    - Migrated ${dup._count.services} Services`);
          }

          // Re-link Reviews
          if (dup._count.reviews > 0) {
            await tx.review.updateMany({
              where: { businessId: dup.id },
              data: { businessId: primary.id },
            });
            console.log(`    - Migrated ${dup._count.reviews} Reviews`);
          }

          // Re-link Leads
          if (dup._count.leads > 0) {
            await tx.lead.updateMany({
              where: { businessId: dup.id },
              data: { businessId: primary.id },
            });
            console.log(`    - Migrated ${dup._count.leads} Leads`);
          }

          // Re-link Trips
          if (dup._count.trips > 0) {
            await tx.trip.updateMany({
              where: { businessId: dup.id },
              data: { businessId: primary.id },
            });
            console.log(`    - Migrated ${dup._count.trips} Trips`);
          }

          // Delete the duplicate business
          await tx.business.delete({
            where: { id: dup.id },
          });
          console.log(`    - Deleted duplicate business ${dup.id}`);
        });
      } else {
        console.log(`    [DRY RUN] Would migrate relations and delete ${dup.id}`);
      }
    }
  }

  console.log('\nCleanup process finished.');
}

main()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
