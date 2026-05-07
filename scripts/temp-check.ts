import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const taxiTours = await prisma.business.findMany({
    where: {
      category: 'TRANSPORT',
      OR: [
        { name: { contains: 'Tour' } },
        { name: { contains: 'Trek' } },
        { name: { contains: 'Expedition' } },
        { name: { contains: 'Travel' } },
        { name: { contains: 'Agency' } },
        { name: { contains: 'Agencia' } },
      ]
    },
    select: { id: true, name: true, category: true }
  });
  console.log('Transports that are actually agencies/tours:', taxiTours);
}

main().catch(console.error).finally(() => prisma.$disconnect());
