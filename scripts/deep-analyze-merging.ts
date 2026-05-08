import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🔍 Starting Deep Analysis for ADVENTURE & AGENCY...");

  const businesses = await prisma.business.findMany({
    where: {
      category: { in: ['AGENCY', 'ADVENTURE'] }
    },
    select: { id: true, name: true, description: true, reviewsCount: true, category: true }
  });

  console.log(`Total businesses in scope: ${businesses.length}`);

  const groups: Record<string, string[]> = {
    'HORSE_RIDING': ['horse', 'caballo', 'ecuestre'],
    'TREKKING': ['trek', 'hike', 'caminata', 'trail', 'mountain'],
    'RAFTING': ['rafting', 'river', 'canotaje', 'rio'],
    'ATV': ['atv', 'cuatrimoto', 'quad'],
    'OTHER_ADVENTURE': ['adventure', 'aventura', 'zipline', 'climb', 'escalada', 'bike', 'bicicleta'],
    'GENERIC_AGENCY': ['tour', 'travel', 'agencia', 'agency', 'expedition', 'viaje', 'trip']
  };

  const categorized: Record<string, any[]> = {
    'HORSE_RIDING': [],
    'TREKKING': [],
    'RAFTING': [],
    'ATV': [],
    'OTHER_ADVENTURE': [],
    'GENERIC_AGENCY': [],
    'UNCATEGORIZED': []
  };

  const lowReviews = businesses.filter(b => b.reviewsCount < 5);

  businesses.forEach(b => {
    const text = (b.name + ' ' + (b.description || '')).toLowerCase();
    let found = false;

    // Check in specific order (priority)
    for (const [group, keywords] of Object.entries(groups)) {
      if (keywords.some(k => text.includes(k))) {
        categorized[group].push(b);
        found = true;
        break;
      }
    }

    if (!found) {
      categorized['UNCATEGORIZED'].push(b);
    }
  });

  console.log(`\n📊 Potential Merged Groups:`);
  for (const [group, items] of Object.entries(categorized)) {
    console.log(`- ${group}: ${items.length} businesses`);
  }

  console.log(`\n🗑️ Review Audit:`);
  console.log(`- Businesses with < 5 reviews: ${lowReviews.length}`);

  console.log(`\n🔎 Sample Low Review Businesses (first 10):`);
  console.log(lowReviews.slice(0, 10).map(b => `- ${b.name} (${b.reviewsCount} reviews)`).join('\n'));

  console.log(`\n🔎 Sample HORSE_RIDING (if any):`);
  console.log(categorized['HORSE_RIDING'].slice(0, 5).map(b => `- ${b.name}`).join('\n'));

  console.log(`\n🔎 Sample RAFTING (if any):`);
  console.log(categorized['RAFTING'].slice(0, 5).map(b => `- ${b.name}`).join('\n'));

  console.log(`\n🔎 Sample ATV (if any):`);
  console.log(categorized['ATV'].slice(0, 5).map(b => `- ${b.name}`).join('\n'));

  console.log(`\n💡 Analysis complete.`);
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
