import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const b = await prisma.business.findMany({
    where: { name: { contains: 'arkana', mode: 'insensitive' } },
    select: { id: true, name: true, locationSlug: true, category: true, reviewsCount: true }
  })
  console.log("Found Arkana businesses:", b.length)
  console.table(b)
}
main().finally(() => prisma.$disconnect())