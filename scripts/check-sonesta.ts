import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const b = await prisma.business.findMany({
    where: { name: { contains: 'sonesta', mode: 'insensitive' } },
    select: { name: true, locationSlug: true, category: true }
  })
  console.log("Found Sonesta businesses:", b.length)
  b.forEach(x => console.log(x))
}
main().finally(() => prisma.$disconnect())
