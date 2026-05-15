import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allBusinesses = await prisma.business.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      lat: true,
      lng: true,
      whatsapp: true,
    }
  });

  const locationMap = new Map<string, typeof allBusinesses>();

  // Group by location
  for (const b of allBusinesses) {
    if (b.lat === null || b.lng === null) continue;
    
    // Create a precise coordinate key
    const key = `${b.lat},${b.lng}`;
    if (!locationMap.has(key)) {
      locationMap.set(key, []);
    }
    locationMap.get(key)!.push(b);
  }

  // Filter groups with > 1 business
  let totalDuplicates = 0;
  let duplicateGroups = 0;

  console.log("=== LOCATION COLLISIONS ===");
  for (const [key, group] of locationMap.entries()) {
    if (group.length > 1) {
      duplicateGroups++;
      totalDuplicates += (group.length - 1);
      
      console.log(`\nLocation [${key}] has ${group.length} businesses:`);
      group.forEach(b => {
        console.log(`  - [${b.id}] ${b.name} (${b.category}) | Phone: ${b.whatsapp || 'N/A'}`);
      });
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total businesses with coordinates: ${allBusinesses.filter(b => b.lat !== null).length}`);
  console.log(`Locations with multiple businesses: ${duplicateGroups}`);
  console.log(`Total redundant records (potential deletions): ${totalDuplicates}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });