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
  const R = 6371; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

function deg2rad(deg: number) { return deg * (Math.PI/180) }

async function main() {
  console.log("=== Fixing Strict Geographic Location Mismatches ===")
  
  const businesses = await prisma.business.findMany({
    select: { id: true, name: true, locationSlug: true, lat: true, lng: true }
  })

  let updatedCount = 0

  for (const b of businesses) {
    if (b.lat === null || b.lng === null || b.lat === 0 || b.lng === 0) continue
    if (!b.locationSlug) continue

    const currentLocCenter = COORDS_MAP[b.locationSlug]
    if (!currentLocCenter) continue 

    const currentDistance = getDistanceFromLatLonInKm(b.lat, b.lng, currentLocCenter.lat, currentLocCenter.lng)

    // Find the absolute closest town
    let closestTown = b.locationSlug
    let minDistance = currentDistance

    for (const [town, coords] of Object.entries(COORDS_MAP)) {
      const dist = getDistanceFromLatLonInKm(b.lat, b.lng, coords.lat, coords.lng)
      // If it is closer by at least 4km, we consider it belonging to that town
      if (dist < minDistance - 4) {
        minDistance = dist
        closestTown = town
      }
    }

    // Special safeguard: Don't move Cusco businesses to Poroy unless it's strictly Poroy
    if (closestTown === 'poroy' && b.locationSlug === 'cusco') {
      continue; 
    }

    if (closestTown !== b.locationSlug) {
      await prisma.business.update({
        where: { id: b.id },
        data: { locationSlug: closestTown }
      })
      console.log(`Moved "${b.name}" from ${b.locationSlug} to ${closestTown} (Distance improved: ${Math.round(currentDistance)}km -> ${Math.round(minDistance)}km)`)
      updatedCount++
    }
  }

  console.log(`\n=== Done. Total businesses relocated based on STRICT GPS coordinates: ${updatedCount} ===`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
