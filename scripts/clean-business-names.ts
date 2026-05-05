import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up business names with parentheses...')
  
  const businesses = await prisma.business.findMany()
  let updatedCount = 0

  for (const b of businesses) {
    // Check if the name has parentheses at the end, typically containing location info
    if (b.name.includes('(') && b.name.includes(')')) {
      const originalName = b.name
      // Regex to remove anything from '(' to the end of the string, or inside parentheses if it's at the end
      // E.g., "Sumaq Maki Massage & Saunas ( valle sagrado Urubamba )" -> "Sumaq Maki Massage & Saunas"
      const cleanName = b.name.replace(/\s*\([^)]*\)\s*$/, '').trim()
      
      if (cleanName !== originalName && cleanName.length > 0) {
        console.log(`Cleaning: "${originalName}" -> "${cleanName}"`)
        await prisma.business.update({
          where: { id: b.id },
          data: { name: cleanName }
        })
        updatedCount++
      }
    }
  }

  console.log(`\nCleanup complete! Updated ${updatedCount} businesses.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })