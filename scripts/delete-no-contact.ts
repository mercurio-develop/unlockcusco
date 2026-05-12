import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Auditing Businesses Without WhatsApp/Phone ===")

  const businessesWithoutContact = await prisma.business.findMany({
    where: {
      OR: [
        { whatsapp: null },
        { whatsapp: "" }
      ],
      // We explicitly DO NOT delete government sites, landmarks, or templates which naturally lack phone numbers
      category: { notIn: ['Boleto', 'Template'] } 
    },
    select: { id: true, name: true, category: true, locationSlug: true }
  })

  console.log(`Found ${businessesWithoutContact.length} businesses without a WhatsApp number.`)
  
  if (businessesWithoutContact.length > 0) {
    const byCategory = businessesWithoutContact.reduce((acc: any, b) => {
      acc[b.category] = (acc[b.category] || 0) + 1;
      return acc;
    }, {});
    console.log("Breakdown of businesses without contact info by category:", byCategory);

    // Filter out some "Culture" items that might be physical landmarks (plazas, statues)
    const toDelete = businessesWithoutContact.filter(b => {
      if (b.category === 'Culture') {
        const n = b.name.toLowerCase();
        if (n.includes('square') || n.includes('plaza') || n.includes('statue') || n.includes('monument') || n.includes('historic') || n.includes('site') || n.includes('church') || n.includes('temple')) {
          return false; // Keep landmarks
        }
      }
      return true;
    });

    console.log(`Will delete ${toDelete.length} actual businesses that are missing contact info...`);

    const result = await prisma.business.deleteMany({
      where: {
        id: { in: toDelete.map(b => b.id) }
      }
    })
    
    console.log(`\nDeleted ${result.count} unverified businesses without contact info.`)
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
