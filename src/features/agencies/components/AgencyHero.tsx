import { Business, TourPackage } from "@prisma/client";
"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { agenciesPath } from "@/paths"

export function AgencyHero({ business }: { business: Business & { tourPackages?: TourPackage[] } }) {
  const router = useRouter()

  return (
    <div className="relative h-[70vh] w-full overflow-hidden bg-[var(--primary)]">
      {/* Hero Image with Gradient */}
      <div className="absolute inset-0">
        <img 
          src={business.imageUrl} 
          alt={business.name} 
          className="w-full h-full object-cover opacity-60" 
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1200&auto=format&fit=crop";
            e.currentTarget.onerror = null;
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-[var(--primary)]/60 via-transparent to-[var(--primary)]" />
      </div>

      {/* Navigation */}
      <div className="absolute top-8 left-8 z-20">
        <button 
          onClick={() => router.push(agenciesPath())}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Back to Network</span>
        </button>
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
        <span className="text-[var(--accent)] font-bold tracking-[0.4em] uppercase text-xs mb-6">
          Authorized Business Partner
        </span>
        <h1 className="text-6xl md:text-8xl font-[var(--font-display)] text-white tracking-tighter mb-4 leading-tight">
          {business.name}
        </h1>
        <p className="text-xl md:text-2xl text-white/90 font-light italic tracking-wide max-w-2xl">
          {business.tagline}
        </p>
      </div>
    </div>
  )
}
