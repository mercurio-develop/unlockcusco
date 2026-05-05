import { prisma } from "@/lib/prisma"
import { ServicesView } from "@/features/services/components/services-view"


const LOCATIONS = ["pisac", "urubamba", "ollantaytambo", "cusco", "chinchero", "maras"]
const TYPES = ["hotel", "hostel", "ecolodge", "glamping", "guesthouse"]

export default async function LodgingPage({
  searchParams,
}: {
  searchParams: Promise<{ loc?: string; type?: string; q?: string }>
}) {
  const { loc, type, q } = await searchParams
  const query = q?.trim() ?? ""

  const where: any = { category: "STAYS" }
  if (loc) where.locationSlug = loc
  if (type) where.name = { contains: type }
  if (query) {
    where.OR = [
      { name: { contains: query } },
    ]
  }

  const lodging = await prisma.business.findMany({
    where,
    orderBy: [{ isClaimed: "desc" }, { rating: "desc" }],
  })

  const universalEntities = lodging

  return (
    <div className="bg-white min-h-screen">
      <ServicesView
        title="Lodging & Stays"
        subtitle="The Basecamp Network"
        description="Find your perfect basecamp, from boutique hotels to immersive ecolodges surrounded by nature."
        entities={universalEntities}
        basePath="/services/lodging"
        activeFilters={{ loc, type, q: query || undefined }}
        filterGroups={[
          { key: "loc", allLabel: "All locations", options: LOCATIONS.map(l => ({ label: l, value: l })) },
          { key: "type", allLabel: "All types", options: TYPES.map(t => ({ label: t, value: t })) },
        ]}
        searchPlaceholder="Search lodging..."
        defaultSearchValue={query}
      />
    </div>
  )
}
