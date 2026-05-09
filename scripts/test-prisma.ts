import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const q = "KAa"
  const isHeuristicMatch = false
  let targetCategory = ""

  const whereClause: any = {
    category: { notIn: ['AGENCY', 'Agency', 'agency'] }
  }

  const orConditions: any[] = []

  if (q && !isHeuristicMatch) {
     const titleCase = q.charAt(0).toUpperCase() + q.slice(1).toLowerCase();
     orConditions.push({ name: { contains: q } })
     orConditions.push({ name: { contains: q.toLowerCase() } })
     orConditions.push({ name: { contains: titleCase } })
     orConditions.push({ name: { contains: q.toUpperCase() } })
     orConditions.push({ category: { contains: q } })
     orConditions.push({ description: { contains: q } })
     orConditions.push({ description: { contains: q.toLowerCase() } })
     orConditions.push({ description: { contains: titleCase } })
  }

  if (orConditions.length > 0) {
    whereClause.OR = orConditions
  }

  try {
    console.log("Fetching businesses...")
    const businesses = await prisma.business.findMany({
      where: whereClause,
    })
    console.log("Found", businesses.length)

    const countWhereClause = { ...whereClause }
    delete countWhereClause.category

    console.log("Counting categories...", countWhereClause)
    const counts = await prisma.business.groupBy({
      by: ['category'],
      where: countWhereClause,
      _count: {
        _all: true
      }
    })
    console.log("Counts", counts)
  } catch (error) {
    console.error("Prisma Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
