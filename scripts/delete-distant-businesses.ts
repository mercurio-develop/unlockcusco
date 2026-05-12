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

// Threshold beyond which a business is almost certainly not in the region
// e.g. 60km captures businesses mistakenly geocoded to Lima, Arequipa, or other countries.
const PURGE_THRESHOLD_KM = 60;

async function main() {
  console.log("=== Purging Distant/Out-of-Bounds Businesses ===")
  
  const businesses = await prisma.business.findMany({
    select: { id: true, name: true, locationSlug: true, lat: true, lng: true, category: true }
  })

  let deletedCount = 0

  for (const b of businesses) {
    if (b.lat === null || b.lng === null || b.lat === 0 || b.lng === 0) continue

    let minDistance = Infinity

    // Find the minimum distance to ANY of our supported towns
    for (const coords of Object.values(COORDS_MAP)) {
      const dist = getDistanceFromLatLonInKm(b.lat, b.lng, coords.lat, coords.lng)
      if (dist < minDistance) {
        minDistance = dist
      }
    }

    if (minDistance > PURGE_THRESHOLD_KM) {
      await prisma.business.delete({ where: { id: b.id } })
      console.log(`❌ Deleted: "${b.name}" [${b.category}]`)
      console.log(`   (Distance from nearest supported town: ${Math.round(minDistance)}km)`)
      deletedCount++
    }
  }

  console.log(`\n=== Done. Total out-of-bounds businesses deleted: ${deletedCount} ===`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
