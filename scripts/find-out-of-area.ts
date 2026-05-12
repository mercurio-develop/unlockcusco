import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const allowedLocations = [
    'urubamba', 'pisac', 'maras', 'ollantaytambo', 
    'chinchero', 'calca', 'yucay', 'cusco', 'machu-picchu',
    'poroy', 'taray', 'arin'
  ]

  const businesses = await prisma.business.findMany({
    select: { id: true, name: true, locationSlug: true, category: true }
  })

  const locationCounts: Record<string, number> = {}
  const unknownBusinesses: any[] = []

  businesses.forEach(b => {
    const loc = b.locationSlug || '<empty>'
    locationCounts[loc] = (locationCounts[loc] || 0) + 1
    
    if (loc !== '<empty>' && !allowedLocations.includes(loc)) {
      unknownBusinesses.push(b)
    }
  })

  console.log("=== All Locations ===")
  const sortedLocations = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])
  sortedLocations.forEach(([loc, count]) => {
    console.log(`${loc.padEnd(20)}: ${count} businesses`)
  })

  console.log(`\n=== Businesses Outside Sacred Valley/Cusco (${unknownBusinesses.length}) ===`)
  const groupedUnknowns: Record<string, any[]> = {}
  unknownBusinesses.forEach(b => {
    if (!groupedUnknowns[b.locationSlug]) groupedUnknowns[b.locationSlug] = []
    groupedUnknowns[b.locationSlug].push(b)
  })

  Object.entries(groupedUnknowns).forEach(([loc, list]) => {
    console.log(`\nLocation: "${loc}" (${list.length} businesses)`)
    list.forEach(b => console.log(`  - [${b.category}] ${b.name}`))
  })

  // Check for businesses with completely empty locations to see if there are any stragglers
  const emptyLocs = businesses.filter(b => !b.locationSlug)
  if (emptyLocs.length > 0) {
    console.log(`\n=== Businesses with Empty Location (${emptyLocs.length}) ===`)
    emptyLocs.forEach(b => console.log(`  - [${b.category}] ${b.name}`))
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
