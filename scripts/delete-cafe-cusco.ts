import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Looking for 'Cafe Cusco' in 'Springfield'...");
  const businesses = await prisma.business.findMany({
    where: {
      name: { contains: "Cafe Cusco" }
    }
  });
  
  console.log(`Found ${businesses.length} matching 'Cafe Cusco':`);
  for (const b of businesses) {
    console.log(`- ${b.name} (${b.id}) in ${b.locationSlug}`);
    if (b.locationSlug?.toLowerCase().includes("springfield") || b.slug.includes("springfield")) {
      console.log(`Deleting ${b.id}...`);
      await prisma.business.delete({ where: { id: b.id } });
      console.log("Deleted!");
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
