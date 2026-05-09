import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const biz = await prisma.business.findMany({ 
    where: { category: { in: ['DINING', 'Dining'] } }, 
    select: { name: true, socialLinks: true }
  });
  console.log('Total dining businesses:', biz.length);
  console.log(biz.slice(0, 10));
}
run().finally(() => prisma.$disconnect());
