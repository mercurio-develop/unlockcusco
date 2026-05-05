"use client"

import { useState, useMemo } from "react"
import { THERAPISTS } from "@/features/therapists/data"
import { ServicesView } from "@/features/services/components/services-view"
import { UniversalService } from "@/lib/types/trip"

const ALL_SPECIALTIES = Array.from(
  new Set(THERAPISTS.flatMap(t => t.specialties))
).sort()

export default function TherapistsPage() {
  const [query, setQuery] = useState("")
  const [activeSpecialty, setActiveSpecialty] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return THERAPISTS.filter(t => {
      const matchesSearch = query === "" || 
        t.name.toLowerCase().includes(query.toLowerCase()) || 
        t.tagline.toLowerCase().includes(query.toLowerCase())
      
      const matchesSpecialty = activeSpecialty === null || 
        t.specialties.includes(activeSpecialty)
        
      return matchesSearch && matchesSpecialty
    })
  }, [query, activeSpecialty])

  const universalEntities: UniversalService[] = filtered.map(t => ({
    id: t.id || t.slug,
    slug: t.slug,
    type: 'THERAPIST',
    name: t.name,
    description: t.bio || "",
    tagline: t.tagline,
    imageUrl: t.imageUrl,
    rating: t.rating || undefined,
    reviewsCount: t.reviewsCount,
    whatsapp: t.whatsapp,
    locationLabel: t.location,
    category: 'Wellness',
    metadata: {
      specialties: t.specialties,
    }
  }))

  return (
    <div className="bg-white min-h-screen">
      <ServicesView
        title="Restoration for the high-altitude soul."
        subtitle="The Sanctuary Network"
        description="Tap into a private circle of verified therapists, healers, and sanctuaries. From deep tissue bodywork to ancestral sound rituals, we curate the valley's finest restorative experts."
        entities={universalEntities}
        basePath="/services/healers"
        activeFilters={{ specialty: activeSpecialty ?? undefined }}
        filterGroups={[
            { key: "specialty", allLabel: "All specialties", options: ALL_SPECIALTIES.map(s => ({ label: s, value: s })) },
        ]}
        onFilterChange={(key, value) => { if (key === "specialty") setActiveSpecialty(value) }}
        onSearchChange={setQuery}
        searchPlaceholder="Search healers, specialties..."
        defaultSearchValue={query}
      />
    </div>
  )
}
