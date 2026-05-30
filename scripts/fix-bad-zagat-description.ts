import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Searching for descriptions with meta-commentary...');
  
  const affectedBusinesses = await prisma.business.findMany({
    where: {
      description: {
        contains: 'This description is mixed with French'
      }
    }
  });

  console.log(`Found ${affectedBusinesses.length} affected businesses.`);

  for (const b of affectedBusinesses) {
    console.log(`\nFixing Business: ${b.name}`);
    console.log(`Original: ${b.description}`);
    
    // We only want the actual description part
    // e.g. "This description is mixed with French ('magnifique'). Expect 'grandiose' and 'incredible' 'vistas' from this 'magnificent' experience, offering 'private' guides for a 'great' pace."
    let cleanDesc = b.description.replace(/^This description is mixed with French\s*\([^)]*\)\.\s*/i, '');
    cleanDesc = cleanDesc.replace(/^This description is mixed with French.*?\.\s*/i, '');

    console.log(`Cleaned:  ${cleanDesc}`);

    await prisma.business.update({
      where: { id: b.id },
      data: { description: cleanDesc }
    });
  }

  console.log('\nCleanup complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());