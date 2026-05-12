import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Resolving All Duplicates (Cross-Category & Same-Category) ===")

  const businesses = await prisma.business.findMany({
    select: { id: true, name: true, locationSlug: true, category: true, reviewsCount: true }
  })

  // Normalize names: lowercase, remove non-alphanumeric except spaces, trim multiple spaces
  const normalize = (name: string) => {
    let norm = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
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

  let deletedCount = 0
  
  // Category priority (lower index = better). We prefer specific categories over generic ones like 'Culture' or 'Agency'
  const categoryPriority = ['Boleto', 'Spiritual', 'Adventure', 'Dining', 'Wellness', 'Stays', 'Textiles', 'Culture', 'Agency', 'Transport']

  for (const [key, group] of Object.entries(groups)) {
    if (group.length > 1) {
      
      // Sort the group to find the "best" keeper. 
      // Primary sort: Category Priority. Secondary sort: Reviews Count (descending).
      group.sort((a, b) => {
        const priorityA = categoryPriority.indexOf(a.category) !== -1 ? categoryPriority.indexOf(a.category) : 99
        const priorityB = categoryPriority.indexOf(b.category) !== -1 ? categoryPriority.indexOf(b.category) : 99
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB // lower number comes first
        }
        
        return b.reviewsCount - a.reviewsCount // more reviews comes first
      })
      
      const keeper = group[0]
      const toDelete = group.slice(1)
      
      for (const dupe of toDelete) {
        await prisma.business.delete({ where: { id: dupe.id } })
        deletedCount++
      }
      
      console.log(`Resolved "${key}": Kept ID ${keeper.id} [${keeper.category}] with ${keeper.reviewsCount} reviews. Deleted ${toDelete.length} duplicates.`)
    }
  }

  console.log(`\n=== Done. Completely purged ${deletedCount} lingering duplicates across all categories. ===`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
