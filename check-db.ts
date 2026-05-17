import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const targets = ["Sacred dreams lodge", "Sol y Luna"];
  for (const t of targets) {
    const b = await prisma.business.findFirst({
      where: { name: { contains: t, mode: 'insensitive' } }
    });
    if (b) {
      console.log(`Name: ${b.name}`);
      console.log(`Description length: ${b.description?.length}`);
      console.log(`Description: "${b.description}"`);
    } else {
      console.log(`Could not find: ${t}`);
    }
  }
}
main().finally(() => prisma.$disconnect());
