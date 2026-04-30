import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const agency = await prisma.agency.findUnique({
    where: { slug: 'jaguar-llaqta' },
    include: { tourPackages: true }
  });
  console.log(agency ? "FOUND" : "NOT FOUND");
  if (agency) {
    console.log("Contact Phone:", agency.contactPhone);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
