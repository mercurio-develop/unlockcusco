"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { MapIcon, MapPinOff, Loader2 } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { ExploreSearch } from "./explore-search"
import { BusinessCard } from "@/components/cards/business-card"
import { fetchBusinesses } from "@/features/business/actions/fetch-businesses"

export type Business = {
  id: string
  slug: string
  name: string
  category: string
  lat: number
  lng: number
  rating: number | null
  reviewsCount: number
  imageUrl: string
  whatsapp: string | null
  isClaimed: boolean
  instagramHandle?: string | null
  instagramFollowers?: number
  heroImages?: string
}

interface ExploreViewProps {
  initialBusinesses: Business[]
  initialHasMore: boolean
  initialQuery: string
  initialSelectedId?: string | null
}

const ExploreMap = dynamic(() => import("@/components/map/explore-map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-[#09090B]">
      <p className="text-white/40 text-sm">Loading map…</p>
    </div>
  ),
})

export function ExploreView({ initialBusinesses, initialHasMore, initialQuery, initialSelectedId }: ExploreViewProps) {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null)
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [showDesktopMap, setShowDesktopMap] = useState(initialBusinesses.length > 0)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  
  const searchParams = useSearchParams()
  const { ref, inView } = useInView()

  // Sync state when props change due to Server Component re-rendering from search params
  useEffect(() => {
    setBusinesses(initialBusinesses)
    setHasMore(initialHasMore)
    setPage(0)
    setShowDesktopMap(initialBusinesses.length > 0)
  }, [initialBusinesses, initialHasMore])

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    const nextPage = page + 1
    
    const query = searchParams.get("q") || ""
    const category = searchParams.get("cat") || ""
    const loc = searchParams.get("loc") || ""

    try {
      const res = await fetchBusinesses({ query, category, loc, page: nextPage, limit: 20 })
      setBusinesses(prev => [...prev, ...res.businesses])
      setPage(nextPage)
      setHasMore(res.hasMore)
    } catch (error) {
      console.error("Failed to fetch more businesses:", error)
    } finally {
      setIsLoading(false)
    }
  }, [page, hasMore, isLoading, searchParams])

  useEffect(() => {
    if (inView) {
      loadMore()
    }
  }, [inView, loadMore])

  // Fix for Mapbox "half black" rendering when container size changes
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 550) // Wait for CSS transition to finish
    return () => clearTimeout(timer)
  }, [viewMode, showDesktopMap])

  const handleMarkerClick = (id: string) => {
    setSelectedId(id)
    const el = cardRefs.current.get(id)
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const handleCardSelect = (id: string) => {
    setSelectedId(id)
  }

  return (
    <div className="h-[calc(100vh-56px)] w-full flex overflow-hidden bg-[#09090B] font-sans relative">
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
      <div className={`transition-all duration-500 ease-in-out ${showDesktopMap ? "w-full md:w-[55%] lg:w-[60%]" : "w-full"} flex flex-col h-full relative z-10 border-r border-white/10 bg-[#09090B]/80 backdrop-blur-xl ${viewMode === "map" ? "hidden md:flex" : ""}`}>
        <div className="px-8 pt-8 pb-4 bg-transparent z-10 sticky top-0 border-b border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-serif tracking-tight text-white">
              Explore the INKAPORTAL
            </h1>
            <button
              onClick={() => setShowDesktopMap(!showDesktopMap)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              {showDesktopMap ? <MapPinOff className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
              {showDesktopMap ? "Hide Map" : "Show Map"}
            </button>
          </div>
          <ExploreSearch initialQuery={initialQuery} />
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {businesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-4">
              <p className="text-xl font-light">No places found for this search.</p>
              <p className="text-sm">Try &quot;massage&quot;, &quot;ATV&quot;, or &quot;restaurant&quot;.</p>
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-1 ${showDesktopMap ? "xl:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"} gap-8 pb-8 transition-all duration-500`}>
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
              
              {/* Infinite Scroll Trigger */}
              <div ref={ref} className="flex justify-center items-center h-16 pb-20">
                {isLoading && <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Map panel */}
      <div className={`transition-all duration-500 ease-in-out ${showDesktopMap ? "w-full md:w-[45%] lg:w-[40%] translate-x-0 opacity-100" : "w-0 translate-x-full opacity-0"} flex flex-col relative z-10 border-l border-white/10 ${viewMode === "list" ? "hidden md:flex" : ""}`}>
        {showDesktopMap && (
          <ExploreMap
            businesses={businesses}
            selectedId={selectedId}
            onSelectBusiness={handleMarkerClick}
          />
        )}
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
