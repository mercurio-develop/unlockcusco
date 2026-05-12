import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const businesses = await prisma.business.findMany({
    select: { id: true, name: true, locationSlug: true }
  })

  const towns = [
    'cusco', 'urubamba', 'pisac', 'ollantaytambo', 
    'machu picchu', 'machupicchu', 'calca', 'chinchero', 
    'maras', 'yucay'
  ]

  const mismatches: any[] = []

  for (const b of businesses) {
    const slug = b.locationSlug?.toLowerCase() || ''
    const nameLower = b.name.toLowerCase()

    // Find all towns mentioned in the name
    const mentionedTowns = towns.filter(town => {
      // Create a word boundary regex to avoid partial matches
      const regex = new RegExp(`\\b${town}\\b`)
      return regex.test(nameLower)
    })

    if (mentionedTowns.length > 0) {
      // If the slug is NOT in the mentioned towns, and we have a clear single town mentioned, it's a mismatch
      // Handle machu picchu variation
      const mappedSlug = slug === 'machu-picchu' ? 'machu picchu' : slug

      if (!mentionedTowns.includes(mappedSlug) && !(mappedSlug === 'machu picchu' && mentionedTowns.includes('machupicchu'))) {
        mismatches.push({
          id: b.id,
          name: b.name,
          currentSlug: slug,
          suggestedTowns: mentionedTowns
        })
      }
    }
  }

  console.log(`=== Found ${mismatches.length} obvious location mismatches ===\n`)
  
  // Group by current slug for easier reading
  const grouped: Record<string, any[]> = {}
  mismatches.forEach(m => {
    if (!grouped[m.currentSlug]) grouped[m.currentSlug] = []
    grouped[m.currentSlug].push(m)
  })

  Object.entries(grouped).forEach(([slug, list]) => {
    console.log(`\nCurrently in [${slug.toUpperCase()}] but names say otherwise:`)
    list.forEach(m => {
      console.log(`  - ${m.name} --> Suggestion: ${m.suggestedTowns.join(', ')}`)
    })
  })
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
