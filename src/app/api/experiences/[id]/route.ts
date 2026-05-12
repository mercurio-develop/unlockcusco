import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 0. Handle Mock IDs from Dev Fill
    const mockDb: Record<string, any> = {
      'h1': { title: "Hotel Monasterio", type: "STAY", category: "STAY", description: "A 16th-century monastery transformed into a luxury hotel.", heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80", sector: "Cusco", durationStr: "Overnight", tags: "luxury, historical, stay", lat: -13.5152, lng: -71.9774 },
      'm1': { title: "Chicha por Gaston Acurio", type: "DINING", category: "DINING", description: "Renowned Peruvian chef's take on regional Cusco cuisine.", heroImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80", sector: "Cusco", durationStr: "2 Hours", tags: "food, local, gourmet" },
      'e1': { title: "Sacsayhuaman Guided Tour", type: "PACKAGE", category: "CULTURE", description: "Explore the colossal stone walls of the Incan fortress above Cusco.", heroImage: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=500&q=80", sector: "Cusco", durationStr: "3 Hours", tags: "history, ruins, guided" },
      'h2': { title: "Tambo del Inka", type: "STAY", category: "STAY", description: "Luxury resort nestled in the heart of the Sacred Valley with private train station.", heroImage: "https://images.unsplash.com/photo-1542314831-c6a420325142?w=500&q=80", sector: "Sacred Valley", durationStr: "Overnight", tags: "luxury, resort, stay" },
      'e2': { title: "Pisac Archaeological Park", type: "PACKAGE", category: "CULTURE", description: "Incredible terraces and Incan ruins overlooking the Sacred Valley.", heroImage: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=500&q=80", sector: "Sacred Valley", durationStr: "2.5 Hours", tags: "history, ruins, scenic" },
      'm2': { title: "Hacienda Huayoccari", type: "DINING", category: "DINING", description: "Traditional Peruvian lunch amidst a vast collection of colonial art.", heroImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80", sector: "Sacred Valley", durationStr: "2 Hours", tags: "food, traditional, scenic" },
      'e3': { title: "Ollantaytambo Fortress", type: "PACKAGE", category: "CULTURE", description: "Massive Incan fortress that served as the last stronghold against the Spanish.", heroImage: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=500&q=80", sector: "Sacred Valley", durationStr: "1.5 Hours", tags: "history, ruins, climbing" },
      'e4': { title: "Machu Picchu Citadel", type: "PACKAGE", category: "CULTURE", description: "One of the New Seven Wonders of the World. A mystical ancient city in the clouds.", heroImage: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=500&q=80", sector: "Machu Picchu", durationStr: "3 Hours", tags: "wonder, history, ruins" },
      'm3': { title: "Tinkuy Buffet Restaurant", type: "DINING", category: "DINING", description: "The only dining option adjacent to the ancient citadel of Machu Picchu.", heroImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80", sector: "Machu Picchu", durationStr: "1 Hour", tags: "food, buffet, convenient" },
      'm-mock': { title: "Local Restaurant", type: "DINING", category: "DINING", description: "A highly-rated local dining spot.", heroImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80", sector: "Local", durationStr: "1.5 Hours", tags: "food, dining" },
      'h-mock': { title: "Boutique Hotel", type: "STAY", category: "STAY", description: "Comfortable stay with excellent amenities.", heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80", sector: "Local", durationStr: "Overnight", tags: "stay, boutique" },
      'e-mock': { title: "Guided Excursion", type: "PACKAGE", category: "CULTURE", description: "Immersive guided experience with a local expert.", heroImage: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=500&q=80", sector: "Local", durationStr: "2 Hours", tags: "culture, guided" },
    }

    if (mockDb[id]) {
      const mock = mockDb[id];
      return Response.json({
        id,
        ...mock,
      })
    }

    // 1. Try to find in TourPackage
    const tourPackage = await prisma.tourPackage.findUnique({
      where: { id },
      include: { business: true }
    })

    if (tourPackage) {
      return Response.json({
        id: tourPackage.id,
        title: tourPackage.title,
        tagline: tourPackage.tagline,
        description: tourPackage.description,
        heroImage: tourPackage.heroImage || tourPackage.business?.imageUrl,
        sector: tourPackage.sector,
        pace: tourPackage.pace,
        difficulty: tourPackage.difficulty,
        durationStr: tourPackage.durationStr,
        tags: tourPackage.tags,
        type: 'PACKAGE'
      })
    }

    // 2. Try to find in Business
    const business = await prisma.business.findUnique({
      where: { id }
    })

    if (business) {
      return Response.json({
        id: business.id,
        title: business.name,
        tagline: business.tagline || business.category,
        description: business.description || `A ${business.category} in ${business.locationSlug}.`,
        heroImage: business.imageUrl,
        sector: business.locationSlug || 'VALLE_SAGRADO',
        pace: 'FLEXIBLE',
        difficulty: 'EASY',
        durationStr: 'Flexible',
        tags: business.category,
        type: 'PLACE'
      })
    }

    // 3. Try to find in Business
    const transport = await prisma.business.findFirst({
      where: { id, category: 'TRANSPORT' }
    })

    if (transport) {
      return Response.json({
        id: transport.id,
        title: transport.name,
        tagline: `${transport.vehicleType} • ${transport.capacity} Pax`,
        description: `Reliable transport service provided by ${transport.name}. Vehicle type: ${transport.vehicleType}. Capacity: up to ${transport.capacity} passengers.`,
        heroImage: transport.imageUrl,
        sector: 'VALLE_SAGRADO',
        pace: 'FIXED',
        difficulty: 'EASY',
        durationStr: 'Point-to-Point',
        tags: `transport, ${transport.vehicleType}, ${transport.category}`,
        type: 'TRANSPORT'
      })
    }

    // 4. Try to find in Business
    const therapist = await prisma.business.findFirst({
      where: { id, category: 'WELLNESS' }
    })

    if (therapist) {
      let specialties = []
      try { specialties = JSON.parse(therapist.specialties) } catch (e) {}

      return Response.json({
        id: therapist.id,
        title: therapist.name,
        tagline: therapist.tagline,
        description: therapist.description || `Verified healer and sanctuary in ${therapist.locationSlug}.`,
        heroImage: therapist.imageUrl || therapist.heroImages?.[0],
        sector: therapist.locationSlug || 'VALLE_SAGRADO',
        pace: 'RELAXED',
        difficulty: 'EASY',
        durationStr: '60-90 min',
        tags: `wellness, healer, ${specialties.join(', ')}`,
        type: 'THERAPIST'
      })
    }

    return Response.json({ error: "Experience not found" }, { status: 404 })
  } catch (error) {
    console.error("Error in /api/experiences/[id]:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
