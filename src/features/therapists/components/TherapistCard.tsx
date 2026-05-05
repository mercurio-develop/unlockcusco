import { Business, BusinessService } from "@prisma/client";
import { Star, MapPin, ArrowRight } from "lucide-react"
import Link from "next/link"
import { therapistPath } from "@/paths"

export function TherapistCard({ therapist }: { therapist: Business }) {
  return (
    <Link 
      href={therapistPath(therapist.slug)}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:shadow-xl transition-all duration-500"
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={therapist.imageUrl} 
          alt={therapist.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=600&auto=format&fit=crop";
            e.currentTarget.onerror = null;
          }}
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-bold text-slate-900">{therapist.rating}</span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{therapist.locationSlug}</span>
        </div>
        
        <h3 className="text-xl font-serif font-bold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">
          {therapist.name}
        </h3>
        
        <p className="text-sm text-slate-500 font-light leading-relaxed mb-6 line-clamp-2 italic">
          "{therapist.tagline}"
        </p>

        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {(JSON.parse(therapist.specialties || '[]')).slice(0, 2).map((s: string) => (
              <span key={s} className="bg-slate-50 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter">
                {s}
              </span>
            ))}
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  )
}
