import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const businesses = await prisma.business.findMany({
    select: { id: true, name: true, locationSlug: true, category: true, description: true }
  })
  
  console.log(JSON.stringify(businesses, null, 2))
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
