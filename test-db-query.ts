import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const id = '65ea3319-2b51-4067-b431-8d556217537d'; // Kampu
  const tp = await prisma.tourPackage.findUnique({ where: { id } })
  console.log("TourPackage:", tp?.id)
  const b = await prisma.business.findUnique({ where: { id } })
  console.log("Business:", b?.id)
}
main().finally(() => prisma.$disconnect())
