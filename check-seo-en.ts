import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const businesses = await prisma.business.findMany({
    where: {
      seoMetaTitle: { not: null },
      seoMetaDesc: { not: null }
    },
    select: {
      name: true,
      seoMetaTitle: true,
      seoMetaDesc: true,
    },
    take: 3
  })
  
  const missingCount = await prisma.business.count({
    where: {
      OR: [
        { seoMetaTitle: null },
        { seoMetaTitle: "" }
      ]
    }
  })
  
  const filledCount = await prisma.business.count({
    where: {
      NOT: [
        { seoMetaTitle: null },
        { seoMetaTitle: "" }
      ]
    }
  })
  
  console.log(`Filled English SEO records: ${filledCount}`);
  console.log(`Missing English SEO records: ${missingCount}`);
  console.log("\nSample English SEO data:");
  console.log(JSON.stringify(businesses, null, 2))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
