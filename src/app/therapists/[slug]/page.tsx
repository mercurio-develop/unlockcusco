import { notFound } from "next/navigation"
import { THERAPISTS } from "@/features/therapists/data"
import { TherapistHero } from "@/features/therapists/components/TherapistHero"
import { SessionGrid } from "@/features/therapists/components/SessionGrid"
import { Navbar } from "@/components/layout/navbar"

export default async function TherapistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const therapist = THERAPISTS.find(t => t.slug === slug)

  if (!therapist) {
    notFound()
  }

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      
      <main>
        <TherapistHero therapist={therapist} />
        
        {/* Bio Section */}
        <section className="bg-white py-24 px-6 md:px-12 border-b border-slate-50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24">
            <div className="md:w-2/3">
              <h2 className="text-3xl font-serif text-slate-900 mb-8 tracking-tight">
                The Healing Philosophy
              </h2>
              <div className="space-y-6 text-lg text-slate-500 font-light leading-relaxed">
                <p>{therapist.bio}</p>
                <p>
                   Guided by the spirit of the Andes, we believe that true healing begins when we reconnect with the natural frequencies of the Earth. My practice is a bridge between the physical and the subtle, using touch and sound to restore balance to your expedition.
                </p>
              </div>
            </div>
            <div className="md:w-1/3">
               <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 flex flex-col gap-6">
                  <h4 className="font-serif font-bold text-slate-900">Lineage & Expertise</h4>
                  <div className="space-y-4">
                     {therapist.specialties.map((s: string) => (
                       <div key={s} className="flex items-center gap-3 text-xs font-bold text-slate-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          {s}
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </section>

        <SessionGrid services={therapist.services} therapistName={therapist.name} />
      </main>
    </div>
  )
}
