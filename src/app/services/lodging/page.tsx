import { prisma } from "@/lib/prisma"
import { BusinessCard } from "@/components/cards/business-card"
import Link from "next/link"
import { FilterBar } from "@/components/filters/filter-bar"
import { explorePath } from "@/paths"

const LOCATIONS = ["pisac", "urubamba", "ollantaytambo", "cusco", "chinchero", "maras"]
const TYPES = ["hotel", "hostel", "ecolodge", "glamping", "guesthouse"]

export default async function LodgingPage({
  searchParams,
}: {
  searchParams: Promise<{ loc?: string; type?: string; q?: string }>
}) {
  const { loc, type, q } = await searchParams
  const query = q?.trim() ?? ""

  const where: Record<string, unknown> = { category: { in: ["Stays", "Descanso"] } }
  if (loc) where.locationSlug = loc
  if (type) where.name = { contains: type }
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { editorialSummary: { contains: query } },
    ]
  }

  const lodging = await prisma.business.findMany({
    where,
    orderBy: [{ isClaimed: "desc" }, { rating: "desc" }],
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-10 px-4 pt-24">
        <Link href="/services" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-block">
          ← Services
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-3">Lodging & Stays</h1>
        <p className="text-slate-500 mb-2 max-w-2xl">
          Find your perfect basecamp, from boutique hotels to immersive ecolodges surrounded by nature.
        </p>
        <Link href={explorePath("Stays")} className="text-sm font-semibold text-rose-600 hover:text-rose-700 mb-8 inline-block">
          Explore on the map →
        </Link>

        <FilterBar 
          basePath="/services/lodging"
          activeFilters={{ loc, type, q: query || undefined }}
          filterGroups={[
            { key: "loc", allLabel: "All locations", options: LOCATIONS.map(l => ({ label: l, value: l })) },
            { key: "type", allLabel: "All types", options: TYPES.map(t => ({ label: t, value: t })) },
          ]}
          searchPlaceholder="Search lodging..."
          defaultSearchValue={query}
          resultCount={lodging.length}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {lodging.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>

        {lodging.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            No results.{" "}
            <Link href="/services/lodging" className="text-indigo-600 underline">Clear filters</Link>
          </div>
        )}
      </div>
    </div>
  )
}
