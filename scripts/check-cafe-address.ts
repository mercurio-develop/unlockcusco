import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const businesses = await prisma.business.findMany({
    where: {
      name: { contains: "Cafe Cusco" }
    }
  });
  
  for (const b of businesses) {
    console.log(`- ${b.name} (${b.id})`);
    console.log(`  Address: ${b.address}`);
    console.log(`  LocationSlug: ${b.locationSlug}`);
    console.log(`  Lng/Lat: ${b.lng}, ${b.lat}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
