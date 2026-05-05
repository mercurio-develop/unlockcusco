import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TRANSPORT_HUBS = [
  {
    name: "Terminal Pavitos (Colectivos to Urubamba & Ollantaytambo)",
    category: "TRANSPORT",
    rating: 4.0,
    reviewsCount: 150,
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop",
    lat: -13.52357,
    lng: -71.97808,
    locationSlug: "cusco",
    serviceZones: JSON.stringify(["cusco", "urubamba", "ollantaytambo"]),
    marginTier: "STANDARD",
    isClaimed: false,
    tagline: "Main departure point for shared minivans to the Sacred Valley.",
    description: "This is the primary terminal for colectivos (shared vans) heading from Cusco to Urubamba and Ollantaytambo via Chinchero. Vans leave when full (usually every 10-15 minutes). Expect to pay S/ 6 to S/ 10 in cash."
  },
  {
    name: "Terminal Puputi (Colectivos to Pisac & Calca)",
    category: "TRANSPORT",
    rating: 4.1,
    reviewsCount: 85,
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop",
    lat: -13.52019,
    lng: -71.96810,
    locationSlug: "cusco",
    serviceZones: JSON.stringify(["cusco", "pisac", "calca"]),
    marginTier: "STANDARD",
    isClaimed: false,
    tagline: "Main departure point for shared minivans to Pisac.",
    description: "Located near the Garcilaso Stadium, this is the terminal for colectivos heading to Pisac and Calca. Vans leave when full. The trip to Pisac takes about 45 minutes and costs around S/ 4 to S/ 6."
  },
  {
    name: "Paradero Puente Urubamba (Omnibus to Ollantaytambo)",
    category: "TRANSPORT",
    rating: 4.5,
    reviewsCount: 42,
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop",
    lat: -13.3302,
    lng: -72.0512,
    locationSlug: "urubamba",
    serviceZones: JSON.stringify(["urubamba", "ollantaytambo"]),
    marginTier: "STANDARD",
    isClaimed: false,
    tagline: "Catch local buses and colectivos to the Ollantaytambo train station.",
    description: "Located at the main bridge crossing the Vilcanota River in Urubamba. This is where you can flag down large local buses (omnibus) or passing colectivos heading to Ollantaytambo for your Machu Picchu train connection. Very cheap (S/ 2 - S/ 4)."
  },
  {
    name: "Alejandro Velasco Astete International Airport (CUZ)",
    category: "TRANSPORT",
    rating: 3.8,
    reviewsCount: 1200,
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop",
    lat: -13.5358,
    lng: -71.9388,
    locationSlug: "cusco",
    serviceZones: JSON.stringify(["cusco"]),
    marginTier: "STANDARD",
    isClaimed: true,
    tagline: "Cusco's main airport. The gateway to Machu Picchu and the Sacred Valley.",
    description: "The primary airport serving Cusco. Note that there are NO direct colectivos to the Sacred Valley from the airport. You must take a private taxi directly to your hotel, or take a short taxi to Terminal Pavitos or Terminal Puputi to catch a colectivo."
  }
];

async function main() {
  console.log("Seeding Transport Hubs...");
  
  for (const hub of TRANSPORT_HUBS) {
    // Check if it already exists
    const existing = await prisma.business.findFirst({
      where: { name: hub.name }
    });

    if (!existing) {
      await prisma.business.create({
        data: {
          ...hub,
          slug: hub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 8),
        }
      });
      console.log(`Created transport hub: ${hub.name}`);
    } else {
      console.log(`Hub already exists: ${hub.name}`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
