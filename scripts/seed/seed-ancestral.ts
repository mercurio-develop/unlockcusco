import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ANCESTRAL_PACKAGES = [
  {
    title: "Waqra Pukara - The Horned Fortress Full Day",
    sector: "OTHER",
    pace: "FAST",
    basePriceUsd: 85,
    tags: "trekking, ancestral, off-the-beaten-path, ruins, canyon",
    description: "An enigmatic archaeological site shaped like two horns, perched on a cliff 1,000 meters above the Apurimac Canyon. It served as an Inca sanctuary and astronomical observatory. A challenging off-the-beaten-path trek that offers some of the most dramatic canyon views in Peru, far from the mass tourism of Machu Picchu.",
    agencyName: "Inkayni Peru Tours"
  },
  {
    title: "Q'eswachaka - The Last Inca Bridge Full Day",
    sector: "OTHER",
    pace: "BALANCED",
    basePriceUsd: 90,
    tags: "culture, ancestral, living_tradition, bridge, community",
    description: "A 500-year-old living tradition, this is the last remaining Inca suspension bridge made entirely of handwoven ichu (highland grass). Declared a UNESCO Intangible Cultural Heritage. The tour combines the bridge visit with the Four Lagoons circuit.",
    agencyName: "Inkayni Peru Tours"
  },
  {
    title: "Ancestral Sound Therapy & Clay Healing",
    sector: "URUBAMBA",
    pace: "SLOW",
    basePriceUsd: 120,
    tags: "wellness, ancestral, spiritual, healing, rituals",
    description: "Specialized wellness tourism focusing on spiritual connection, ancient rituals, and traditional healing. Includes Ancestral Sound Therapy and Clay Healing immersions guided by heritage guardians.",
    agencyName: "Wellness Travel Peru"
  },
  {
    title: "Misminay Agrotourism & Weaving Homestay 2D/1N",
    sector: "URUBAMBA",
    pace: "SLOW",
    basePriceUsd: 150,
    tags: "culture, community_based, homestay, textiles, authentic",
    description: "Experiential Tourism in the community of Misminay. Focuses on ancestral farming techniques, traditional textile weaving, and rural stays where travelers share daily life and rituals with the community.",
    agencyName: "Inca Peru Travel"
  },
  {
    title: "Pallay Punchu - The Sharp Rainbow Mountain",
    sector: "OTHER",
    pace: "FAST",
    basePriceUsd: 95,
    tags: "trekking, nature, mountain, extreme, altitude",
    description: "Known as the 'decorated poncho' mountain, it is famous for its jagged, sharp peaks and vibrant mineral colors. Offers a less crowded alternative to Vinicunca, featuring a stunning view of the Langui-Layo Lagoon from the summit (4,700m).",
    agencyName: "Inkayni Peru Tours"
  }
];

async function seedAncestral() {
  console.log('Seeding Alternative & Ancestral Tourism Packages...');
  
  for (const pkg of ANCESTRAL_PACKAGES) {
    let agency = await prisma.agency.findFirst({
      where: { name: pkg.agencyName }
    });
    
    if (!agency) {
      agency = await prisma.agency.create({
        data: {
          slug: pkg.agencyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: pkg.agencyName,
          contactPhone: "+51 999 999 999",
          commissionRate: 0.05
        }
      });
    }
    
    const existing = await prisma.tourPackage.findFirst({
      where: { title: pkg.title }
    });
    
    if (!existing) {
      await prisma.tourPackage.create({
        data: {
          title: pkg.title,
          sector: pkg.sector,
          pace: pkg.pace,
          basePriceUsd: pkg.basePriceUsd,
          tags: pkg.tags,
          description: pkg.description + `\n\n*Provided by ${pkg.agencyName}*`
        }
      });
      console.log(`Created: ${pkg.title}`);
    }
  }
  console.log('Done seeding ancestral packages!');
}

seedAncestral()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });