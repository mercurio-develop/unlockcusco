import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

const TOWNS = [
  { slug: 'urubamba',      lat: -13.3047, lng: -72.1167 },
  { slug: 'pisac',         lat: -13.2995, lng: -71.8480 },
  { slug: 'ollantaytambo', lat: -13.2570, lng: -72.2630 },
  { slug: 'chinchero',     lat: -13.3864, lng: -72.0428 },
  { slug: 'maras',         lat: -13.3350, lng: -72.1600 },
  { slug: 'yucay',         lat: -13.3120, lng: -72.0930 },
  { slug: 'calca',         lat: -13.3342, lng: -71.9539 },
  { slug: 'cusco',         lat: -13.5317, lng: -71.9675 },
]

function locationSlug(lat: number, lng: number): string {
  let closest = TOWNS[0]
  let minDist = Infinity
  for (const t of TOWNS) {
    const d = Math.sqrt((lat - t.lat) ** 2 + (lng - t.lng) ** 2)
    if (d < minDist) { minDist = d; closest = t }
  }
  return closest.slug
}

function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
}

async function main() {
  const businesses = await prisma.business.findMany({
    select: { id: true, lat: true, lng: true, category: true }
  })

  let updated = 0
  for (const b of businesses) {
    const locSlug = locationSlug(b.lat, b.lng)
    const catSlug = categorySlug(b.category)
    await prisma.business.update({
      where: { id: b.id },
      data: { locationSlug: locSlug, categorySlug: catSlug }
    })
    updated++
  }

  console.log(`✅ Slugs set on ${updated} businesses`)

  // Print the unique combinations for reference
  const combos = await prisma.business.groupBy({
    by: ['locationSlug', 'categorySlug'],
    _count: true,
    orderBy: [{ locationSlug: 'asc' }, { categorySlug: 'asc' }]
  })
  console.log(`\n${combos.length} unique pSEO routes:`)
  combos.forEach(c => console.log(`  /explore/${c.locationSlug}/${c.categorySlug} (${c._count})`))
}

main().catch(console.error).finally(() => prisma.$disconnect())
