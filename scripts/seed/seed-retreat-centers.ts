import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TOWN_COORDS: Record<string, { lat: number; lng: number }> = {
  pisac: { lat: -13.422, lng: -71.848 },
  urubamba: { lat: -13.304, lng: -72.115 },
  calca: { lat: -13.332, lng: -71.954 },
  cusco: { lat: -13.522, lng: -71.967 },
  huaran: { lat: -13.315, lng: -72.036 },
  arin: { lat: -13.317, lng: -72.052 },
  huycho: { lat: -13.320, lng: -72.000 }
};

const retreatCenters = [
  {
    name: "Munay Sonqo",
    location: "Calca",
    category: "WELLNESS",
    description: "Meaning 'Loving Heart' in Quechua, this center is a favorite for large international yoga teacher trainings and group retreats. It features multiple light-filled yoga shalas, lush gardens, and a peaceful, secluded atmosphere.",
    contact: "https://munaysonqo.com"
  },
  {
    name: "Willka T'ika",
    location: "Urubamba",
    category: "WELLNESS",
    description: "Considered the original luxury eco-yoga center in the Sacred Valley, famous for its Seven Chakra Gardens. Features sun-filled garden studios, organic farm-to-table vegetarian cuisine, and authentic ceremonies led by local Quechua staff.",
    contact: "https://www.willkatika.com"
  },
  {
    name: "Samadhi Sacred Valley",
    location: "Huycho",
    category: "WELLNESS",
    description: "A boutique center designed around sacred geometry and the 7 chakras. Offers a top-floor yoga studio with panoramic views, organic gardens, and bungalows representing the seven chakra energy centers.",
    contact: "https://samadhisacredvalley.com"
  },
  {
    name: "Pacha Munay Wellness Resort",
    location: "Urubamba",
    category: "WELLNESS",
    description: "A boutique wellness resort offering yoga, meditation, detox, and spiritual retreats. Known for its 'Allowing Ease' program focusing on rejuvenation and 1:1 support, featuring rustic Andean-style rooms.",
    contact: "https://pachamunaywellnessresort.com"
  },
  {
    name: "Nidra Wasi",
    location: "Pisac",
    category: "WELLNESS",
    description: "A holistic retreat center and B&B situated at the base of the Apu Intihuatana. Built with sustainable local materials, it serves as a hub for the local yoga and medicine community, offering yoga, healing arts, and community events.",
    contact: "https://www.nidrawasi.org"
  },
  {
    name: "Sach'a Munay",
    location: "Arin",
    category: "WELLNESS",
    description: "An 'eco-luxury' sanctuary nestled at the base of the mountains directly underneath a waterfall. Features a glass-walled Yoga Shala, traditional Andean Chullpas, wellness facilities, and operates on permaculture ethics.",
    contact: "https://sachamunay.org"
  }
];

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('🌱 Seeding Sacred Valley Retreat Centers...');

  let added = 0;
  for (const b of retreatCenters) {
    const slug = generateSlug(b.name);
    const locationSlug = b.location.toLowerCase();
    const coords = TOWN_COORDS[locationSlug] || { lat: null, lng: null };
    
    // Check if it exists
    const existing = await prisma.business.findUnique({
      where: { slug }
    });

    if (existing) {
      console.log(`   ⏭️ Skipped (already exists): ${b.name}`);
      continue;
    }

    // Add some random scatter to the coordinates so pins don't overlap completely
    const lat = coords.lat ? coords.lat + (Math.random() - 0.5) * 0.005 : null;
    const lng = coords.lng ? coords.lng + (Math.random() - 0.5) * 0.005 : null;

    await prisma.business.create({
      data: {
        name: b.name,
        slug,
        category: b.category,
        locationSlug,
        description: b.description,
        tagline: b.description.substring(0, 80) + '...',
        socialLinks: JSON.stringify({ website: b.contact }),
        lat,
        lng,
        isClaimed: false,
        isAsociado: false,
        imageUrl: "/agencies/default-hero.jpg" // placeholder
      }
    });
    
    console.log(`   ✅ Added: ${b.name} (${b.location})`);
    added++;
  }

  console.log(`\n🎉 Seeded ${added} new retreat centers!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
