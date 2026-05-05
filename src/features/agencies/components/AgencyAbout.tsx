import { MapPin } from "lucide-react"

export function AgencyAbout({ business }: { business: any }) {
  const specialties = JSON.parse(business.specialties || "[]")
  const initials = business.guideName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)

  return (
    <section className="bg-white py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24">
        
        {/* Description (2/3) */}
        <div className="md:w-2/3">
          <h2 className="text-3xl font-[var(--font-display)] text-[var(--primary)] mb-8 tracking-tight">
            Our Ancestral Mandate
          </h2>
          <div className="space-y-6 text-lg text-slate-500 font-light leading-relaxed">
            <p>{business.description}</p>
            <p>
              Every trek and ritual we lead is designed to honor the Apu (mountain spirits) and the Pachamama (Mother Earth). We don&apos;t just guide you through physical landscapes; we facilitate an inner descent into the wisdom of the high Andes.
            </p>
          </div>
        </div>

        {/* Guide Card (1/3) */}
        <div className="md:w-1/3">
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <MapPin className="w-32 h-32 text-[var(--primary)]" />
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[var(--accent)]/20">
                {initials}
              </div>
              <div>
                <h4 className="font-[var(--font-display)] font-bold text-[var(--primary)]">{business.guideName}</h4>
                <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                  <MapPin className="w-3 h-3" />
                  {business.location}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {specialties.map((spec: string) => (
                <div key={spec} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                  {spec}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
