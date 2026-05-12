import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Seeding Top Wellness & Retreats from Google ===")

  const newBusinesses = [
    {
      slug: "willka-tika-urubamba",
      name: "Willka T'ika",
      category: "Wellness",
      locationSlug: "urubamba",
      lat: -13.3050,
      lng: -72.1220,
      rating: 4.9,
      reviewsCount: 420,
      imageUrl: "https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&q=80",
      description: "Perhaps the most famous retreat in the valley. An eco-friendly sanctuary known for its Seven Chakra Gardens, organic farm-to-table vegetarian cuisine, and authentic Andean ceremonies led by local healers.",
      priceTier: "$$$",
    },
    {
      slug: "samadhi-sacred-valley-pisac",
      name: "Samadhi Sacred Valley",
      category: "Wellness",
      locationSlug: "pisac",
      lat: -13.4200,
      lng: -71.8500,
      rating: 4.8,
      reviewsCount: 310,
      imageUrl: "https://images.unsplash.com/photo-1528310901416-a5e4b2d56a25?auto=format&fit=crop&q=80",
      description: "A holistic wellness center where each bungalow represents one of the seven chakras. It offers personalized yoga, meditation, and cultural immersion programs with panoramic views of the Andes.",
      priceTier: "$$$",
    },
    {
      slug: "munay-sonqo-pisac",
      name: "Munay Sonqo",
      category: "Wellness",
      locationSlug: "pisac", // Arin is a sector in Pisac/Calca area
      lat: -13.4150,
      lng: -71.8450,
      rating: 4.8,
      reviewsCount: 280,
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80",
      description: "Meaning 'Loving Heart' in Quechua, this center is a favorite for group retreats. It features a light-filled yoga shala, lush gardens, and a focus on nervous system resets and deep rest.",
      priceTier: "$$",
    },
    {
      slug: "arkana-sacred-valley-urubamba",
      name: "Arkana Spiritual Center",
      category: "Wellness",
      locationSlug: "urubamba",
      lat: -13.3000,
      lng: -72.1100,
      rating: 4.9,
      reviewsCount: 550,
      imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80",
      description: "A top-rated center for Ayahuasca and San Pedro (Huachuma) ceremonies, led by experienced Shipibo and Andean healers in a safe, supportive environment.",
      priceTier: "$$$",
    },
    {
      slug: "espiral-medicine-retreats",
      name: "Espiral Medicine Retreats",
      category: "Wellness",
      locationSlug: "pisac",
      lat: -13.4250,
      lng: -71.8400,
      rating: 4.8,
      reviewsCount: 150,
      imageUrl: "https://images.unsplash.com/photo-1520638515403-127b72782e4e?auto=format&fit=crop&q=80",
      description: "Focuses on the gentle, heart-opening medicine of San Pedro (Huachuma), emphasizing sustainability, self-discovery, and deep connection with the Andean nature.",
      priceTier: "$$",
    }
  ]

  let added = 0
  for (const b of newBusinesses) {
    const existing = await prisma.business.findFirst({ 
      where: { 
        OR: [
          { slug: b.slug },
          { name: { equals: b.name, mode: 'insensitive' } }
        ]
      } 
    })
    if (!existing) {
      await prisma.business.create({
        data: b
      })
      console.log(`Added: ${b.name} (${b.locationSlug})`)
      added++
    } else {
      console.log(`Already exists: ${b.name}`)
    }
  }

  console.log(`\n=== Done. Added ${added} new top-tier wellness gems from Google. ===`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
