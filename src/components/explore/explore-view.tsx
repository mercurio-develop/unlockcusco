"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { MapIcon, MapPinOff, Loader2 } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { ExploreSearch } from "./explore-search"
import { BusinessCard } from "@/components/cards/business-card"
import { fetchBusinesses } from "@/features/business/actions/fetch-businesses"
import { useItinerary } from "@/lib/store/itinerary-context"
import { ItineraryPanel } from "./itinerary-panel"
import { CalendarDays, LayoutGrid } from "lucide-react"

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
    <div className="flex items-center justify-center h-full w-full bg-slate-50">
      <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
    </div>
  ),
})

export function ExploreView({ initialBusinesses, initialHasMore, initialQuery, initialSelectedId }: ExploreViewProps) {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [showDesktopMap, setShowDesktopMap] = useState(initialBusinesses.length > 0)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  
  const searchParams = useSearchParams()
  const { ref, inView } = useInView()
  
  const { panelMode, setPanelMode, activeRelay, swapModeCategory, selectedId, setSelectedId } = useItinerary()

  // Sync state when props change due to Server Component re-rendering from search params
  useEffect(() => {
    const timer = setTimeout(() => {
      setBusinesses(initialBusinesses)
      setHasMore(initialHasMore)
      setPage(0)
      setShowDesktopMap(initialBusinesses.length > 0)
      if (initialSelectedId && initialSelectedId !== selectedId) {
         setSelectedId(initialSelectedId)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [initialBusinesses, initialHasMore, initialSelectedId, selectedId, setSelectedId])

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadMore()
    }
  }, [inView, loadMore])

  // Fix for Mapbox "half black" rendering when container size changes
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 550) // Wait for CSS transition to finish
    return () => clearTimeout(timer)
  }, [viewMode, showDesktopMap, panelMode])

  const handleMarkerClick = (id: string) => {
    setSelectedId(id)
    const el = cardRefs.current.get(id)
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const handleCardSelect = (id: string) => {
    setSelectedId(id)
  }

  return (
    <div className="h-[calc(100vh-56px)] w-full flex overflow-hidden bg-white font-sans relative">
      {/* Card list panel */}
      <div className={`transition-all duration-500 ease-in-out ${showDesktopMap ? "w-full md:w-[45%] lg:w-[40%] xl:w-[35%]" : "w-full"} flex flex-col h-full relative z-10 border-r border-gray-200 bg-white ${viewMode === "map" ? "hidden md:flex" : ""}`}>
        <div className="px-6 pt-6 pb-4 bg-white z-10 sticky top-0 border-b border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-serif tracking-tight text-slate-900">
              Explore the VALLECITO
            </h1>
            <button
              onClick={() => setShowDesktopMap(!showDesktopMap)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm rounded-full text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              {showDesktopMap ? <MapPinOff className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
              {showDesktopMap ? "Hide Map" : "Show Map"}
            </button>
          </div>

          <div className="bg-slate-100 p-1 rounded-lg flex w-full">
            <button 
              onClick={() => setPanelMode("categories")}
              className={`flex-1 flex justify-center items-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${panelMode === "categories" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <LayoutGrid className="w-4 h-4" /> Discover Places
            </button>
            <button 
              onClick={() => setPanelMode("itinerary")}
              className={`flex-1 flex justify-center items-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${panelMode === "itinerary" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"} ${!activeRelay && "opacity-50 cursor-not-allowed"}`}
              disabled={!activeRelay}
            >
              <CalendarDays className="w-4 h-4" /> Active Itinerary
            </button>
          </div>

          {panelMode === "categories" && <ExploreSearch initialQuery={initialQuery} />}
          {swapModeCategory && panelMode === "categories" && (
            <div className="bg-rose-50 text-rose-700 p-3 flex justify-between items-center rounded-md border border-rose-100 text-sm font-medium mt-2">
              <span>Select a replacement for {swapModeCategory}...</span>
            </div>
          )}
        </div>

        {panelMode === "categories" ? (
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
            {businesses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <p className="text-xl font-medium text-slate-600">No places found for this search.</p>
                <p className="text-sm">Try &quot;massage&quot;, &quot;ATV&quot;, or &quot;restaurant&quot;.</p>
              </div>
            ) : (
              <>
                <div className={`grid grid-cols-1 ${showDesktopMap ? "2xl:grid-cols-2" : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"} gap-x-6 gap-y-8 pb-8 transition-all duration-500`}>
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
                  {isLoading && <Loader2 className="w-6 h-6 text-rose-600 animate-spin" />}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-hidden relative">
             <ItineraryPanel />
          </div>
        )}
      </div>

      {/* Map panel */}
      <div className={`transition-all duration-500 ease-in-out ${showDesktopMap ? "w-full md:w-[55%] lg:w-[60%] xl:w-[65%] translate-x-0 opacity-100" : "w-0 translate-x-full opacity-0"} flex flex-col relative z-10 bg-slate-100 ${viewMode === "list" ? "hidden md:flex" : ""}`}>
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
        <div className="flex items-center bg-white border border-gray-200 rounded-full p-1 shadow-2xl">
          <button
            onClick={() => setViewMode("list")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              viewMode === "list" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              viewMode === "map" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Map
          </button>
        </div>
      </div>
    </div>
  )
}
