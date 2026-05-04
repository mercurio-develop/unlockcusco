import { getAllAgencies } from "@/features/agencies/queries"
import { AgencyCard, ComingSoonCard } from "@/features/agencies/components/AgencyCard"
import { Navbar } from "@/components/layout/navbar"
import { FilterBar } from "@/components/filters/filter-bar"

const SPECIALTIES = ["Trekking", "Culture", "Wellness", "Spiritual", "Photography"]

export default async function AgenciesPage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string; q?: string }>
}) {
  const { specialty, q } = await searchParams
  const query = q?.trim() ?? ""
  
  // This fetches all agencies, then we filter them in memory for now
  const allAgencies = await getAllAgencies()
  
  let agencies = allAgencies
  
  if (specialty) {
    agencies = agencies.filter(a => {
      try {
        const specArray = JSON.parse(a.specialties || "[]") as string[]
        return specArray.some(s => s.toLowerCase() === specialty.toLowerCase())
      } catch {
        return false
      }
    })
  }
  
  if (query) {
    const queryLower = query.toLowerCase()
    agencies = agencies.filter(a => 
      a.name.toLowerCase().includes(queryLower) || 
      a.description.toLowerCase().includes(queryLower)
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-24 sm:py-32">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <p className="text-rose-600 text-xs uppercase tracking-[0.3em] mb-4 font-bold">
            The Native Network
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight mb-6 leading-tight">
            Exclusive audiences with the <br/>
            <span className="text-slate-400 italic">local experts of the Andes.</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed font-light">
            We partner exclusively with native-owned agencies and unlisted local sanctuaries. No middlemen, no tourist traps—just authentic Andean heritage.
          </p>
        </div>

        <FilterBar 
          basePath="/services/agencies"
          activeFilters={{ specialty, q: query || undefined }}
          filterGroups={[
            { key: "specialty", allLabel: "All specialties", options: SPECIALTIES.map(s => ({ label: s, value: s })) },
          ]}
          searchPlaceholder="Search agencies..."
          defaultSearchValue={query}
          resultCount={agencies.length}
        />

        {/* Agency Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agencies.map((agency) => (
            <AgencyCard key={agency.slug} agency={agency as any} />
          ))}
          <ComingSoonCard />
        </div>
      </main>
    </div>
  )
}
