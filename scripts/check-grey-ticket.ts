import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const b = await prisma.business.findMany({
    where: { category: { contains: 'tourist ticket', mode: 'insensitive' } }
  })
  console.log("Businesses with tourist ticket in cat:", b.length)

  const tp = await prisma.tourPackage.findMany({
    where: {
      OR: [
        { tags: { contains: 'tourist ticket', mode: 'insensitive' } },
        { packageType: { contains: 'tourist ticket', mode: 'insensitive' } }
      ]
    }
  })
  console.log("Packages with tourist ticket in tags/type:", tp.length)
  tp.forEach(p => console.log(`- ${p.title} | Tags: ${p.tags} | Type: ${p.packageType}`))
}
main().finally(() => prisma.$disconnect())