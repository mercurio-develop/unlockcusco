import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.savedItinerary.delete({ where: { shortId: 'machu-picchu-day' } }).catch(() => {});
  console.log("Removed machu-picchu-day");
}
main().finally(() => prisma.$disconnect());
