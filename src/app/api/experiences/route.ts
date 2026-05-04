import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // We fetch both TourPackages and Businesses so the builder has access to all experiences
    
    // 1. Fetch Tour Packages
    const tourPackages = await prisma.tourPackage.findMany({
      select: { 
        id: true, 
        title: true, 
        sector: true, 
        pace: true, 
        tags: true, 
      }
    })

    // 2. Fetch Businesses (Experiences/Places)
    const businesses = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        locationSlug: true,
        category: true,
      }
    })

    // Map Tour Packages
    const formattedPackages = tourPackages.map(pkg => ({
      id: pkg.id,
      title: pkg.title,
      sector: pkg.sector,
      pace: pkg.pace,
      tags: pkg.tags || ''
    }))

    // Map Businesses
    const formattedBusinesses = businesses.map(b => ({
      id: b.id,
      title: b.name,
      sector: b.locationSlug || 'VALLE_SAGRADO',
      pace: 'FLEXIBLE', // Places usually don't have a rigid pace
      tags: b.category // Use category as tags
    }))

    // Combine both arrays
    const allExperiences = [...formattedPackages, ...formattedBusinesses]

    return Response.json(allExperiences)
  } catch (error) {
    console.error("Error in /api/experiences:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
