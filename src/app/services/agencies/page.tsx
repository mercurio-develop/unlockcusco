import { getAllAgencies } from "@/features/agencies/queries"
import { ServicesView } from "@/features/services/components/services-view"
import type { Business } from "@prisma/client"

const SPECIALTIES = ["Trekking", "Culture", "Wellness", "Spiritual", "Photography"]

export default async function AgenciesPage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string; q?: string }>
}) {
  const { specialty, q } = await searchParams
  const query = q?.trim() ?? ""
  
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
      <ServicesView
        title="Exclusive audiences with the local experts of the Andes."
        subtitle="The Native Network"
        description="We partner exclusively with native-owned agencies and unlisted local sanctuaries. No middlemen, no tourist traps—just authentic Andean heritage."
        entities={agencies}
        basePath="/services/agencies"
        activeFilters={{ specialty, q: query || undefined }}
        filterGroups={[
          { key: "specialty", allLabel: "All specialties", options: SPECIALTIES.map(s => ({ label: s, value: s })) },
        ]}
        searchPlaceholder="Search agencies..."
        defaultSearchValue={query}
      />
    </div>
  )
}
