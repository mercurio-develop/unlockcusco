import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Unifying database categories...')
  
  // Mapping of old/mismatched categories to the standard ones
  const categoryMap: Record<string, string> = {
    'AVENTURA': 'ADVENTURE',
    'CULTURA': 'CULTURE',
    'MUSEUM': 'CULTURE',
    'BIENESTAR': 'WELLNESS',
    'THERAPY': 'WELLNESS',
    'THERAPIST': 'WELLNESS',
    'DESCANSO': 'STAYS', // These are mostly retreats/lodging
    'Stays': 'STAYS',
    'Dining': 'DINING',
    'TAXI': 'TRANSPORT', // Standardizing on Transport
  }

  let totalUpdated = 0

  for (const [oldCat, newCat] of Object.entries(categoryMap)) {
    const result = await prisma.business.updateMany({
      where: { category: oldCat },
      data: { category: newCat }
    })
    
    if (result.count > 0) {
      console.log(`Mapped ${result.count} businesses from "${oldCat}" to "${newCat}"`)
      totalUpdated += result.count
    }
  }

  // Double check everything is uppercase
  const allCats = ['ADVENTURE', 'CULTURE', 'WELLNESS', 'STAYS', 'DINING', 'BOLETO', 'AGENCY', 'GUIDE', 'TRANSPORT']
  
  const businesses = await prisma.business.findMany()
  for (const b of businesses) {
    if (b.category && b.category !== b.category.toUpperCase() && !categoryMap[b.category]) {
      const upperCat = b.category.toUpperCase()
      console.log(`Uppercasing "${b.category}" -> "${upperCat}" for ${b.name}`)
      await prisma.business.update({
        where: { id: b.id },
        data: { category: upperCat }
      })
      totalUpdated++
    }
  }

  console.log(`\nCategory Unification complete! Updated ${totalUpdated} businesses.`)

  // Show final distribution
  console.log('\nFinal Category Distribution:')
  const distribution = await prisma.business.groupBy({
    by: ['category'],
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        category: 'desc'
      }
    }
  })
  
  for (const group of distribution) {
    console.log(`${group.category}: ${group._count._all}`)
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
