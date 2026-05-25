import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cultureBusinesses = await prisma.business.findMany({
    where: {
      category: 'culture'
    },
    select: {
      id: true,
      name: true,
      locationSlug: true,
      lat: true,
      lng: true
    }
  });

  // Group by normalized name
  const nameMap = new Map<string, typeof cultureBusinesses>();

  for (const b of cultureBusinesses) {
    const normalizedName = b.name.trim().toLowerCase();
    if (!nameMap.has(normalizedName)) {
      nameMap.set(normalizedName, []);
    }
    nameMap.get(normalizedName)!.push(b);
  }

  let totalDuplicates = 0;
  let duplicateGroups = 0;

  console.log("=== DUPLICATES IN 'CULTURE' CATEGORY ===");
  for (const [name, group] of nameMap.entries()) {
    if (group.length > 1) {
      duplicateGroups++;
      totalDuplicates += (group.length - 1);
      
      console.log(`\nName [${name}] has ${group.length} entries:`);
      group.forEach(b => {
        console.log(`  - [${b.id}] ${b.name} (Location: ${b.locationSlug}) | Coords: ${b.lat},${b.lng}`);
      });
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total 'culture' businesses: ${cultureBusinesses.length}`);
  console.log(`Total duplicate names (groups): ${duplicateGroups}`);
  console.log(`Total redundant records (potential deletions): ${totalDuplicates}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
