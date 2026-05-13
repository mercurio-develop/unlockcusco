import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting premium business mock data injection...");

  const businesses = [
    {
      slug: "inka-sanctuary-premium",
      name: "Inka Sanctuary Retreat",
      category: "WELLNESS",
      tagline: "Reconnect with nature in the heart of the Sacred Valley",
      description: "Inka Sanctuary Retreat is a holistic healing center dedicated to preserving ancestral traditions and offering transformative wellness experiences.",
      locationSlug: "urubamba",
      whatsapp: "51912345678",
      isAsociado: true,
      isClaimed: true,
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
      premiumProfile: {
        logoUrl: "https://example.com/logo.png",
        coverPhotoUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
        primaryColor: "#111812", // Dark green/black
        accentColor: "#34D399", // Emerald
        fonts: "Playfair Display, Inter",
        visionStatement: "To be the leading sanctuary for holistic healing and spiritual awakening in the Andes, blending ancient wisdom with modern comfort.",
        pillars: [
          { title: "Ancestral Wisdom", description: "Practices rooted in authentic Andean traditions.", icon: "Mountain" },
          { title: "Eco-Conscious", description: "Built with sustainable materials and 100% renewable energy.", icon: "Leaf" },
          { title: "Holistic Healing", description: "Integrating mind, body, and spirit through personalized journeys.", icon: "Heart" }
        ]
      },
      services: [
        {
          title: "Andean Rebirth Ceremony",
          description: "A deep cleansing ritual guided by local shamans using traditional smoke and sound healing.",
          priceUsd: 150,
          durationMins: 120,
        },
        {
          title: "Sacred Valley Massage",
          description: "Relaxing deep tissue massage utilizing essential oils from local Andean herbs.",
          priceUsd: 80,
          durationMins: 90,
        }
      ]
    },
    {
      slug: "condor-expeditions-premium",
      name: "Condor Expeditions",
      category: "AGENCY",
      tagline: "Conquer the Andes with local experts",
      description: "Condor Expeditions provides premium, small-group treks across the Sacred Valley and Machu Picchu, prioritizing sustainability and authentic encounters.",
      locationSlug: "cusco",
      whatsapp: "51987654321",
      isAsociado: true,
      isClaimed: true,
      imageUrl: "https://images.unsplash.com/photo-1522345678432-8dfc0a273dd9",
      premiumProfile: {
        logoUrl: "https://example.com/condor-logo.png",
        coverPhotoUrl: "https://images.unsplash.com/photo-1522345678432-8dfc0a273dd9",
        primaryColor: "#0F172A", // Slate dark
        accentColor: "#3B82F6", // Blue
        fonts: "Merriweather, Roboto",
        visionStatement: "To guide travelers through life-changing journeys while respecting the mountains and empowering our local communities.",
        pillars: [
          { title: "Small Groups", description: "Maximum of 8 people per group for an intimate experience.", icon: "Users" },
          { title: "Expert Guides", description: "All guides are locals with 10+ years of high-altitude experience.", icon: "Award" },
          { title: "Leave No Trace", description: "We remove more waste from the trails than we bring in.", icon: "Leaf" }
        ]
      },
      tourPackages: [
        {
          title: "Ausangate 5-Day Trek",
          tagline: "The ultimate high-altitude adventure",
          description: "Trek around the most sacred mountain in the Cusco region, encountering glacial lakes, alpacas, and remote communities.",
          durationDays: 5,
          difficulty: "CHALLENGING",
          pace: "Intense",
          basePriceUsd: 650,
          included: JSON.stringify(["Tents", "All meals", "Mules for gear", "Oxygen tank"]),
          highlights: JSON.stringify(["Rainbow Mountain access", "Hot springs", "Glacial camping"]),
          itinerary: JSON.stringify(["Day 1: Upin to Pacchanta", "Day 2: Pacchanta to Qampa", "Day 3: Qampa Pass", "Day 4: Rainbow Mountain", "Day 5: Return to Cusco"]),
          gallery: JSON.stringify([])
        }
      ]
    },
    {
      slug: "mil-centro-premium",
      name: "Mil Centro",
      category: "DINING",
      tagline: "High-altitude gastronomy overlooking Moray",
      description: "An immersion into high-altitude ecosystems, discovering native ingredients and ancient agricultural techniques at 3,500 meters above sea level.",
      locationSlug: "maras",
      whatsapp: "51999888777",
      isAsociado: true,
      isClaimed: true,
      imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c",
      premiumProfile: {
        logoUrl: "https://example.com/mil-logo.png",
        coverPhotoUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c",
        primaryColor: "#1C1917", // Zinc dark
        accentColor: "#F43F5E", // Rose
        fonts: "Playfair Display, Lato",
        visionStatement: "To elevate ancestral ingredients and techniques to the forefront of global gastronomy through research and innovation.",
        pillars: [
          { title: "Mater Iniciativa", description: "Our research center travels the Andes discovering new ingredients.", icon: "Search" },
          { title: "Local Farmers", description: "Direct collaboration with the indigenous communities of Mullakas Misminay.", icon: "Users" },
          { title: "Zero Waste", description: "Complete utilization of ingredients through traditional fermentation.", icon: "Recycle" }
        ]
      },
      services: [
        {
          title: "8-Course Tasting Menu",
          description: "A journey through 8 different high-altitude ecosystems, from the Andean forest to the extreme altitudes.",
          priceUsd: 140,
          durationMins: 180,
        },
        {
          title: "Botanical Pairing",
          description: "Pairing of house-made extracts, fermentations, and infusions of Andean botanicals.",
          priceUsd: 50,
          durationMins: 180,
        }
      ]
    }
  ];

  try {
    for (const data of businesses) {
      // Check if business exists
      const existing = await prisma.business.findUnique({
        where: { slug: data.slug }
      });

      if (existing) {
        await prisma.business.delete({ where: { slug: data.slug } });
        console.log(`Deleted existing business with slug: ${data.slug}`);
      }

      // Prepare payload dynamically based on category
      const createPayload: any = {
        slug: data.slug,
        name: data.name,
        category: data.category,
        tagline: data.tagline,
        description: data.description,
        locationSlug: data.locationSlug,
        whatsapp: data.whatsapp,
        isAsociado: data.isAsociado,
        isClaimed: data.isClaimed,
        imageUrl: data.imageUrl,
        
        premiumProfile: {
          create: {
            logoUrl: data.premiumProfile.logoUrl,
            coverPhotoUrl: data.premiumProfile.coverPhotoUrl,
            primaryColor: data.premiumProfile.primaryColor,
            accentColor: data.premiumProfile.accentColor,
            fonts: data.premiumProfile.fonts,
            visionStatement: data.premiumProfile.visionStatement,
            pillars: {
              create: data.premiumProfile.pillars
            }
          }
        }
      };

      if (data.tourPackages) {
        createPayload.tourPackages = { create: data.tourPackages };
      }
      
      if (data.services) {
        createPayload.services = { create: data.services };
      }

      const business = await prisma.business.create({
        data: createPayload
      });

      console.log(`✅ Created Premium Business: ${business.name}`);
    }
  } catch (error) {
    console.error("❌ Error seeding premium businesses:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();