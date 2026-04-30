"use client"

import { ArrowLeft, Star, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { therapistsPath } from "@/paths"

export function TherapistHero({ therapist }: { therapist: any }) {
  const router = useRouter()

  return (
    <div className="relative h-[80vh] w-full overflow-hidden bg-slate-900">
      {/* Cinematic Image */}
      <div className="absolute inset-0">
        <img 
          src={therapist.heroImage} 
          alt={therapist.name} 
          className="w-full h-full object-cover opacity-70 scale-105" 
        />
        <div className="absolute inset-0 bg-linear-to-b from-slate-900/40 via-transparent to-white" />
      </div>

      {/* Navigation */}
      <div className="absolute top-8 left-8 z-20">
        <button 
          onClick={() => router.push(therapistsPath())}
          className="flex items-center gap-2 text-white hover:text-rose-400 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Back to Sanctuary</span>
        </button>
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-16 left-0 w-full z-10 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-2xl overflow-hidden">
                <img src={therapist.imageUrl} className="w-full h-full object-cover" />
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1 flex items-center gap-2">
                 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                 <span className="text-white text-xs font-bold">{therapist.rating} · {therapist.reviewsCount} reviews</span>
              </div>
            </div>
            
            <span className="text-rose-600 font-bold tracking-[0.4em] uppercase text-[10px] mb-4 block">
              Verified Sanctuary Partner
            </span>
            <h1 className="text-6xl md:text-8xl font-serif text-slate-900 tracking-tighter mb-4 leading-tight">
              {therapist.name}
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 font-light italic leading-relaxed">
              {therapist.tagline}
            </p>
          </div>

          <div className="flex flex-col gap-2 items-start md:items-end pb-4">
             <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <MapPin className="w-4 h-4 text-rose-500" />
                {therapist.location}
             </div>
             <div className="flex gap-2">
               {therapist.specialties.map((s: string) => (
                 <span key={s} className="bg-slate-900 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                   {s}
                 </span>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
