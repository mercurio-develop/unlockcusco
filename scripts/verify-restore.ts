import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const count = await prisma.business.count();
  console.log(`Total businesses: ${count}`);
  const tdi = await prisma.business.findMany({ where: { name: { contains: 'tambo del inka', mode: 'insensitive' } } });
  console.log("Tambo del inka results:");
  tdi.forEach(b => console.log(`- ${b.name} (${b.locationSlug}, lat: ${b.lat}, lng: ${b.lng})`));
}
main().finally(() => prisma.$disconnect());
