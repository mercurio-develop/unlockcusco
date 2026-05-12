import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const COORDS_MAP: Record<string, { lat: number, lng: number }> = {
  urubamba:      { lat: -13.3047, lng: -72.1167 },
  calca:         { lat: -13.3333, lng: -71.9667 },
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
  const businesses = await prisma.business.findMany({
    where: {
      locationSlug: { in: ['urubamba', 'calca'] }
    },
    select: { id: true, name: true, locationSlug: true, lat: true, lng: true, description: true }
  })

  const toMoveToCalca: any[] = []
  const toMoveToUrubamba: any[] = []

  for (const b of businesses) {
    const isUrubamba = b.locationSlug === 'urubamba'
    const isCalca = b.locationSlug === 'calca'

    const nameDesc = (b.name + " " + b.description).toLowerCase()

    // 1. Keyword Overrides
    if (isUrubamba && nameDesc.includes('calca') && !nameDesc.includes('urubamba')) {
      toMoveToCalca.push({ b, reason: 'Keyword "Calca" found, "Urubamba" missing' })
      continue
    }
    if (isCalca && nameDesc.includes('urubamba') && !nameDesc.includes('calca')) {
      toMoveToUrubamba.push({ b, reason: 'Keyword "Urubamba" found, "Calca" missing' })
      continue
    }

    // 2. Strict Distance Overrides (if GPS exists)
    if (b.lat && b.lng) {
      const distToUru = getDistanceFromLatLonInKm(b.lat, b.lng, COORDS_MAP.urubamba.lat, COORDS_MAP.urubamba.lng)
      const distToCalca = getDistanceFromLatLonInKm(b.lat, b.lng, COORDS_MAP.calca.lat, COORDS_MAP.calca.lng)

      // If it's in Urubamba, but it's significantly closer to Calca (e.g. > 5km closer to Calca)
      if (isUrubamba && distToCalca < distToUru - 5) {
        toMoveToCalca.push({ b, reason: `Geo: Closer to Calca (${distToCalca.toFixed(1)}km) than Urubamba (${distToUru.toFixed(1)}km)` })
      }
      
      // If it's in Calca, but significantly closer to Urubamba
      if (isCalca && distToUru < distToCalca - 5) {
        toMoveToUrubamba.push({ b, reason: `Geo: Closer to Urubamba (${distToUru.toFixed(1)}km) than Calca (${distToCalca.toFixed(1)}km)` })
      }
    }
  }

  console.log(`\n=== Suspected to belong in CALCA (${toMoveToCalca.length}) ===`)
  toMoveToCalca.forEach(item => {
    console.log(`- ${item.b.name} | Reason: ${item.reason}`)
  })

  console.log(`\n=== Suspected to belong in URUBAMBA (${toMoveToUrubamba.length}) ===`)
  toMoveToUrubamba.forEach(item => {
    console.log(`- ${item.b.name} | Reason: ${item.reason}`)
  })

  console.log("\nReview the above. If they look correct, we can execute the moves.")
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
