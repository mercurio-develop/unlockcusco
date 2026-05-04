import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id

    // Try finding a TourPackage first
    const tourPackage = await prisma.tourPackage.findUnique({
      where: { id }
    })

    if (tourPackage) {
      return Response.json(tourPackage)
    }

    // Try finding a Business
    const business = await prisma.business.findUnique({
      where: { id }
    })

    if (business) {
      // Map Business to look like a TourPackage for the frontend preview
      return Response.json({
        id: business.id,
        title: business.name,
        heroImage: business.imageUrl,
        sector: business.locationSlug || 'VALLE_SAGRADO',
        pace: 'FLEXIBLE',
        tagline: business.category,
        durationStr: 'Flexible',
        difficulty: 'EASY',
        description: business.editorialSummary || 'A local business in the Sacred Valley.',
        tags: business.category
      })
    }

    return Response.json({ error: "Experience not found" }, { status: 404 })
  } catch (error: any) {
    console.error("Error in /api/experiences/[id]:", error)
    return Response.json({ error: "Internal Server Error", details: error.message, stack: error.stack }, { status: 500 })
  }
}
