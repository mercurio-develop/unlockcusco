import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const total = await prisma.business.count()
  console.log(`Total businesses in database: ${total}`)

  const byCategory = await prisma.business.groupBy({
    by: ['category'],
    _count: true
  })
  
  byCategory.sort((a, b) => b._count - a._count)
  
  console.log("\nBreakdown by category:")
  byCategory.forEach(cat => {
    console.log(`- ${cat.category.padEnd(12)}: ${cat._count}`)
  })
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
