import { THERAPISTS } from "@/features/therapists/data"
import { TherapistCard } from "@/features/therapists/components/TherapistCard"
import { Navbar } from "@/components/layout/navbar"

export default function TherapistsPage() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-24 sm:py-32">
        {/* Header */}
        <div className="max-w-2xl mb-20">
          <p className="text-rose-600 text-xs uppercase tracking-[0.3em] mb-4 font-bold">
            The Sanctuary Network
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight mb-6 leading-tight">
            Restoration for the <br/>
            <span className="text-slate-400 italic">high-altitude soul.</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed font-light">
            Tap into a private circle of verified therapists, healers, and sanctuaries. From deep tissue bodywork to ancestral sound rituals, we curate the valley's finest restorative experts.
          </p>
        </div>

        {/* Therapist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {THERAPISTS.map((therapist) => (
            <TherapistCard key={therapist.slug} therapist={therapist} />
          ))}
        </div>
      </main>
    </div>
  )
}
