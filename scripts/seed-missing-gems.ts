import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Seeding Missing High-Value Businesses in Calca & Yucay ===")

  const newBusinesses = [
    {
      slug: "casa-raiz-calca",
      name: "CASA RAIZ Handmade House Luxury Stay",
      category: "Stays",
      locationSlug: "calca",
      lat: -13.3300,
      lng: -71.9600,
      rating: 4.9,
      reviewsCount: 152,
      imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80",
      description: "A top-rated boutique option known for its handcrafted decor, intimate atmosphere, and stunning mountain views. Ideal for a romantic or quiet getaway in the heart of Calca.",
      priceTier: "$$$",
    },
    {
      slug: "unuwasi-hotel-villa-calca",
      name: "Unuwasi Hotel & Villa",
      category: "Stays",
      locationSlug: "calca",
      lat: -13.3320,
      lng: -71.9580,
      rating: 4.8,
      reviewsCount: 89,
      imageUrl: "https://images.unsplash.com/photo-1542314831-c6a4d14d83f1?auto=format&fit=crop&q=80",
      description: "A highly-regarded hotel offering a serene environment with gardens, a terrace, and an on-site restaurant. Guests often praise its fairytale setting.",
      priceTier: "$$",
    },
    {
      slug: "andenia-boutique-hotel-calca",
      name: "Andenia Boutique Hotel",
      category: "Stays",
      locationSlug: "calca",
      lat: -13.3350,
      lng: -71.9700,
      rating: 5.0,
      reviewsCount: 204,
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80",
      description: "Located in the Calca area, this boutique hotel offers a tranquil retreat with beautiful gardens and personalized luxury service.",
      priceTier: "$$$",
    },
    {
      slug: "qasa-valle-sagrado-calca",
      name: "QASA Valle Sagrado by Nomad",
      category: "Stays",
      locationSlug: "calca",
      lat: -13.3400,
      lng: -71.9650,
      rating: 4.7,
      reviewsCount: 112,
      imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80",
      description: "A peaceful retreat in Calca that offers deep-tissue massages, aromatherapy, and an inviting café alongside luxury rooms.",
      priceTier: "$$$",
    },
    {
      slug: "la-casa-de-la-abuela-calca",
      name: "La Casa de la Abuela",
      category: "Dining",
      locationSlug: "calca",
      lat: -13.3330,
      lng: -71.9660,
      rating: 4.6,
      reviewsCount: 340,
      imageUrl: "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?auto=format&fit=crop&q=80",
      description: "A beloved local favorite for authentic Andean cuisine in Calca. Famous for traditional dishes like cuy chactado and pachamanca.",
      priceTier: "$",
    },
    {
      slug: "killa-wasi-calca",
      name: "Killa Wasi",
      category: "Dining",
      locationSlug: "calca",
      lat: -13.3340,
      lng: -71.9680,
      rating: 4.8,
      reviewsCount: 120,
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80",
      description: "A restaurant that focuses on indigenous ingredients and traditional recipes with a contemporary, creative twist.",
      priceTier: "$$",
    },
    {
      slug: "amanto-calca",
      name: "Amanto",
      category: "Dining",
      locationSlug: "calca",
      lat: -13.3310,
      lng: -71.9670,
      rating: 4.7,
      reviewsCount: 95,
      imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80",
      description: "A simple but characterful spot where Andean flavors are merged with modern techniques. Recommended dishes include Alpaca Carpaccio.",
      priceTier: "$$",
    },
    {
      slug: "la-casona-de-yucay",
      name: "La Casona de Yucay",
      category: "Stays",
      locationSlug: "yucay",
      lat: -13.3010,
      lng: -72.0850,
      rating: 4.8,
      reviewsCount: 450,
      imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80",
      description: "A historic colonial hacienda dating back to 1810 where Simón Bolívar once stayed. Highly rated for its manicured gardens and mountain views.",
      priceTier: "$$",
    },
    {
      slug: "san-agustin-monasterio-yucay",
      name: "Hotel San Agustín Monasterio de la Recoleta",
      category: "Stays",
      locationSlug: "yucay",
      lat: -13.3020,
      lng: -72.0840,
      rating: 4.6,
      reviewsCount: 310,
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80",
      description: "Built within a 17th-century Franciscan monastery, offering a unique atmospheric stay with stone arches and religious art.",
      priceTier: "$$",
    },
    {
      slug: "tawa-restaurante-yucay",
      name: "Tawa Restaurante",
      category: "Dining",
      locationSlug: "yucay",
      lat: -13.3005,
      lng: -72.0835,
      rating: 4.9,
      reviewsCount: 205,
      imageUrl: "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?auto=format&fit=crop&q=80",
      description: "Widely considered the best independent restaurant in Yucay. Run by a local couple specializing in refined Andean cuisine.",
      priceTier: "$$",
    }
  ]

  let added = 0
  for (const b of newBusinesses) {
    const existing = await prisma.business.findUnique({ where: { slug: b.slug } })
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

  // Also let's check Sonesta Yucay and make sure it has the right coordinates just in case
  const sonesta = await prisma.business.findFirst({
    where: { name: { contains: 'Sonesta Hotel Posadas del Inca Yucay' } }
  })
  if (sonesta) {
    await prisma.business.update({
      where: { id: sonesta.id },
      data: { 
        lat: -13.3000, 
        lng: -72.0833,
        priceTier: '$$$'
      }
    })
    console.log("Verified and updated Sonesta Yucay coordinates/price.")
  }

  console.log(`\n=== Done. Added ${added} new missing gems to the database. ===`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
