import { prisma } from "@/lib/prisma"
import { ServicesView } from "@/features/services/components/services-view"


const LOCATIONS = ["pisac", "urubamba", "ollantaytambo", "cusco", "chinchero", "maras"]
const CATEGORIES = ["comida", "cafe", "bar", "vegan", "bakery"]

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<{ loc?: string; cat?: string; q?: string }>
}) {
  const { loc, cat, q } = await searchParams
  const query = q?.trim() ?? ""

  const where: any = { category: { in: ["Comida", "Cafe", "Dining"] } }
  if (loc) where.locationSlug = loc
  if (cat) where.category = cat
  if (query) {
    where.OR = [
      { name: { contains: query } },
    ]
  }

  const restaurants = await prisma.business.findMany({
    where,
    orderBy: [{ isClaimed: "desc" }, { rating: "desc" }],
  })

  const universalEntities = restaurants

  return (
    <div className="bg-white min-h-screen">
      <ServicesView
        title="Gastronomy & Local Flavors"
        subtitle="The Culinary Circle"
        description="Discover the rich flavors of the Sacred Valley, from high-end Andean fusion to cozy local organic cafes."
        entities={universalEntities}
        basePath="/services/restaurants"
        activeFilters={{ loc, cat, q: query || undefined }}
        filterGroups={[
          { key: "loc", allLabel: "All locations", options: LOCATIONS.map(l => ({ label: l, value: l })) },
          { key: "cat", allLabel: "All types", options: CATEGORIES.map(c => ({ label: c, value: c })) },
        ]}
        searchPlaceholder="Search flavors, towns..."
        defaultSearchValue={query}
      />
    </div>
  )
}
