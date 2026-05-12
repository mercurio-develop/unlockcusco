import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Category Full Casing Cleanup ===")

  const mappings = {
    'DINING': 'Dining',
    'STAYS': 'Stays',
    'AGENCY': 'Agency',
    'ADVENTURE': 'Adventure',
    'WELLNESS': 'Wellness',
    'TRANSPORT': 'Transport',
    'TEXTILES': 'Textiles',
    'EXPERIENCE': 'Experience',
    'BOLETO': 'Boleto',
    'CULTURE': 'Culture'
  };

  for (const [oldCat, newCat] of Object.entries(mappings)) {
    const updated = await prisma.business.updateMany({
      where: { category: oldCat },
      data: { category: newCat }
    })
    if (updated.count > 0) {
      console.log(`Updated ${updated.count} businesses from "${oldCat}" to "${newCat}"`)
    }
  }

  // Also check TourPackage types just in case
  const updatedPkgs = await prisma.tourPackage.updateMany({
    where: { packageType: 'SINGLE_DAY' },
    data: { packageType: 'SINGLE_DAY' } // Just a placeholder, TourPackages might not have a direct category field, they are EXPERIENCES implicitly usually
  })
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
