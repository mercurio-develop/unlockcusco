"use client"

import { useRef, useState } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { ExploreSearch } from "./explore-search"
import { BusinessCard } from "@/components/cards/business-card"

export type Business = {
  id: string
  name: string
  category: string
  lat: number
  lng: number
  rating: number | null
  reviewsCount: number
  imageUrl: string
  whatsapp: string | null
  isClaimed: boolean
}

interface ExploreViewProps {
  businesses: Business[]
  initialQuery: string
}

const ExploreMap = dynamic(() => import("@/components/map/explore-map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-[#09090B]">
      <p className="text-white/40 text-sm">Loading map…</p>
    </div>
  ),
})

export function ExploreView({ businesses, initialQuery }: ExploreViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const handleMarkerClick = (id: string) => {
    setSelectedId(id)
    const el = cardRefs.current.get(id)
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const handleCardSelect = (id: string) => {
    setSelectedId(id)
  }

  return (
    <div className="h-[calc(100vh-64px)] w-full flex overflow-hidden bg-[#09090B] font-sans relative">
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay pointer-events-none">
        <Image
          src="https://images.unsplash.com/photo-1526392060635-9d60198d3fe3?q=80&w=3000&auto=format&fit=crop"
          className="w-full h-full object-cover"
          alt="Andes Mountains"
          fill
          priority
          unoptimized
        />
      </div>

      {/* Card list panel */}
      <div className={`w-full md:w-[55%] lg:w-[60%] flex flex-col h-full relative z-10 border-r border-white/10 bg-[#09090B]/80 backdrop-blur-xl ${viewMode === "map" ? "hidden md:flex" : ""}`}>
        <div className="px-8 pt-8 pb-4 bg-transparent z-10 sticky top-0 border-b border-white/10">
          <h1 className="text-3xl font-serif tracking-tight text-white mb-6">
            Explore the InkaPortal
          </h1>
          <ExploreSearch initialQuery={initialQuery} />
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {businesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-4">
              <p className="text-xl font-light">No places found for this search.</p>
              <p className="text-sm">Try &quot;massage&quot;, &quot;ATV&quot;, or &quot;restaurant&quot;.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-20">
              {businesses.map((business, i) => (
                <div
                  key={`${business.id}-${i}`}
                  ref={(el) => {
                    if (el) cardRefs.current.set(business.id, el)
                    else cardRefs.current.delete(business.id)
                  }}
                >
                  <BusinessCard
                    business={business}
                    isHighlighted={selectedId === business.id}
                    onSelect={() => handleCardSelect(business.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map panel */}
      <div className={`w-full md:w-[45%] lg:w-[40%] flex flex-col relative z-10 border-l border-white/10 ${viewMode === "list" ? "hidden md:flex" : ""}`}>
        <ExploreMap
          businesses={businesses}
          selectedId={selectedId}
          onSelectBusiness={handleMarkerClick}
        />
      </div>

      {/* Mobile view toggle */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center bg-[#09090B]/90 backdrop-blur-xl border border-white/20 rounded-full p-1 shadow-2xl">
          <button
            onClick={() => setViewMode("list")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              viewMode === "list" ? "bg-white text-black" : "text-white/70 hover:text-white"
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              viewMode === "map" ? "bg-[#D4AF37] text-black" : "text-white/70 hover:text-white"
            }`}
          >
            Map
          </button>
        </div>
      </div>
    </div>
  )
}
