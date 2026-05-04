import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const b = await prisma.business.findFirst({ where: { heroImages: { not: "[]" } } });
  console.log(b?.heroImages);
}
main().finally(() => prisma.$disconnect());
