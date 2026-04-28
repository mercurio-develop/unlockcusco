import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const businesses = await prisma.business.findMany()
  
  let updated = 0
  for (const b of businesses) {
    let baseSlug = b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    baseSlug = baseSlug.replace(/^-|-$/g, '')
    
    // Append the first 6 chars of the UUID to ensure absolute uniqueness for the slug
    const uniqueSuffix = b.id.substring(0, 6)
    const fullSlug = `${baseSlug}-${b.locationSlug || 'valley'}-${uniqueSuffix}`
    
    await prisma.business.update({
      where: { id: b.id },
      data: { slug: fullSlug }
    })
    updated++
  }
  
  console.log(`✅ Generated guaranteed unique slugs for ${updated} businesses`)
}

main().catch(console.error).finally(() => prisma.$disconnect())