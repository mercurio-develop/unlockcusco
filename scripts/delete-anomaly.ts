import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const id = "cmp2bdz0e000bml8gwwbeqc8b";
  console.log(`Deleting anomaly 'Café Cusco' with ID ${id}...`);
  await prisma.business.delete({ where: { id } });
  console.log("Deleted successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
