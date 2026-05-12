import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Resolving SEO Spam (Phone-Based Deduplication) ===")

  const businesses = await prisma.business.findMany({
    select: { id: true, name: true, locationSlug: true, category: true, whatsapp: true, reviewsCount: true }
  })

  // Group by WhatsApp Number
  const byPhone: Record<string, any[]> = {}
  businesses.forEach(b => {
    if (b.whatsapp && b.whatsapp.length > 5) {
      if (!byPhone[b.whatsapp]) byPhone[b.whatsapp] = []
      byPhone[b.whatsapp].push(b)
    }
  })

  let deletedCount = 0

  for (const [phone, group] of Object.entries(byPhone)) {
    if (group.length > 1) {
      // Sort by reviews descending to find the primary business
      group.sort((a, b) => b.reviewsCount - a.reviewsCount)
      
      const keeper = group[0]
      const toDelete = group.slice(1)
      
      console.log(`\n📞 Resolving +${phone}:`)
      console.log(`  ✅ Keeping: [${keeper.category}] ${keeper.name} (${keeper.locationSlug}, Reviews: ${keeper.reviewsCount})`)
      
      for (const dupe of toDelete) {
        console.log(`  ❌ Deleting: [${dupe.category}] ${dupe.name} (${dupe.locationSlug}, Reviews: ${dupe.reviewsCount})`)
        await prisma.business.delete({ where: { id: dupe.id } })
        deletedCount++
      }
    }
  }

  // Also clean up the one name-based cross-location issue we saw: "yaku"
  // Yaku Restaurant vs Yaku SPA. These are probably different (Restaurant vs Spa), but if they are the exact same, 
  // we could delete. We will skip Yaku for now as one is Dining and one is Wellness.

  console.log(`\n=== Done. Purged ${deletedCount} SEO spam / duplicate listings. ===`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
