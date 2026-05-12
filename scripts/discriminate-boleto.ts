import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Discriminate Boleto vs Culture ===")

  const officialBoletoKeywords = [
    'Sacsayhuaman', 'Saqsaywaman',
    "Q'enqo",
    'Puka Pukara', 'Puca Pucara',
    'Tambomachay',
    'Pisac Ruins', 'Pisac Archaeological Park',
    'Ollantaytambo Ruins', 'Archaeological Site of Ollantaytambo',
    'Chinchero Ruins', 'Chinchero Archaeological Center',
    'Moray',
    'Tipon', 'Tipón',
    'Pikillaqta', 'Pikillacta',
    'Qorikancha Site Museum', 'Museo de Sitio de Qorikancha', // Important: The museum, not the temple itself, though we'll keep both if ambiguous
    'Museo Historico Regional', 'Regional Historical Museum',
    'Museo de Arte Contemporaneo', 'Contemporary Art Museum',
    'Monumento a Pachacutec', 'Pachacutec Monument',
    'Museo de Arte Popular', 'Popular Art Museum',
    'Centro Qosqo de Arte Nativo', 'Qosqo Center of Native Art',
    'COSITUC' // Ticket office
  ]

  // Find all current Boleto items
  const allBoletos = await prisma.business.findMany({
    where: { category: 'Boleto' },
    select: { id: true, name: true, locationSlug: true }
  })

  let keptCount = 0
  let movedCount = 0

  for (const b of allBoletos) {
    // Check if it matches any official keyword
    const isOfficial = officialBoletoKeywords.some(keyword => 
      b.name.toLowerCase().includes(keyword.toLowerCase())
    )

    if (isOfficial) {
      keptCount++
    } else {
      // It's an unofficial site or a private museum/ruin (like Machu Picchu or Inkariy)
      await prisma.business.update({
        where: { id: b.id },
        data: { category: 'Culture' }
      })
      movedCount++
      console.log(`Moved to Culture: ${b.name} (${b.locationSlug})`)
    }
  }

  console.log(`\n=== Done. Kept ${keptCount} official Boleto sites. Moved ${movedCount} to Culture. ===`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
