import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("=== Finding Cross-Location Duplicates ===")
  const businesses = await prisma.business.findMany({
    select: { id: true, name: true, locationSlug: true, category: true, reviewsCount: true }
  })

  // Group by reviews count (if > 0)
  const byReviews: Record<number, any[]> = {}
  businesses.forEach(b => {
    if (b.reviewsCount > 0) {
      if (!byReviews[b.reviewsCount]) byReviews[b.reviewsCount] = []
      byReviews[b.reviewsCount].push(b)
    }
  })

  let suspiciousCount = 0

  for (const [countStr, group] of Object.entries(byReviews)) {
    if (group.length > 1) {
      // Check if they share similar names
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const b1 = group[i]
          const b2 = group[j]

          const name1 = b1.name.toLowerCase().split(' ')[0]
          const name2 = b2.name.toLowerCase().split(' ')[0]

          if (name1 === name2 && name1.length > 3) {
            console.log(`\n⚠️ Suspicious Cross-Location Duplicate (${countStr} reviews):`)
            console.log(`  - [${b1.category}] ${b1.name} (Loc: ${b1.locationSlug}, ID: ${b1.id})`)
            console.log(`  - [${b2.category}] ${b2.name} (Loc: ${b2.locationSlug}, ID: ${b2.id})`)
            suspiciousCount++
          }
        }
      }
    }
  }
  
  // Also check exact names across locations regardless of reviews
  const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const byName: Record<string, any[]> = {}
  businesses.forEach(b => {
    const n = normalize(b.name)
    if (!byName[n]) byName[n] = []
    byName[n].push(b)
  })

  for (const [name, group] of Object.entries(byName)) {
    if (group.length > 1) {
      const locs = new Set(group.map(b => b.locationSlug))
      if (locs.size > 1) {
        console.log(`\n⚠️ Exact Name Cross-Location Duplicate:`)
        group.forEach(b => console.log(`  - [${b.category}] ${b.name} (Loc: ${b.locationSlug}, Reviews: ${b.reviewsCount}, ID: ${b.id})`))
      }
    }
  }
}

main().finally(() => prisma.$disconnect())
