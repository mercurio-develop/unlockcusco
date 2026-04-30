import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando inyección de datos de prueba (Dummy Data)...");

  const dummyBusinesses = [
    {
      name: "Tunupa Restaurant Valle Sagrado",
      category: "Dining",
      lat: -13.3031,
      lng: -72.1160,
      rating: 4.6,
      reviewsCount: 342,
      imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1000&auto=format&fit=crop",
      whatsapp: "51987654321",
      isClaimed: true,
      reviews: [
        { text: "Excelente comida buffet con vista al río.", author: "Carlos M.", rating: 5 },
        { text: "Un ambiente hermoso, pero un poco caro.", author: "Ana P.", rating: 4 }
      ]
    },
    {
      name: "Kawsay Spa & Yoga",
      category: "Wellness",
      lat: -13.2985,
      lng: -71.8492, // Pisac
      rating: 4.9,
      reviewsCount: 89,
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop",
      whatsapp: "51912345678",
      isClaimed: false,
      reviews: [
        { text: "El mejor masaje relajante después de Machu Picchu.", author: "Laura G.", rating: 5 }
      ]
    },
    {
      name: "Inka Trekking Adventures",
      category: "Adventure",
      lat: -13.2584,
      lng: -72.2635, // Ollantaytambo
      rating: 4.8,
      reviewsCount: 156,
      imageUrl: "https://images.unsplash.com/photo-1522345678432-8dfc0a273dd9?q=80&w=1000&auto=format&fit=crop",
      whatsapp: "51999888777",
      isClaimed: false,
      reviews: [
        { text: "Guías muy profesionales, 100% recomendados.", author: "Mike T.", rating: 5 }
      ]
    },
    {
      name: "El Albergue Ollantaytambo",
      category: "Stays",
      lat: -13.2570,
      lng: -72.2630,
      rating: 4.7,
      reviewsCount: 512,
      imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop",
      whatsapp: "51955443322",
      isClaimed: true,
      reviews: [
        { text: "Lugar mágico justo en la estación de tren.", author: "Sofia R.", rating: 5 }
      ]
    },
    {
      name: "Pisac Indian Market",
      category: "Culture",
      lat: -13.2995,
      lng: -71.8480,
      rating: 4.5,
      reviewsCount: 1200,
      imageUrl: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop",
      whatsapp: "51944556677",
      isClaimed: false,
      reviews: [
        { text: "Artesanías increíbles, no olvides regatear.", author: "Diego V.", rating: 4 }
      ]
    }
  ];

  for (const b of dummyBusinesses) {
    const existing = await prisma.business.findFirst({ where: { name: b.name } })
    if (!existing) {
      const slug = b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(7);
      await prisma.business.create({
        data: {
          name: b.name,
          slug,
          category: b.category,
          lat: b.lat,
          lng: b.lng,
          rating: b.rating,
          reviewsCount: b.reviewsCount,
          imageUrl: b.imageUrl,
          whatsapp: b.whatsapp,
          isClaimed: b.isClaimed,
          reviews: {
            create: b.reviews
          }
        }
      });
      console.log(`✅ Inyectado: ${b.name}`);
    } else {
      console.log(`⏭️  Ya existe: ${b.name}`);
    }
  }

  console.log("✨ Base de datos poblada con datos de prueba.");
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());