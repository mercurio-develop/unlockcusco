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
    console.log(`  Description: ${b.description}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
