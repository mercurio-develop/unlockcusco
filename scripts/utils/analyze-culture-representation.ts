import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Analyzing Culture Businesses & Iconic Places ---');

  // Categories to look at, and explicitly look for iconic places regardless of category
  const targets = await prisma.business.findMany({
    where: {
      OR: [
        { category: { in: ['CULTURE', 'BOLETO', 'MUSEUM', 'Boleto'] } },
        { name: { contains: 'San Pedro', mode: 'insensitive' } },
        { name: { contains: 'San Blas', mode: 'insensitive' } },
        { name: { contains: 'Machu Picchu', mode: 'insensitive' } },
        { name: { contains: 'Qorikancha', mode: 'insensitive' } },
      ]
    },
    select: {
      id: true,
      name: true,
      category: true,
      imageUrl: true,
      description: true,
      descriptionEs: true
    }
  });

  const issues: any[] = [];
  const nameMap = new Map<string, typeof targets>();

  for (const t of targets) {
    const isGenericImage = !t.imageUrl || t.imageUrl.includes('unsplash.com') || t.imageUrl.includes('dummy');
    const isMissingDesc = !t.description || t.description.length < 20;

    if (isGenericImage || isMissingDesc) {
      issues.push({
        id: t.id,
        name: t.name,
        category: t.category,
        issue: [
          isGenericImage ? 'Generic/Missing Image' : null,
          isMissingDesc ? 'Short/Missing Description' : null
        ].filter(Boolean).join(', ')
      });
    }

    const normalizedName = t.name.trim().toLowerCase();
    if (!nameMap.has(normalizedName)) {
      nameMap.set(normalizedName, []);
    }
    nameMap.get(normalizedName)!.push(t);
  }

  console.log(`\nFound ${targets.length} total targets.`);
  
  console.log('\n--- Duplicate Issues ---');
  let duplicateGroups = 0;
  for (const [name, group] of nameMap.entries()) {
    if (group.length > 1) {
      duplicateGroups++;
      console.log(`\nDuplicate Name: [${name}]`);
      group.forEach(b => console.log(`  - ID: ${b.id} | Category: ${b.category}`));
    }
  }

  if (duplicateGroups === 0) console.log('No exact duplicates found.');

  console.log('\n--- Representation Issues (Generic Images or Missing Descriptions) ---');
  if (issues.length === 0) {
    console.log('No issues found!');
  } else {
    issues.forEach(i => {
      console.log(`- [${i.name}] (${i.category}): ${i.issue} (ID: ${i.id})`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
