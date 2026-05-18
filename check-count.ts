import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const total = await prisma.business.count();
  const withEs = await prisma.business.count({ where: { descriptionEs: { not: null } } });
  console.log(`Total: ${total}, With ES: ${withEs}`);
}
main().finally(() => prisma.$disconnect());
