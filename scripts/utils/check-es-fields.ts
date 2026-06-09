import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const businesses = await prisma.business.findMany({
    where: { descriptionEs: { not: null } },
    select: { id: true, name: true, description: true, descriptionEs: true },
    take: 5
  });
  console.log(JSON.stringify(businesses, null, 2));
}
main().finally(() => prisma.$disconnect());
