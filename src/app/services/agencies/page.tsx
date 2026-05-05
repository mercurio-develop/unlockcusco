import { getAllAgencies } from "@/features/agencies/queries"
import { ServicesView } from "@/features/services/components/services-view"
import { UniversalService } from "@/lib/types/trip"

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

  const universalEntities: UniversalService[] = agencies.map(a => ({
    id: a.id,
    slug: a.slug,
    type: 'AGENCY',
    name: a.name,
    description: a.description,
    tagline: a.tagline,
    imageUrl: a.imageUrl,
    rating: a.rating || undefined,
    reviewsCount: a.reviewsCount,
    whatsapp: a.whatsapp,
    locationLabel: a.location,
    category: a.category,
    metadata: {
      specialties: JSON.parse(a.specialties || "[]"),
    },
    _raw: { business: a as any } // Agencies are currently mapped loosely
  }))

  return (
    <div className="bg-white min-h-screen">
      <ServicesView
        title="Exclusive audiences with the local experts of the Andes."
        subtitle="The Native Network"
        description="We partner exclusively with native-owned agencies and unlisted local sanctuaries. No middlemen, no tourist traps—just authentic Andean heritage."
        entities={universalEntities}
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
