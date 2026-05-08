import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Searching for Munay Sonqo duplicates...');

  const businesses = await prisma.business.findMany({
    where: {
      name: {
        contains: 'Munay Sonqo'
      }
    }
  });

  console.log(`Found ${businesses.length} records matching 'Munay Sonqo':`);
  for (const b of businesses) {
    console.log(`- ID: ${b.id} | Slug: ${b.slug} | Name: ${b.name}`);
  }

  if (businesses.length > 1) {
    // Keep the first one, delete the rest
    const toDelete = businesses.slice(1);
    for (const b of toDelete) {
      await prisma.business.delete({
        where: { id: b.id }
      });
      console.log(`✅ Deleted duplicate: ID ${b.id} (${b.name})`);
    }
    console.log(`\n🎉 Kept 1 record, deleted ${toDelete.length} duplicates.`);
  } else {
    console.log('\n✅ No duplicates found.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
