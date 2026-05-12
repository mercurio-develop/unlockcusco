import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const b = await prisma.business.findMany({
    where: { category: { contains: 'tourist ticket', mode: 'insensitive' } }
  })
  console.log("Businesses with tourist ticket in cat:", b.length)
  b.forEach(b => console.log(`- ${b.name} | Category: ${b.category}`))
  
  await prisma.business.updateMany({
    where: { category: { contains: 'tourist ticket', mode: 'insensitive' } },
    data: { category: 'Boleto' }
  })
  console.log("Converted to Boleto.")
}
main().finally(() => prisma.$disconnect())