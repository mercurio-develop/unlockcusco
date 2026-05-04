import { prisma } from "@/lib/prisma"
import { AgencyCard, ComingSoonCard } from "@/features/agencies/components/AgencyCard"
import { Navbar } from "@/components/layout/navbar"
import Link from "next/link"
import { Search } from "lucide-react"

const SPECIALTIES = ["trekking", "cultural", "wellness", "adventure", "machu picchu"]

export default async function AgenciesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; specialty?: string }>
}) {
  const { q, specialty } = await searchParams
  const query = q?.trim() ?? ""

  const where: Record<string, unknown> = {}
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { description: { contains: query } },
      { specialties: { contains: query } },
    ]
  }
  if (specialty) where.specialties = { contains: specialty }

  const agencies = await prisma.agency.findMany({
    where,
    include: { tourPackages: true },
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
    const merged = { q: query || undefined, specialty, ...overrides }
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v) })
    const s = params.toString()
    return `/services/agencies${s ? `?${s}` : ""}`
  }

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-24 sm:py-32">
        <div className="max-w-2xl mb-12">
          <p className="text-rose-600 text-xs uppercase tracking-[0.3em] mb-4 font-bold">
            The Native Network
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight mb-6 leading-tight">
            Exclusive audiences with the <br />
            <span className="text-slate-400 italic">local experts of the Andes.</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed font-light">
            We partner exclusively with native-owned agencies and unlisted local sanctuaries. No middlemen, no tourist traps—just authentic Andean heritage.
          </p>
        </div>

        {/* Search */}
        <form method="GET" action="/services/agencies" className="mb-6 max-w-md">
          {specialty && <input type="hidden" name="specialty" value={specialty} />}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search agencies..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
            />
          </div>
        </form>

        {/* Specialty chips */}
        <div className="flex flex-wrap gap-2 mb-10">
          {chip("All", buildHref({ specialty: undefined }), !specialty)}
          {SPECIALTIES.map((s) => chip(s, buildHref({ specialty: s }), specialty === s))}
        </div>

        <p className="text-sm text-slate-400 mb-8">{agencies.length} agencies</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agencies.map((agency) => (
            <AgencyCard key={agency.slug} agency={agency as any} />
          ))}
          <ComingSoonCard />
        </div>

        {agencies.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            No agencies found.{" "}
            <Link href="/services/agencies" className="text-rose-600 underline">Clear filters</Link>
          </div>
        )}
      </main>
    </div>
  )
}
