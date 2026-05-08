import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🔍 Starting Category Overlap Analysis...");

  const agencies = await prisma.business.findMany({
    where: { category: 'AGENCY' },
    select: { name: true, description: true }
  });

  const adventures = await prisma.business.findMany({
    where: { category: 'ADVENTURE' },
    select: { name: true, description: true }
  });

  console.log(`\n📊 Database Totals:`);
  console.log(`- AGENCY: ${agencies.length} businesses`);
  console.log(`- ADVENTURE: ${adventures.length} businesses`);

  const adventureKeywords = ['atv', 'cuatrimoto', 'hike', 'hiking', 'trek', 'caminata', 'rafting', 'zip', 'horse', 'caballo', 'aventura', 'adventure'];
  const agencyKeywords = ['tour', 'travel', 'agency', 'agencia', 'expedition', 'trip', 'viaje'];

  // 1. Agencies with Adventure words
  const agenciesWithAdventure = agencies.filter(b => {
    const text = (b.name + ' ' + (b.description || '')).toLowerCase();
    return adventureKeywords.some(k => text.includes(k));
  });

  // 2. Adventures with Agency words
  const adventuresWithAgency = adventures.filter(b => {
    const text = (b.name + ' ' + (b.description || '')).toLowerCase();
    return agencyKeywords.some(k => text.includes(k));
  });

  console.log(`\n🕵️ Cross-Category Overlaps:`);
  console.log(`- AGENCIES that look like ADVENTURE: ${agenciesWithAdventure.length} (${((agenciesWithAdventure.length / agencies.length) * 100).toFixed(1)}%)`);
  console.log(`- ADVENTURES that look like AGENCY: ${adventuresWithAgency.length} (${((adventuresWithAgency.length / adventures.length) * 100).toFixed(1)}%)`);

  if (agenciesWithAdventure.length > 0) {
    console.log(`\n🔎 Sample AGENCIES with Adventure Keywords:`);
    console.log(agenciesWithAdventure.slice(0, 10).map(b => `- ${b.name}`).join('\n'));
  }

  if (adventuresWithAgency.length > 0) {
    console.log(`\n🔎 Sample ADVENTURES with Agency Keywords:`);
    console.log(adventuresWithAgency.slice(0, 10).map(b => `- ${b.name}`).join('\n'));
  }

  console.log(`\n💡 Analysis complete.`);
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
