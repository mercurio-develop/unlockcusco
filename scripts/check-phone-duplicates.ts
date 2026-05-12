import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Double Checking WhatsApp Duplicates ===\n")

  const businesses = await prisma.business.findMany({
    select: { id: true, name: true, locationSlug: true, category: true, whatsapp: true }
  })

  const byPhone: Record<string, any[]> = {}
  businesses.forEach(b => {
    if (b.whatsapp && b.whatsapp.length > 5) {
      if (!byPhone[b.whatsapp]) byPhone[b.whatsapp] = []
      byPhone[b.whatsapp].push(b)
    }
  })

  let duplicateCount = 0
  for (const [phone, group] of Object.entries(byPhone)) {
    if (group.length > 1) {
      console.log(`\n📞 Phone: +${phone} is used by ${group.length} listings:`)
      group.forEach(b => console.log(`  - [${b.category}] ${b.name} (Location: ${b.locationSlug}, ID: ${b.id})`))
      duplicateCount++
    }
  }

  if (duplicateCount === 0) {
    console.log("✅ Zero duplicate WhatsApp numbers found! Every number is unique.")
  } else {
    console.log(`\n⚠️ Found ${duplicateCount} phone numbers still shared by multiple listings.`)
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
