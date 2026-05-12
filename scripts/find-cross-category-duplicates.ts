import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Finding Cross-Category Duplicates ===")

  const businesses = await prisma.business.findMany({
    select: { id: true, name: true, locationSlug: true, category: true, reviewsCount: true }
  })

  // Normalize names: lowercase, remove non-alphanumeric except spaces, trim multiple spaces
  const normalize = (name: string) => {
    let norm = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    
    // Remove trailing stop words like 'cusco' or 'peru' if they are just tagged on
    norm = norm.replace(/\s+cusco$/, '').replace(/\s+peru$/, '')
    
    return norm;
  }

  const groups: Record<string, any[]> = {}

  businesses.forEach(b => {
    if (!b.locationSlug) return
    const normName = normalize(b.name)
    const key = `${normName}|${b.locationSlug}`
    if (!groups[key]) groups[key] = []
    groups[key].push(b)
  })

  let crossCategoryCount = 0
  let sameCategoryCount = 0

  for (const [key, group] of Object.entries(groups)) {
    if (group.length > 1) {
      // Check if categories differ
      const categories = new Set(group.map(b => b.category))
      
      if (categories.size > 1) {
        console.log(`\n⚠️ Cross-Category Duplicate: "${key.split('|')[0]}" in ${key.split('|')[1].toUpperCase()}`)
        group.forEach(b => console.log(`  - [${b.category}] ${b.name} (ID: ${b.id}, Reviews: ${b.reviewsCount})`))
        crossCategoryCount++
      } else {
        // console.log(`\nDuplicate in SAME Category: "${key.split('|')[0]}" in ${key.split('|')[1].toUpperCase()}`)
        // group.forEach(b => console.log(`  - [${b.category}] ${b.name} (ID: ${b.id}, Reviews: ${b.reviewsCount})`))
        sameCategoryCount++
      }
    }
  }

  console.log(`\n=== Summary ===`)
  console.log(`Cross-Category Duplicates: ${crossCategoryCount}`)
  console.log(`Same-Category Duplicates: ${sameCategoryCount}`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
