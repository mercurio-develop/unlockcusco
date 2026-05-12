import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Looking for 'Springfield' or 'Cafe Cusco'...");
  const businesses = await prisma.business.findMany({
    where: {
      OR: [
        { name: { contains: "Springfield" } },
        { locationSlug: { contains: "Springfield" } },
        { description: { contains: "Springfield" } },
        { name: { contains: "Cafe Cusco" } },
      ]
    }
  });
  
  console.log(`Found ${businesses.length} matching:`);
  for (const b of businesses) {
    console.log(`- ${b.name} (${b.id}) - locationSlug: ${b.locationSlug} - description: ${b.description?.substring(0, 50)}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
