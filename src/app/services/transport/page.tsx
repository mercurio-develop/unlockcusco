import { prisma } from "@/lib/prisma"
import { TransportCard } from "@/features/transport/components/TransportCard"
import Link from "next/link"
import { FilterBar } from "@/components/filters/filter-bar"
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

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-24 sm:py-32">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <p className="text-rose-600 text-xs uppercase tracking-[0.3em] mb-4 font-bold">
            The Transport Network
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight mb-6 leading-tight">
            Reliable journeys through <br/>
            <span className="text-slate-400 italic">the heart of the valley.</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed font-light">
            We partner with the most trusted local drivers and transfer services. From private airport pickups to rugged 4x4 mountain exploration, we ensure your journey is as smooth as the destination.
          </p>
          <div className="mt-6">
            <Link href="/services" className="text-sm font-semibold text-rose-600 hover:text-rose-700">
              ← All Services
            </Link>
          </div>
        </div>

        <FilterBar 
          basePath="/services/transport"
          activeFilters={{ loc, type, q: query || undefined }}
          filterGroups={[
            { key: "loc", allLabel: "All locations", options: LOCATIONS.map(l => ({ label: l, value: l })) },
            { key: "type", allLabel: "All vehicles", options: VEHICLE_TYPES.map(t => ({ label: t, value: t })) },
          ]}
          searchPlaceholder="Search drivers, routes..."
          defaultSearchValue={query}
          resultCount={transport.length}
        />

        {/* Transport Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {transport.map((item) => (
            <TransportCard key={item.id} transport={item} />
          ))}
        </div>

        {transport.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            No transport options found matching your criteria.{" "}
            <Link href="/services/transport" className="text-rose-600 underline">Clear filters</Link>
          </div>
        )}
      </main>
    </div>
  )
}
