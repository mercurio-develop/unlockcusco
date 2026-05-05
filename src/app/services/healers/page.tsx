import { prisma } from "@/lib/prisma"
import { ServicesView } from "@/features/services/components/services-view"
import type { Business } from "@prisma/client"

export default async function TherapistsPage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string; q?: string }>
}) {
  const { specialty, q } = await searchParams
  const query = q?.trim() ?? ""

  const where: any = { category: "WELLNESS" }
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { tagline: { contains: query } }
    ]
  }
  if (specialty) {
    where.specialties = { contains: specialty }
  }

  const universalEntities = await prisma.business.findMany({
    where,
    orderBy: { rating: 'desc' }
  })

  // To keep it simple, we could query distinct specialties from the DB if needed, 
  // or just hardcode some common ones. 
  const ALL_SPECIALTIES = ["Sound Healing", "Massage", "Yoga", "Ceremony"]

  return (
    <div className="bg-white min-h-screen">
      <ServicesView
        title="Restoration for the high-altitude soul."
        subtitle="The Sanctuary Network"
        description="Tap into a private circle of verified therapists, healers, and sanctuaries. From deep tissue bodywork to ancestral sound rituals, we curate the valley's finest restorative experts."
        entities={universalEntities}
        basePath="/services/healers"
        activeFilters={{ specialty, q: query || undefined }}
        filterGroups={[
            { key: "specialty", allLabel: "All specialties", options: ALL_SPECIALTIES.map(s => ({ label: s, value: s })) },
        ]}
        searchPlaceholder="Search healers, specialties..."
        defaultSearchValue={query}
      />
    </div>
  )
}
