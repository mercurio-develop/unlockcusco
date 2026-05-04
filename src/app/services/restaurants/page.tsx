import { prisma } from "@/lib/prisma"
import { BusinessCard } from "@/components/cards/business-card"
import Link from "next/link"
import { FilterBar } from "@/components/filters/filter-bar"
import { explorePath } from "@/paths"

const LOCATIONS = ["pisac", "urubamba", "ollantaytambo", "cusco", "chinchero", "maras"]
const MEALS = ["breakfast", "lunch", "dinner", "coffee"]

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<{ loc?: string; meal?: string; q?: string }>
}) {
  const { loc, meal, q } = await searchParams
  const query = q?.trim() ?? ""

  const where: Record<string, unknown> = { category: { contains: "Dining" } }
  if (loc) where.locationSlug = loc
  if (meal) where.name = { contains: meal }
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { editorialSummary: { contains: query } },
    ]
  }

  const restaurants = await prisma.business.findMany({
    where,
    orderBy: [{ isClaimed: "desc" }, { rating: "desc" }],
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-10 px-4 pt-24">
        <Link href="/services" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-block">
          ← Services
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-3">Restaurants</h1>
        <p className="text-slate-500 mb-2 max-w-2xl">
          Discover the best culinary experiences, from traditional Andean fusion to cozy local cafes.
        </p>
        <Link href={explorePath("Dining")} className="text-sm font-semibold text-rose-600 hover:text-rose-700 mb-8 inline-block">
          Explore on the map →
        </Link>

        <FilterBar 
          basePath="/services/restaurants"
          activeFilters={{ loc, meal, q: query || undefined }}
          filterGroups={[
            { key: "loc", allLabel: "All locations", options: LOCATIONS.map(l => ({ label: l, value: l })) },
            { key: "meal", allLabel: "All meals", options: MEALS.map(m => ({ label: m, value: m })) },
          ]}
          searchPlaceholder="Search restaurants..."
          defaultSearchValue={query}
          resultCount={restaurants.length}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {restaurants.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>

        {restaurants.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            No results.{" "}
            <Link href="/services/restaurants" className="text-rose-600 underline">Clear filters</Link>
          </div>
        )}
      </div>
    </div>
  )
}
