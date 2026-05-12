import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Let's find any businesses that have lat > 0 (outside Peru/South America)
  const anomalies = await prisma.business.findMany({
    where: {
      lat: { gt: 0 }
    }
  });
  
  console.log(`Found ${anomalies.length} businesses with lat > 0:`);
  for (const b of anomalies) {
    console.log(`- ${b.name} (${b.id}) Lng/Lat: ${b.lng}, ${b.lat}`);
  }

  // Check if any business has 'Springfield' in description, slug, etc.
  const allBusinesses = await prisma.business.findMany();
  const springfieldMatches = allBusinesses.filter(b => 
    b.name.toLowerCase().includes("springfield") ||
    b.description?.toLowerCase().includes("springfield") ||
    b.locationSlug?.toLowerCase().includes("springfield") ||
    b.slug.toLowerCase().includes("springfield")
  );

  console.log(`\nFound ${springfieldMatches.length} matching 'springfield' anywhere:`);
  for (const b of springfieldMatches) {
    console.log(`- ${b.name} (${b.id})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
