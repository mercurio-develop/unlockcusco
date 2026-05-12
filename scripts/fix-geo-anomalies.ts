import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const COORDS_MAP: Record<string, { lat: number, lng: number }> = {
  urubamba:      { lat: -13.3047, lng: -72.1167 },
  pisac:         { lat: -13.4217, lng: -71.8483 },
  cusco:         { lat: -13.5226, lng: -71.9673 },
  "machu-picchu":{ lat: -13.1631, lng: -72.5450 },
  yucay:         { lat: -13.3000, lng: -72.0833 },
  ollantaytambo: { lat: -13.2588, lng: -72.2633 },
  calca:         { lat: -13.3333, lng: -71.9667 },
  chinchero:     { lat: -13.3833, lng: -72.0500 },
  maras:         { lat: -13.3400, lng: -72.1500 },
  poroy:         { lat: -13.4900, lng: -72.0400 },
};

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

const MAX_DISTANCE_KM = 20;

async function main() {
  console.log("=== Fixing Geographic Location Mismatches ===")
  
  const businesses = await prisma.business.findMany({
    select: { id: true, name: true, locationSlug: true, lat: true, lng: true }
  })

  let updatedCount = 0

  for (const b of businesses) {
    if (b.lat === null || b.lng === null || b.lat === 0 || b.lng === 0) continue
    
    const locCenter = COORDS_MAP[b.locationSlug]
    if (!locCenter) continue 

    const distance = getDistanceFromLatLonInKm(b.lat, b.lng, locCenter.lat, locCenter.lng)

    // If the business is suspiciously far from its assigned town...
    if (distance > MAX_DISTANCE_KM) {
      // Find the *actual* closest town
      let closestTown = 'unknown'
      let minDistance = Infinity

      for (const [town, coords] of Object.entries(COORDS_MAP)) {
        const dist = getDistanceFromLatLonInKm(b.lat, b.lng, coords.lat, coords.lng)
        if (dist < minDistance) {
          minDistance = dist
          closestTown = town
        }
      }

      // If the closest town is significantly closer, update the database
      if (closestTown !== 'unknown' && closestTown !== b.locationSlug) {
        await prisma.business.update({
          where: { id: b.id },
          data: { locationSlug: closestTown }
        })
        console.log(`Moved "${b.name}" from ${b.locationSlug} to ${closestTown} (Distance improved: ${Math.round(distance)}km -> ${Math.round(minDistance)}km)`)
        updatedCount++
      }
    }
  }

  console.log(`\n=== Done. Total businesses relocated based on GPS coordinates: ${updatedCount} ===`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
