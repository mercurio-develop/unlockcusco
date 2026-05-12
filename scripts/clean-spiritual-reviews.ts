import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Review-Based Spiritual Category Cleanup ===")

  const spiritualBiz = await prisma.business.findMany({
    where: { category: 'Spiritual' },
    include: { reviews: true }
  })

  let movedCount = 0

  for (const b of spiritualBiz) {
    const textData = [
      b.name,
      b.description || '',
      b.tagline || '',
      ...b.reviews.map(r => r.text)
    ].join(' ').toLowerCase()

    let newCategory = null
    let reason = ''

    // 1. Historic / Ruins / Archaeological
    if (b.name.toLowerCase().includes('historic sanctuary') || b.name.toLowerCase().includes('ruins')) {
      newCategory = 'Culture' // Based on our previous decision for Machu Picchu etc.
      reason = 'Contains "historic sanctuary" or "ruins" in name'
    }
    // 2. Animal Sanctuaries
    else if (textData.includes('animal') || textData.includes('alpaca') || textData.includes('llama') || textData.includes('rescue')) {
      // Make sure it doesn't also heavily mention spiritual terms, just in case a retreat has llamas
      const spiritualTerms = ['ayahuasca', 'yoga', 'shaman', 'san pedro', 'retreat']
      const hasSpiritual = spiritualTerms.some(term => textData.includes(term))
      
      if (!hasSpiritual) {
        newCategory = 'Culture'
        reason = 'Heavy animal/rescue mentions in reviews without spiritual keywords'
      }
    }
    // 3. Spas/Massages that got swept up
    else if (textData.includes('massage') || textData.includes('spa') || textData.includes('facial')) {
      const spiritualTerms = ['ayahuasca', 'yoga', 'shaman', 'san pedro', 'retreat', 'ashram']
      const hasSpiritual = spiritualTerms.some(term => textData.includes(term))
      
      if (!hasSpiritual) {
        newCategory = 'Wellness'
        reason = 'Heavy massage/spa mentions in reviews without deep spiritual keywords'
      }
    }
    // 4. Tour Agencies that got swept up
    else if (b.name.toLowerCase().includes('tours') || b.name.toLowerCase().includes('expeditions')) {
        newCategory = 'Agency'
        reason = 'Name indicates a tour agency'
    }

    if (newCategory) {
      await prisma.business.update({
        where: { id: b.id },
        data: { category: newCategory }
      })
      console.log(`Moved: "${b.name}" -> ${newCategory}`)
      console.log(`  Reason: ${reason}`)
      movedCount++
    }
  }

  console.log(`\n=== Done. Moved ${movedCount} false positives out of Spiritual. ===`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
