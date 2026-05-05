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
      where: {
        category: {
          notIn: ["TRANSPORT", "Transport", "Transporte", "Taxi", "WELLNESS", "Wellness", "Therapy", "THERAPY", "THERAPIST", "BIENESTAR"]
        }
      },
      select: {
        id: true,
        name: true,
        locationSlug: true,
        category: true,
      }
    })

    // 3. Fetch Transport
    const transport = await prisma.business.findMany({
      where: {
        category: { in: ["TRANSPORT", "Transport", "Transporte", "Taxi"] }
      },
      select: {
        id: true,
        name: true,
        featuresJson: true,
        category: true,
      }
    })

    // 4. Fetch Therapists
    const therapists = await prisma.business.findMany({
      where: {
        category: { in: ["WELLNESS", "Wellness", "Therapy", "THERAPY", "THERAPIST", "BIENESTAR"] }
      },
      select: {
        id: true,
        name: true,
        locationSlug: true,
        featuresJson: true,
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
      pace: 'FLEXIBLE',
      tags: b.category
    }))

    // Map Business
    const formattedTransport = transport.map(t => {
      let vehicleType = ""
      try {
        vehicleType = JSON.parse(t.featuresJson).vehicleType || ""
      } catch (e) {}
      return {
        id: t.id,
        title: t.name,
        sector: 'VALLE_SAGRADO',
        pace: 'FIXED',
        tags: `transport, ${vehicleType}, ${t.category}`
      }
    })

    // Map Therapists
    const formattedTherapists = therapists.map(th => {
      let specialties = ""
      try {
        specialties = JSON.parse(th.featuresJson).join(', ')
      } catch (e) {
        specialties = "wellness"
      }
      return {
        id: th.id,
        title: th.name,
        sector: th.locationSlug || 'VALLE_SAGRADO',
        pace: 'RELAXED',
        tags: `wellness, healer, ${specialties}`
      }
    })

    // Combine all arrays
    const allExperiences = [
      ...formattedPackages, 
      ...formattedBusinesses,
      ...formattedTransport,
      ...formattedTherapists
    ]

    return Response.json(allExperiences)
  } catch (error) {
    console.error("Error in /api/experiences:", error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
