import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^\w\s]/gi, '').trim();
}

function areNamesSimilar(name1: string, name2: string): boolean {
  const n1 = normalizeName(name1);
  const n2 = normalizeName(name2);
  
  if (n1 === n2) return true;
  if (n1.includes(n2) || n2.includes(n1)) return true;
  
  // Check word overlap
  const words1 = n1.split(' ').filter(w => w.length > 2);
  const words2 = n2.split(' ').filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return false;
  
  let overlap = 0;
  for (const w1 of words1) {
    if (words2.includes(w1)) overlap++;
  }
  
  const minWords = Math.min(words1.length, words2.length);
  // If more than 50% of the words in the shorter name are in the longer name
  return overlap >= Math.ceil(minWords * 0.5);
}

async function main() {
  const allBusinesses = await prisma.business.findMany();
  const locationMap = new Map<string, typeof allBusinesses>();

  // Group by location
  for (const b of allBusinesses) {
    if (b.lat === null || b.lng === null) continue;
    const key = `${b.lat},${b.lng}`;
    if (!locationMap.has(key)) {
      locationMap.set(key, []);
    }
    locationMap.get(key)!.push(b);
  }

  const idsToDelete = new Set<string>();

  for (const [key, group] of locationMap.entries()) {
    if (group.length > 1) {
      // Compare each pair in the group
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const b1 = group[i];
          const b2 = group[j];
          
          if (idsToDelete.has(b1.id) || idsToDelete.has(b2.id)) continue;

          if (b1.category === b2.category && areNamesSimilar(b1.name, b2.name)) {
            let toKeep, toDelete;
            
            // Prioritize phone number
            if (b1.whatsapp && !b2.whatsapp) {
              toKeep = b1; toDelete = b2;
            } else if (!b1.whatsapp && b2.whatsapp) {
              toKeep = b2; toDelete = b1;
            } else {
              // Both have or lack phone, prioritize longer name (usually more detailed)
              if (b1.name.length >= b2.name.length) {
                toKeep = b1; toDelete = b2;
              } else {
                toKeep = b2; toDelete = b1;
              }
            }
            
            console.log(`\nPruning duplicate at [${key}]:`);
            console.log(`  KEEPING:  ${toKeep.name} (Phone: ${toKeep.whatsapp || 'N/A'})`);
            console.log(`  DELETING: ${toDelete.name} (Phone: ${toDelete.whatsapp || 'N/A'})`);
            
            idsToDelete.add(toDelete.id);
          }
        }
      }
    }
  }

  if (idsToDelete.size > 0) {
    console.log(`\nDeleting ${idsToDelete.size} redundant records...`);
    const deleteResult = await prisma.business.deleteMany({
      where: {
        id: {
          in: Array.from(idsToDelete)
        }
      }
    });
    console.log(`Successfully deleted ${deleteResult.count} records.`);
  } else {
    console.log("\nNo duplicates found to prune based on name similarity.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });