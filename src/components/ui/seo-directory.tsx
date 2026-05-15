"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

const LOCATIONS = [
  {
    id: "cusco",
    name: "Cusco",
    image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "urubamba",
    name: "Urubamba",
    image: "https://images.unsplash.com/photo-1579606038318-6ec7e0fc21d3?q=80&w=1200&auto=format&fit=crop" 
  },
  {
    id: "pisac",
    name: "Pisac",
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=800&auto=format&fit=crop" 
  },
  {
    id: "ollantaytambo",
    name: "Ollantaytambo",
    image: "https://images.unsplash.com/photo-1583098555845-e62f0fcdb492?q=80&w=800&auto=format&fit=crop" 
  },
  {
    id: "chinchero",
    name: "Chinchero",
    image: "https://images.unsplash.com/photo-1603513364998-251f22dc5d94?q=80&w=800&auto=format&fit=crop" 
  },
  {
    id: "maras",
    name: "Maras",
    image: "https://images.unsplash.com/photo-1596489371720-569d659d57a9?q=80&w=800&auto=format&fit=crop" 
  },
  {
    id: "yucay",
    name: "Yucay",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop" 
  },
  {
    id: "calca",
    name: "Calca",
    image: "https://images.unsplash.com/photo-1516815231560-8f41ec531527?q=80&w=800&auto=format&fit=crop" 
  }
]

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  dining:    { label: "Dining",    emoji: "🍽️" },
  wellness:  { label: "Wellness",  emoji: "🧘" },
  adventure: { label: "Adventure", emoji: "🥾" },
  stays:     { label: "Stays",     emoji: "🛌" },
  culture:   { label: "Culture",   emoji: "🏺" },
}

export function SeoDirectory() {
  const [activeId, setActiveId] = useState(LOCATIONS[0].id)
  const categories = Object.keys(CATEGORY_LABELS)

  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4 tracking-tight">Explore The Valley</h2>
            <p className="text-slate-500 text-lg font-light leading-relaxed">
              Discover the best local experiences, restaurants, hotels, and hidden gems across the Sacred Valley and Cusco.
            </p>
          </div>
        </div>

        {/* Typography Index */}
        <div className="flex flex-col relative border-t border-slate-200">
          {LOCATIONS.map((loc) => {
            const isActive = activeId === loc.id;

            return (
              <div 
                key={loc.id}
                onMouseEnter={() => setActiveId(loc.id)}
                onClick={() => setActiveId(loc.id)}
                className="group relative border-b border-slate-200 py-6 md:py-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between transition-colors"
              >
                {/* Text Section */}
                <div className="relative z-10 flex-1 transition-transform duration-500 ease-out md:group-hover:translate-x-4">
                  <h3 className={`text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight transition-colors duration-500 ${
                    isActive ? "text-slate-900" : "text-slate-300 group-hover:text-slate-400"
                  }`}>
                    {loc.name}
                  </h3>

                  {/* Expandable Categories */}
                  <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive ? "grid-rows-[1fr] opacity-100 mt-6" : "grid-rows-[0fr] opacity-0 mt-0"
                  }`}>
                    <div className="overflow-hidden">
                      <div className="flex flex-wrap gap-2 md:gap-3 pb-2">
                        {categories.map((cat) => {
                          const data = CATEGORY_LABELS[cat]
                          return (
                            <Link 
                              key={cat}
                              href={`/explore/${loc.id}/${cat}`}
                              className="bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 px-4 py-2 rounded-full text-[11px] md:text-xs font-medium uppercase tracking-widest transition-colors flex items-center gap-2"
                            >
                              <span className="text-sm md:text-base">{data.emoji}</span>
                              {data.label}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Image Preview (Desktop) */}
                <div className={`hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-80 lg:w-[400px] aspect-[4/3] rounded-3xl overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] origin-right ${
                  isActive ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 translate-x-8 pointer-events-none"
                }`}>
                  <Image 
                    src={loc.image} 
                    alt={loc.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1200px) 320px, 400px"
                  />
                  <div className="absolute inset-0 bg-slate-900/10" />
                </div>

                {/* Mobile Image Preview */}
                <div className={`md:hidden overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive ? "h-48 mt-6 opacity-100" : "h-0 mt-0 opacity-0"
                }`}>
                  <div className="relative w-full h-full rounded-2xl overflow-hidden">
                    <Image 
                      src={loc.image} 
                      alt={loc.name}
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}