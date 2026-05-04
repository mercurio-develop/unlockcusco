"use client"

import { useState, useMemo } from "react"
import { THERAPISTS } from "@/features/therapists/data"
import { TherapistCard } from "@/features/therapists/components/TherapistCard"
import { Navbar } from "@/components/layout/navbar"
import { FilterBar } from "@/components/filters/filter-bar"

const ALL_SPECIALTIES = Array.from(
  new Set(THERAPISTS.flatMap(t => t.specialties))
).sort()

export default function TherapistsPage() {
  const [query, setQuery] = useState("")
  const [activeSpecialty, setActiveSpecialty] = useState<string | null>(null)
  const [resetKey, setResetKey] = useState(0)

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

  const handleClear = () => {
    setQuery("")
    setActiveSpecialty(null)
    setResetKey(k => k + 1)
  }

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-24 sm:py-32">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <p className="text-rose-600 text-xs uppercase tracking-[0.3em] mb-4 font-bold">
            The Sanctuary Network
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight mb-6 leading-tight">
            Restoration for the <br/>
            <span className="text-slate-400 italic">high-altitude soul.</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed font-light">
            Tap into a private circle of verified therapists, healers, and sanctuaries. From deep tissue bodywork to ancestral sound rituals, we curate the valley&apos;s finest restorative experts.
          </p>
        </div>

        <FilterBar
          key={resetKey}
          activeFilters={{ specialty: activeSpecialty ?? undefined }}
          filterGroups={[{ key: "specialty", allLabel: "All specialties", options: ALL_SPECIALTIES.map(s => ({ label: s, value: s })) }]}
          onFilterChange={(key, value) => { if (key === "specialty") setActiveSpecialty(value) }}
          onSearchChange={setQuery}
          searchPlaceholder="Search healers, specialties..."
          defaultSearchValue={query}
          resultCount={filtered.length}
        />

        {/* Therapist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((therapist) => (
            <TherapistCard key={therapist.slug} therapist={therapist} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            No healers found.{" "}
            <button onClick={handleClear} className="text-rose-600 underline">Clear filters</button>
          </div>
        )}
      </main>
    </div>
  )
}
