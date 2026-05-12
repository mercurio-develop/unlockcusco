import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Hunting SEO Spam (Multi-Location Listings) ===\n")

  const businesses = await prisma.business.findMany({
    select: { id: true, name: true, locationSlug: true, category: true, whatsapp: true }
  })

  // 1. Group by WhatsApp Number (The Ultimate Fingerprint)
  const byPhone: Record<string, any[]> = {}
  businesses.forEach(b => {
    if (b.whatsapp && b.whatsapp.length > 5) {
      if (!byPhone[b.whatsapp]) byPhone[b.whatsapp] = []
      byPhone[b.whatsapp].push(b)
    }
  })

  let phoneSpamCount = 0
  console.log("--- Flagged by Duplicate WhatsApp ---")
  for (const [phone, group] of Object.entries(byPhone)) {
    if (group.length > 1) {
      // Check if they are actually in different locations or just duplicates we missed
      const locations = new Set(group.map(b => b.locationSlug))
      if (locations.size > 1 || group.length > 1) {
        console.log(`\n📞 Phone: +${phone} is used by ${group.length} listings:`)
        group.forEach(b => console.log(`  - [${b.category}] ${b.name} (Location: ${b.locationSlug}, ID: ${b.id})`))
        phoneSpamCount++
      }
    }
  }

  // 2. Group by Exact Normalized Name (Cross-Location)
  const normalize = (name: string) => {
    return name.toLowerCase()
      .replace(/restaurant|cafe|bar|hotel|hostel|hostal|lodge|boutique|spa|massage|tour|tours|agency|travel|trekking/gi, '')
      .replace(/[^a-z0-9]/g, '')
  }

  const byName: Record<string, any[]> = {}
  businesses.forEach(b => {
    const norm = normalize(b.name)
    if (norm.length > 3) {
      if (!byName[norm]) byName[norm] = []
      byName[norm].push(b)
    }
  })

  let nameSpamCount = 0
  console.log("\n--- Flagged by Identical Base Name Across Towns ---")
  for (const [normName, group] of Object.entries(byName)) {
    if (group.length > 1) {
      const locations = new Set(group.map(b => b.locationSlug))
      // Only care if they are spamming MULTIPLE locations
      if (locations.size > 1) {
        console.log(`\n🏢 Base Name: "${normName}" spans ${locations.size} towns:`)
        group.forEach(b => console.log(`  - [${b.category}] ${b.name} (Location: ${b.locationSlug}, ID: ${b.id})`))
        nameSpamCount++
      }
    }
  }

  console.log(`\n=== Summary ===`)
  console.log(`Potential SEO Spam Rings found by Phone: ${phoneSpamCount}`)
  console.log(`Potential SEO Spam Rings found by Name : ${nameSpamCount}`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
