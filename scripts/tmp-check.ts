import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const b = await prisma.business.findMany({
    take: 10,
    select: { name: true, description: true, longDescription: true }
  });
  console.log(b);
}
main().finally(() => prisma.$disconnect());