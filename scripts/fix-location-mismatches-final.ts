import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Fixing Final Location Mismatches ===")

  let totalUpdated = 0

  const updates = [
    // Leftover Spas/Massages
    { contains: 'massage center in cusco', newLoc: 'cusco' },
    
    // Trailheads
    { contains: 'maras salt mines trailhead', newLoc: 'maras' },
    
    // All Quad Bikes / ATVs heavily branded with "Cusco" should just go to Cusco
    { contains: 'quad bikes cusco', newLoc: 'cusco' },
    { contains: 'cusco travel agency - atv cusco', newLoc: 'cusco' },
    { contains: 'cusco maras quad', newLoc: 'cusco' },
    { contains: 'atv tour cusco', newLoc: 'cusco' },
    { contains: 'cusco peru quad', newLoc: 'cusco' },
    { contains: 'atv cusco', newLoc: 'cusco' },
    { contains: 'travel agency in cusco - atv', newLoc: 'cusco' },
    { contains: 'cuatrimotos cusco', newLoc: 'cusco' },
    
    // Specific Adventure
    { contains: 'atv tours moray - maras', newLoc: 'maras' }
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

  console.log(`\n=== Done. Total businesses relocated: ${totalUpdated} ===`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
