import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Seeding Top Dining & Adventure from Google ===")

  const newBusinesses = [
    // Top Dining
    {
      slug: "mil-centro-moray",
      name: "MIL Centro",
      category: "Dining",
      locationSlug: "maras",
      lat: -13.3300,
      lng: -72.1960,
      rating: 4.9,
      reviewsCount: 850,
      imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80",
      description: "Created by Virgilio Martínez of Central in Lima, this is widely considered the most prestigious dining experience in the valley. Located at 3,500m next to the Moray ruins, it offers an 8-ecosystem tasting menu.",
      priceTier: "$$$$",
    },
    {
      slug: "hawa-tambo-del-inka",
      name: "Hawa Restaurant",
      category: "Dining",
      locationSlug: "urubamba",
      lat: -13.3030,
      lng: -72.1150,
      rating: 4.8,
      reviewsCount: 520,
      imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80",
      description: "An elegant farm-to-table restaurant within the Tambo del Inka hotel. It reinterprets Andean cuisine using organic produce from its own extensive garden.",
      priceTier: "$$$",
    },
    {
      slug: "wayra-sol-y-luna",
      name: "Wayra at Sol y Luna",
      category: "Dining",
      locationSlug: "urubamba",
      lat: -13.3000,
      lng: -72.1100,
      rating: 4.8,
      reviewsCount: 410,
      imageUrl: "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80",
      description: "Part of a Relais & Châteaux property, Wayra is famous for its traditional Pachamanca (meats and vegetables cooked in an underground earth oven) and beautiful setting with live Paso horse shows.",
      priceTier: "$$$",
    },
    {
      slug: "el-huacatay-urubamba",
      name: "El Huacatay",
      category: "Dining",
      locationSlug: "urubamba",
      lat: -13.3040,
      lng: -72.1180,
      rating: 4.9,
      reviewsCount: 1100,
      imageUrl: "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?auto=format&fit=crop&q=80",
      description: "A long-time favorite known for its Andean-Mediterranean-Asian fusion. Tucked away in a cozy garden setting, famous for its alpaca loin and creative appetizers.",
      priceTier: "$$",
    },
    {
      slug: "chuncho-ollantaytambo",
      name: "Chuncho",
      category: "Dining",
      locationSlug: "ollantaytambo",
      lat: -13.2580,
      lng: -72.2630,
      rating: 4.7,
      reviewsCount: 650,
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80",
      description: "Located on the main square, it focuses on 'honest' Andean food using ingredients from their own farm (El Albergue). Highly rated for authenticity and traditional techniques.",
      priceTier: "$$",
    },
    {
      slug: "hacienda-huayoccari",
      name: "Hacienda Huayoccari",
      category: "Dining",
      locationSlug: "yucay", // Between Pisac and Urubamba, Yucay is a good fit
      lat: -13.3100,
      lng: -72.0500,
      rating: 4.8,
      reviewsCount: 220,
      imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80",
      description: "A private estate that feels like a museum. It serves hearty, homemade Andean cuisine in a rustic, historic setting surrounded by art and nature.",
      priceTier: "$$$",
    },

    // Top Adventure/Agencies
    {
      slug: "alpaca-expeditions-cusco",
      name: "Alpaca Expeditions",
      category: "Agency",
      locationSlug: "cusco",
      lat: -13.5220,
      lng: -71.9670,
      rating: 5.0,
      reviewsCount: 15400,
      imageUrl: "https://images.unsplash.com/photo-1520208422220-d12a3c588e6c?auto=format&fit=crop&q=80",
      description: "Widely considered the #1 tour operator in Peru. They specialize in sustainable trekking (Inca Trail, Salkantay) and offer comprehensive Sacred Valley day tours.",
      priceTier: "$$$",
    },
    {
      slug: "salkantay-trekking-cusco",
      name: "Salkantay Trekking",
      category: "Agency",
      locationSlug: "cusco",
      lat: -13.5230,
      lng: -71.9680,
      rating: 4.9,
      reviewsCount: 8200,
      imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80",
      description: "Known for their 'Small Groups & Big Adventures'. Experts in high-altitude treks, offering unique 'Andean Explorer' packages that combine the Sacred Valley with Salkantay.",
      priceTier: "$$",
    },
    {
      slug: "sam-travel-peru-cusco",
      name: "SAM Travel Peru",
      category: "Agency",
      locationSlug: "cusco",
      lat: -13.5210,
      lng: -71.9660,
      rating: 4.9,
      reviewsCount: 5100,
      imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80",
      description: "A 100% Peruvian-owned company excelling in off-the-beaten-path adventures. Fully licensed Inca Trail operators praised for personalized service.",
      priceTier: "$$",
    },
    {
      slug: "river-explorers-urubamba",
      name: "River Explorers",
      category: "Adventure",
      locationSlug: "urubamba",
      lat: -13.3050,
      lng: -72.1200,
      rating: 4.8,
      reviewsCount: 1250,
      imageUrl: "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&q=80",
      description: "The 'gold standard' for white-water rafting on the Urubamba River. They maintain an excellent safety record and offer Class II–III rapids suitable for various experience levels.",
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

  console.log(`\n=== Done. Added ${added} new top-tier gems from Google. ===`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
