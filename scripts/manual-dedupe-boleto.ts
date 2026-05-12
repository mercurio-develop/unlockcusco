import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Manual Boleto Deduplication ===")

  // Define the IDs to DELETE
  const idsToDelete = [
    // Moray (keep urubamba one cmp1sg64b007yml2i95skkunf)
    'cmp1pqhc0000tml2iyg8y5g2t', 
    
    // Puka Pukara (keep cusco one cmp1prcx70011ml2i1hryke2u)
    'cmp1t50au009oml2i844gei3i', 
    '62c5ebf7-3c15-45b2-8c4f-d2668d386b2f',
    
    // Ollantaytambo (keep cmp1tt5j300b2ml2iropwibzq)
    '942510ae-5c70-4c5d-a0d0-87a124174738',
    
    // Pisac (keep cmp1ri572004pml2i14g8bu2r)
    'e682c37c-5372-424a-8495-5d18f521d7fd',
    
    // Chinchero (keep cmp1sg1n9007wml2itcsyywl4)
    '9c686c56-840f-4876-b42b-897bc97f949e'
  ]

  const result = await prisma.business.deleteMany({
    where: {
      id: { in: idsToDelete }
    }
  })

  console.log(`Deleted ${result.count} duplicate Boleto sites.`)
  
  // Also, let's fix the location slugs for some of these major ones if they are slightly off
  // Moray is in Maras
  await prisma.business.update({
    where: { id: 'cmp1sg64b007yml2i95skkunf' },
    data: { locationSlug: 'maras' }
  })
  
  // Chinchero is in Chinchero, not urubamba
  await prisma.business.update({
    where: { id: 'cmp1sg1n9007wml2itcsyywl4' },
    data: { locationSlug: 'chinchero' }
  })

  console.log("Updated location slugs for Moray and Chinchero to their proper towns.")
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
