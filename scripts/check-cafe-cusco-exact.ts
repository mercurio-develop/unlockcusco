import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const businesses = await prisma.business.findMany({
    where: {
      name: { contains: "Cafe Cusco" }
    }
  });
  
  for (const b of businesses) {
    console.log(`- ${b.name} (${b.id}) Lng/Lat: ${b.lng}, ${b.lat}`);
  }

  // Let's also check if any business has Springfield in name
  const springfield = await prisma.business.findMany({
    where: {
      name: { contains: "Springfield", mode: "insensitive" }
    }
  });
  for (const b of springfield) {
    console.log(`Found Springfield: - ${b.name} (${b.id}) Lng/Lat: ${b.lng}, ${b.lat}`);
  }

  // Find cafe cusco ignoring case
  const cafeCuscos = await prisma.business.findMany({
    where: {
      name: { equals: "Cafe Cusco", mode: "insensitive" }
    }
  });
  for (const b of cafeCuscos) {
    console.log(`Exact Cafe Cusco: - ${b.name} (${b.id}) Lng/Lat: ${b.lng}, ${b.lat}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
