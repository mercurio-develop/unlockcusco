import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const agency = await prisma.business.findUnique({
    where: { slug: 'jaguar-llaqta' },
    include: { tourPackages: true }
  });
  console.log(agency ? "FOUND" : "NOT FOUND");
  if (agency) {
    console.log("WhatsApp:", agency.whatsapp);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
