import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Fixing Programmatic Location Mismatches ===")

  let totalUpdated = 0

  const updates = [
    // 1. Specific Town Fixes
    { contains: 'yucay', newLoc: 'yucay' },
    { contains: 'pisac market', newLoc: 'pisac' },
    { contains: 'maska-pisac', newLoc: 'pisac' },
    { contains: 'ollantaytambo archaeological site', newLoc: 'ollantaytambo' },
    { contains: 'chinchero - urquillos', newLoc: 'chinchero' },
    { contains: 'taxi ollantaytambo', newLoc: 'ollantaytambo' },
    { contains: 'taxi machupicchu', newLoc: 'machu-picchu' },
    { contains: 'taxi urubamba', newLoc: 'urubamba' },
    
    // 2. Cusco Businesses (Hostels, Spas, Galleries) misplaced in towns
    { contains: 'hostel cusco', newLoc: 'cusco' },
    { contains: 'hostel, cusco', newLoc: 'cusco' },
    { contains: 'cusco dorms', newLoc: 'cusco' },
    { contains: 'wild rover cusco', newLoc: 'cusco' },
    { contains: 'spa cusco', newLoc: 'cusco' },
    { contains: 'massage cusco', newLoc: 'cusco' },
    { contains: 'cusco massages', newLoc: 'cusco' },
    { contains: 'cusco art gallery', newLoc: 'cusco' },
    { contains: 'fine art cusco', newLoc: 'cusco' },
    { contains: 'ayahuasca spiritual center cusco', newLoc: 'cusco' },
    { contains: 'yoga cultural center cusco', newLoc: 'cusco' },
    { contains: 'coffee community - cusco', newLoc: 'cusco' },
    
    // 3. Tour Operators heavily branded as "Cusco ATV" or "Cusco Quad Bikes"
    { contains: 'cusco atv', newLoc: 'cusco' },
    { contains: 'cusco quad bike', newLoc: 'cusco' },
    { contains: 'cusco andean hike', newLoc: 'cusco' },
    { contains: 'inca trail from cusco', newLoc: 'cusco' },
    { contains: 'spiritual tours cusco', newLoc: 'cusco' }
  ]

  for (const rule of updates) {
    const result = await prisma.business.updateMany({
      where: {
        name: { contains: rule.contains, mode: 'insensitive' },
        locationSlug: { not: rule.newLoc }
      },
      data: {
        locationSlug: rule.newLoc
      }
    })
    
    if (result.count > 0) {
      console.log(`Moved ${result.count} businesses containing "${rule.contains}" to ${rule.newLoc}`)
      totalUpdated += result.count
    }
  }

  // 4. Special cases for Machu Picchu agencies/expeditions that are likely based in Cusco
  const mpAgencies = await prisma.business.updateMany({
    where: {
      category: 'Agency',
      OR: [
        { name: { contains: 'machu picchu', mode: 'insensitive' } },
        { name: { contains: 'machupicchu', mode: 'insensitive' } }
      ],
      locationSlug: { not: 'cusco' }
    },
    data: { locationSlug: 'cusco' }
  })
  
  if (mpAgencies.count > 0) {
    console.log(`Moved ${mpAgencies.count} Machu Picchu-named Agencies to Cusco (operating base)`)
    totalUpdated += mpAgencies.count
  }

  console.log(`\n=== Done. Total businesses relocated: ${totalUpdated} ===`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
