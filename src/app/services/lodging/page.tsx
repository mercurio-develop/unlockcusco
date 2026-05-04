import { prisma } from "@/lib/prisma"
import { BusinessCard } from "@/components/cards/business-card"
import Link from "next/link"
import { Search } from "lucide-react"

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

  const chip = (label: string, href: string, active: boolean) => (
    <Link
      key={label}
      href={href}
      className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors border ${
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
      }`}
    >
      {label}
    </Link>
  )

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const merged = { loc, type, q: query || undefined, ...overrides }
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v) })
    const s = params.toString()
    return `/services/lodging${s ? `?${s}` : ""}`
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-10 px-4 pt-24">
        <Link href="/services" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-block">
          ← Services
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-3">Lodging & Stays</h1>
        <p className="text-slate-500 mb-8 max-w-2xl">
          Find your perfect basecamp, from boutique hotels to immersive ecolodges surrounded by nature.
        </p>

        {/* Search */}
        <form method="GET" action="/services/lodging" className="mb-6 max-w-md">
          {loc && <input type="hidden" name="loc" value={loc} />}
          {type && <input type="hidden" name="type" value={type} />}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search lodging..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
            />
          </div>
        </form>

        {/* Location chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {chip("All", buildHref({ loc: undefined }), !loc)}
          {LOCATIONS.map((l) => chip(l, buildHref({ loc: l }), loc === l))}
        </div>

        {/* Type chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {chip("All types", buildHref({ type: undefined }), !type)}
          {TYPES.map((t) => chip(t, buildHref({ type: t }), type === t))}
        </div>

        <p className="text-sm text-slate-400 mb-6">{lodging.length} places</p>

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
