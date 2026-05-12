import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const boletos = await prisma.business.findMany({
    where: { category: 'Boleto' },
    select: { id: true, name: true, locationSlug: true, reviewsCount: true }
  })

  // Basic normalization
  const groups: Record<string, any[]> = {}
  boletos.forEach(b => {
    // A more aggressive normalization
    const normName = b.name.trim().toLowerCase()
      .replace(/archaeological park|archaeological site|archaeological center|ruins|complex|park|site/g, '')
      .replace(/museo|museum|de sitio|historico|regional|arte|contemporaneo|popular|catacombs|convent|of|san francisco|asís|monastery|santa catalina|siena|pre-columbian/g, '')
      .replace(/[^a-z0-9]/g, '')
    
    // Ignore empty strings after replacing
    const key = normName.length > 2 ? normName : b.name.trim().toLowerCase();
    
    if (!groups[key]) groups[key] = []
    groups[key].push(b)
  })

  console.log("=== Potential Duplicates in Boleto (Aggressive Match) ===")
  Object.keys(groups).forEach(key => {
    if (groups[key].length > 1) {
      console.log(`\nGroup Match: "${key}" (${groups[key].length} occurrences)`)
      groups[key].forEach(b => console.log(`  - ID: ${b.id} | Name: ${b.name} | Loc: ${b.locationSlug} | Reviews: ${b.reviewsCount}`))
    }
  })
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
