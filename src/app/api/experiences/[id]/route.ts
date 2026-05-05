import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
