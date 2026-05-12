import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const idsToDelete = []

  const boletos = await prisma.business.findMany({ where: { category: 'Boleto' } })
  const map: Record<string, string> = {}
  boletos.forEach(b => map[b.name] = b.id)

  // Moray
  if (map['Moray Archaeological Zone'] && map['Moray']) {
    idsToDelete.push(map['Moray']) // Keep the one with Zone as it likely has more reviews
  }
  
  // Q'enqo
  if (map["Q'enqo Archaeological Complex"] && map["Q'enqo"]) {
    idsToDelete.push(map["Q'enqo"])
  }
  
  // Saqsaywaman / Sacsayhuaman
  if (map['Sacsayhuaman'] && map['Saqsaywaman']) {
    idsToDelete.push(map['Saqsaywaman']) // Keep standard spelling
  }
  
  // Tipon
  if (map['Tipón Archaeological Park'] && map['Tipon']) {
    idsToDelete.push(map['Tipon'])
  }
  
  // Pikillaqta
  if (map['Pikillacta Archaeological Park'] && map['Pikillaqta']) {
    idsToDelete.push(map['Pikillaqta'])
  }
  
  if (idsToDelete.length > 0) {
    const result = await prisma.business.deleteMany({
      where: { id: { in: idsToDelete } }
    })
    console.log(`Deleted ${result.count} slight variation duplicates.`)
  } else {
    console.log("No slight variations found to delete.")
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
