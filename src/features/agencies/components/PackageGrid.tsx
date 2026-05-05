import { Business, TourPackage } from "@prisma/client";
"use client"

import { useState } from "react"
import { ShieldCheck, Mountain, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function PackageGrid({ packages }: { packages: TourPackage[] }) {
  return (
    <section className="bg-slate-50 py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-[var(--accent)] text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
            Legacy Expeditions
          </p>
          <h2 className="text-4xl font-[var(--font-display)] text-[var(--primary)] tracking-tight">
            Multi-Day Treks
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PackageCard({ pkg }: { pkg: TourPackage }) {
  const [expanded, setExpanded] = useState(false)
  const included = JSON.parse(pkg.included || "[]")
  const gallery = JSON.parse(pkg.galleryJson || "[]")
  const mainImage = pkg.heroImage || gallery[0]?.url || "/images/og-default.jpg"

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group hover:shadow-xl transition-all duration-500">
      {/* Photo & Price */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={mainImage} 
          alt={pkg.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=600&auto=format&fit=crop";
            e.currentTarget.onerror = null;
          }}
        />
        <div className="absolute top-4 right-4 bg-[var(--primary)]/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
          ${pkg.basePriceUsd}
        </div>
        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="bg-white/90 backdrop-blur-md text-[var(--primary)] text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-sm flex items-center gap-1">
            <Mountain className="w-2.5 h-2.5" /> {pkg.difficulty}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pkg.durationStr}</span>
        </div>
        
        <h3 className="text-xl font-[var(--font-display)] font-bold text-[var(--primary)] mb-3 group-hover:text-[var(--accent)] transition-colors">
          {pkg.title}
        </h3>
        
        <p className="text-sm text-slate-500 font-light leading-relaxed mb-6 line-clamp-3">
          {pkg.tagline}
        </p>

        <div className="mt-auto">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest border-t border-slate-50 pt-6 group/btn"
          >
            What&apos;s included
            {expanded ? <ChevronUp className="w-3 h-3 text-[var(--accent)]" /> : <ChevronDown className="w-3 h-3 group-hover/btn:translate-y-0.5 transition-transform" />}
          </button>

          {expanded && (
            <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {included.map((item: string) => (
                <div key={item} className="flex items-center gap-2 text-xs text-slate-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
