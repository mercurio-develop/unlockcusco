import { ArrowRight, MapPin } from "lucide-react"
import Link from "next/link"
import { agencyPath } from "@/paths"

export function AgencyCard({ agency }: { agency: any }) {
  const specialties = JSON.parse(agency.specialties || "[]")
  const trekCount = agency.tourPackages?.filter((p: any) => p.durationDays > 1).length || 0
  const experienceCount = agency.tourPackages?.filter((p: any) => p.durationDays <= 1).length || 0

  return (
    <Link 
      href={agencyPath(agency.slug)}
      className="group relative h-[450px] w-full rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
    >
      {/* Photo with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={agency.imageUrl || "/images/og-default.jpg"} 
          alt={agency.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em]">
            {agency.location || "Sacred Valley"}
          </span>
        </div>
        
        <h3 className="text-3xl font-serif font-bold text-white mb-4 group-hover:text-rose-400 transition-colors">
          {agency.name}
        </h3>

        {/* Specialty Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {specialties.slice(0, 3).map((tag: string) => (
            <span key={tag} className="bg-slate-50 text-slate-900 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-white/20 pt-6">
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg">{trekCount}</span>
              <span className="text-white/60 text-[9px] uppercase font-bold tracking-widest">Treks</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg">{experienceCount}</span>
              <span className="text-white/60 text-[9px] uppercase font-bold tracking-widest">Days</span>
            </div>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:bg-rose-600 group-hover:translate-x-2 transition-all duration-300">
            <ArrowRight className="w-5 h-5 text-slate-900 group-hover:text-white" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export function ComingSoonCard() {
  return (
    <div className="h-[450px] w-full rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6">
        <ArrowRight className="w-8 h-8 text-slate-300 -rotate-45" />
      </div>
      <h3 className="text-xl font-serif font-bold text-slate-400 mb-2">Partner with Vallecito</h3>
      <p className="text-sm text-slate-400 leading-relaxed">
        We are selective about our agency partners. Native-owned, unlisted, and highly vetted experts only.
      </p>
      <button className="mt-8 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-rose-600 transition-colors">
        Inquire about partnership →
      </button>
    </div>
  )
}
