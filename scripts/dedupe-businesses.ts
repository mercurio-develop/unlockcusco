import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Auto-Merge Exact Duplicates ===")
  
  // We'll target the Boleto category where the duplication is most obvious, 
  // but this logic works for any exact name + location match.
  const allBusinesses = await prisma.business.findMany({
    where: { category: 'Boleto' }, // Restricting to Boleto to be safe, as requested by the specific problem
    select: { id: true, name: true, locationSlug: true, reviewsCount: true, category: true }
  })

  // Group by a normalization key: lowercased name + location
  const groups: Record<string, any[]> = {}
  allBusinesses.forEach(b => {
    // Basic normalization: remove trailing spaces and lowercase
    const normName = b.name.trim().toLowerCase()
      .replace(/\s+of\s+\(cusco\)$/i, '') // Fix some weird scraper artifacts like "Palace of (cusco)"
      .replace(/\s+of\s+cusco$/i, '')
      .replace(/\s+in\s+cusco$/i, '')
    const key = `${normName}|${b.locationSlug}`
    if (!groups[key]) groups[key] = []
    groups[key].push(b)
  })

  let deletedCount = 0

  for (const [key, group] of Object.entries(groups)) {
    if (group.length > 1) {
      console.log(`\nFound Duplicate Group: ${key} (${group.length} items)`)
      
      // Sort so the one with the most reviews is first
      group.sort((a, b) => b.reviewsCount - a.reviewsCount)
      
      const keeper = group[0]
      const toDelete = group.slice(1)
      
      console.log(`  Keeping: ${keeper.id} (${keeper.reviewsCount} reviews)`)
      
      for (const dupe of toDelete) {
        console.log(`  Deleting: ${dupe.id} (${dupe.reviewsCount} reviews)`)
        await prisma.business.delete({ where: { id: dupe.id } })
        deletedCount++
      }
    }
  }

  console.log(`\n=== Deduplication Complete. Deleted ${deletedCount} duplicates. ===`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
