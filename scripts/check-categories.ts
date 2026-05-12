import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Category Summary ===")
  const categories = await prisma.business.groupBy({
    by: ['category'],
    _count: true
  })
  
  // Sort by count descending
  categories.sort((a, b) => b._count - a._count)
  console.table(categories)

  const targetCategories = ['Culture', 'CULTURE', 'Boleto', 'BOLETO', 'Tourist Ticket']
  
  console.log("\n=== Businesses in Target Categories ===")
  for (const cat of targetCategories) {
    const businesses = await prisma.business.findMany({
      where: { category: cat },
      select: { name: true, locationSlug: true }
    })
    
    if (businesses.length > 0) {
      console.log(`\n--- Category: "${cat}" (${businesses.length} items) ---`)
      businesses.forEach(b => console.log(`- ${b.name} (${b.locationSlug})`))
    }
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
