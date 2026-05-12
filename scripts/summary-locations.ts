import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const b = await prisma.business.groupBy({
    by: ['locationSlug', 'category'],
    _count: true
  })
  
  const map: any = {}
  b.forEach(x => {
    if (!map[x.locationSlug]) map[x.locationSlug] = {}
    map[x.locationSlug][x.category] = x._count
  })
  console.table(map)
}
main().finally(() => prisma.$disconnect())
