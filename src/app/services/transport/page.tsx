import { prisma } from "@/lib/prisma"
import { ServicesView } from "@/features/services/components/services-view"
import { mapTransportToUniversal } from "@/lib/utils/entity-mappers"
import { Navbar } from "@/components/layout/navbar"

const LOCATIONS = ["pisac", "urubamba", "ollantaytambo", "cusco", "airport", "calca", "maras"]
const VEHICLE_TYPES = ["Sedan", "SUV", "Van", "Moto-Taxi"]

export default async function TransportPage({
  searchParams,
}: {
  searchParams: Promise<{ loc?: string; type?: string; q?: string }>
}) {
  const { loc, type, q } = await searchParams
  const query = q?.trim() ?? ""

  const where: Record<string, unknown> = {}
  
  if (loc) {
    where.serviceZones = { contains: loc.toLowerCase() }
  }
  
  if (type) {
    where.vehicleType = type
  }
  
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { vehicleType: { contains: query } },
    ]
  }

  const transport = await prisma.transport.findMany({
    where,
    orderBy: { rating: "desc" },
  })

  const universalEntities = transport.map(mapTransportToUniversal)

  return (
    <div className="bg-white min-h-screen">
      <ServicesView
        title="Reliable journeys through the heart of the valley."
        subtitle="The Transport Network"
        description="We partner with the most trusted local drivers and transfer services. From private airport pickups to rugged 4x4 mountain exploration, we ensure your journey is as smooth as the destination."
        entities={universalEntities}
        basePath="/services/transport"
        activeFilters={{ loc, type, q: query || undefined }}
        filterGroups={[
          { key: "loc", allLabel: "All locations", options: LOCATIONS.map(l => ({ label: l, value: l })) },
          { key: "type", allLabel: "All vehicles", options: VEHICLE_TYPES.map(t => ({ label: t, value: t })) },
        ]}
        searchPlaceholder="Search drivers, routes..."
        defaultSearchValue={query}
      />
    </div>
  )
}
