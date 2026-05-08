import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const diyTours = [
  {
    title: 'LLaullipata Park Hike',
    sector: 'CUSCO_CITY',
    pace: 'SLOW',
    basePriceUsd: 0,
    tags: 'park, nature, solo, half-day, free, off-the-beaten-path',
    description: 'A beautiful and free ecological park located just above Cusco. Perfect for a quiet morning hike away from the crowds to acclimatize to the altitude.\n\n**Getting there:** Easily accessible on foot or via a short S/5 taxi ride from the historic center.',
    packageType: 'SINGLE_DAY'
  },
  {
    title: 'Balcon del Diablo (Devil\'s Balcony)',
    sector: 'CUSCO_CITY',
    pace: 'BALANCED',
    basePriceUsd: 0,
    tags: 'cave, ruins, hike, solo, half-day, free, off-the-beaten-path',
    description: 'A stunning natural cave and Inca site. The hike offers incredible views over Cusco and explores the Chacan Cave where the river flows directly through the rock.\n\n**Getting there:** Walkable from Sacsayhuaman or accessible via taxi/colectivo.',
    packageType: 'SINGLE_DAY'
  },
  {
    title: 'Huchuy Qosqo Trek (DIY)',
    sector: 'EAST_VALLEY',
    pace: 'FAST',
    basePriceUsd: 14,
    tags: 'ruins, trek, solo, full-day, intense, off-the-beaten-path',
    description: 'An 11-mile trek along an ancient Inca road leading to the remote Huchuy Qosqo ("Little Cusco") ruins. You will likely have the entire archaeological site to yourself.\n\n**Getting there:** Take a colectivo to Tambomachay or Chinchero to start the trek, and end by hiking down to Lamay in the Sacred Valley.',
    packageType: 'SINGLE_DAY'
  },
  {
    title: 'Kinsa Cocha Lakes (Three Lakes)',
    sector: 'EAST_VALLEY',
    pace: 'BALANCED',
    basePriceUsd: 10,
    tags: 'lakes, nature, hike, solo, half-day, off-the-beaten-path',
    description: 'A breathtaking hike around three high-altitude glacial lakes nestled in the Andes. Very few tourists make it out here, offering a serene connection with nature.\n\n**Getting there:** Hire a taxi from Pisac market (roughly S/60 round trip) to wait for you while you hike.',
    packageType: 'SINGLE_DAY'
  },
  {
    title: 'Cusco 4-Ruins Walk (Sacsayhuaman, Qenko, Puka Pukara, Tambomachay)',
    sector: 'CUSCO_CITY',
    pace: 'BALANCED',
    basePriceUsd: 5,
    tags: 'ruins, inca, walk, solo, half-day, boleto-turistico',
    description: 'Explore the four magnificent Inca ruins perched immediately above Cusco. An excellent acclimatization day to see massive megalithic architecture, water temples, and ancient shrines.\n\n**Getting there:** Take a colectivo or taxi up to Tambomachay (highest point) and walk downhill back to Cusco, visiting the sites along the way. Requires Boleto Turístico.',
    packageType: 'SINGLE_DAY'
  },
  {
    title: 'South Valley Ruins: Tipon and Piquillacta',
    sector: 'OTHER',
    pace: 'SLOW',
    basePriceUsd: 8,
    tags: 'ruins, water-temple, wari, inca, solo, half-day, boleto-turistico',
    description: 'Visit Tipon, a masterpiece of Inca water engineering and terracing, followed by Piquillacta, a massive pre-Inca Wari city built entirely of adobe and stone.\n\n**Getting there:** Take a public bus heading south towards Urcos from Cusco. Requires Boleto Turístico.',
    packageType: 'SINGLE_DAY'
  }
];

async function main() {
  console.log('🚀 Seeding Slight North DIY Day Trips...');

  let added = 0;
  for (const tour of diyTours) {
    const existing = await prisma.tourPackage.findFirst({ where: { title: tour.title } });
    if (existing) {
      console.log(`   ↩️  Skipping duplicate: ${tour.title}`);
      continue;
    }
    
    await prisma.tourPackage.create({
      data: {
        title: tour.title,
        tagline: tour.description.substring(0, 100) + '...',
        sector: tour.sector,
        pace: tour.pace,
        basePriceUsd: tour.basePriceUsd,
        tags: tour.tags,
        description: tour.description,
        packageType: tour.packageType,
      },
    });
    console.log(`   ✅ Saved: ${tour.title}`);
    added++;
  }

  console.log(`\n🎉 Seeded ${added} new experiences from Slight North!`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
