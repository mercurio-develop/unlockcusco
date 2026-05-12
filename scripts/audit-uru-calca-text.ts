import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Auditing Urubamba businesses for Calca references ===")
  const urubambaBiz = await prisma.business.findMany({
    where: { locationSlug: 'urubamba' },
    select: { id: true, name: true, category: true, description: true }
  })

  let count = 0;
  for (const b of urubambaBiz) {
    const text = (b.name + " " + b.description).toLowerCase()
    if (text.includes('calca')) {
      console.log(`- [${b.category}] ${b.name}\n  Desc: ${b.description.substring(0, 100)}...`)
      count++;
    }
  }
  console.log(`\nFound ${count} businesses in Urubamba mentioning Calca.`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
