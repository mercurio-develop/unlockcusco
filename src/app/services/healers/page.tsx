"use client"

import { useState, useMemo } from "react"
import { THERAPISTS } from "@/features/therapists/data"
import { TherapistCard } from "@/features/therapists/components/TherapistCard"
import { Navbar } from "@/components/layout/navbar"
import { Search } from "lucide-react"

const ALL_SPECIALTIES = Array.from(
  new Set(THERAPISTS.flatMap((t) => t.specialties))
).slice(0, 8)

export default function TherapistsPage() {
  const [query, setQuery] = useState("")
  const [activeSpecialty, setActiveSpecialty] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return THERAPISTS.filter((t) => {
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.specialties.some((s) => s.toLowerCase().includes(q))
      const matchesSpecialty =
        !activeSpecialty || t.specialties.includes(activeSpecialty)
      return matchesQuery && matchesSpecialty
    })
  }, [query, activeSpecialty])

  const chipClass = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors border ${
      active
        ? "bg-slate-900 text-white border-slate-900"
        : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
    }`

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-24 sm:py-32">
        <div className="max-w-2xl mb-12">
          <p className="text-rose-600 text-xs uppercase tracking-[0.3em] mb-4 font-bold">
            The Sanctuary Network
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight mb-6 leading-tight">
            Restoration for the <br />
            <span className="text-slate-400 italic">high-altitude soul.</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed font-light">
            Tap into a private circle of verified therapists, healers, and sanctuaries. From deep tissue bodywork to ancestral sound rituals.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search healers, specialties..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
          />
        </div>

        {/* Specialty chips */}
        <div className="flex flex-wrap gap-2 mb-10">
          <button onClick={() => setActiveSpecialty(null)} className={chipClass(!activeSpecialty)}>
            All
          </button>
          {ALL_SPECIALTIES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSpecialty(activeSpecialty === s ? null : s)}
              className={chipClass(activeSpecialty === s)}
            >
              {s}
            </button>
          ))}
        </div>

        <p className="text-sm text-slate-400 mb-8">{filtered.length} healers</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((therapist) => (
            <TherapistCard key={therapist.slug} therapist={therapist} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            No healers found.{" "}
            <button
              onClick={() => { setQuery(""); setActiveSpecialty(null) }}
              className="text-emerald-600 underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
