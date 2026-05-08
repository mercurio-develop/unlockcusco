import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
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

    // 2. Fetch Businesses
    const businesses = await prisma.business.findMany({
      where: {
        category: {
          notIn: ["TRANSPORT", "WELLNESS"]
        }
      },
      select: {
        id: true,
        name: true,
        locationSlug: true,
        category: true,
        lat: true,
        lng: true
      }
    })

    // 3. Fetch Transport
    const transport = await prisma.business.findMany({
      where: {
        category: "TRANSPORT"
      },
      select: {
        id: true,
        name: true,
        featuresJson: true,
        category: true,
        lat: true,
        lng: true
      }
    })

    // 4. Fetch Therapists
    const therapists = await prisma.business.findMany({
      where: {
        category: "WELLNESS"
      },
      select: {
        id: true,
        name: true,
        locationSlug: true,
        featuresJson: true,
        lat: true,
        lng: true
      }
    })

    // Map Tour Packages
    const formattedPackages = tourPackages.map(pkg => ({
      id: pkg.id,
      title: pkg.title,
      sector: pkg.sector,
      pace: pkg.pace,
      tags: pkg.tags || '',
      isPackage: true
    }))

    // Map Businesses
    const formattedBusinesses = businesses.map(b => ({
      id: b.id,
      title: b.name,
      sector: b.locationSlug || 'VALLE_SAGRADO',
      pace: 'FLEXIBLE',
      tags: b.category,
      lat: b.lat,
      lng: b.lng,
      isPackage: false
    }))

    // Map Transport
    const formattedTransport = transport.map(t => {
      let vehicleType = ""
      try {
        vehicleType = t.featuresJson ? JSON.parse(t.featuresJson).vehicleType || "" : ""
      } catch (e) {}
      return {
        id: t.id,
        title: t.name,
        sector: 'VALLE_SAGRADO',
        pace: 'FIXED',
        tags: `transport, ${vehicleType}, ${t.category}`,
        lat: t.lat,
        lng: t.lng,
        isPackage: false
      }
    })

    // Map Therapists
    const formattedTherapists = therapists.map(th => {
      let specialties = ""
      try {
        specialties = th.featuresJson ? JSON.parse(th.featuresJson).join(', ') : "wellness"
      } catch (e) {
        specialties = "wellness"
      }
      return {
        id: th.id,
        title: th.name,
        sector: th.locationSlug || 'VALLE_SAGRADO',
        pace: 'RELAXED',
        tags: `wellness, healer, ${specialties}`,
        lat: th.lat,
        lng: th.lng,
        isPackage: false
      }
    })

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
