"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { MapIcon, MapPinOff, Loader2, MapPin, Briefcase } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { ExploreSearch } from "./explore-search"
import { ServiceSearch } from "./service-search"
import { BusinessCard } from "@/components/cards/business-card"
import { ServiceCard } from "@/components/cards/service-card"
import { fetchBusinesses } from "@/features/business/actions/fetch-businesses"
import { useItinerary } from "@/lib/store/itinerary-context"
import { ItineraryPanel } from "./itinerary-panel"
import { CalendarDays, LayoutGrid } from "lucide-react"
import type { Business } from "@prisma/client"

interface ExploreViewProps {
  initialBusinesses: Business[]
  initialHasMore: boolean
  initialQuery: string
  initialSelectedId?: string | null
  initialMode?: 'place' | 'service'
}

const ExploreMap = dynamic(() => import("@/components/map/explore-map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-slate-50">
      <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
    </div>
  ),
})

export function ExploreView({ initialBusinesses, initialHasMore, initialQuery, initialSelectedId, initialMode = 'place' }: ExploreViewProps) {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'place' | 'service'>(initialMode)

  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [showDesktopMap, setShowDesktopMap] = useState(initialMode === 'place' && initialBusinesses.length > 0)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const searchParams = useSearchParams()
  const { ref, inView } = useInView()

  const { panelMode, setPanelMode, activeItinerary, selectedId, setSelectedId } = useItinerary()

  const switchMode = (next: 'place' | 'service') => {
    setMode(next)
    if (next === 'service') setShowDesktopMap(false)
    const params = new URLSearchParams(searchParams.toString())
    if (next === 'service') params.set('mode', 'service'); else params.delete('mode')
    // Reset category/search on mode switch
    params.delete('cat'); params.delete('q')
    router.push(`/explore?${params.toString()}`)
  }

  // Sync when server re-renders with new params
  useEffect(() => {
    const timer = setTimeout(() => {
      setBusinesses(initialBusinesses)
      setHasMore(initialHasMore)
      setPage(0)
      setMode(initialMode)
      setShowDesktopMap(initialMode === 'place' && initialBusinesses.length > 0)
      setSelectedId(initialSelectedId ?? null)
    }, 0)
    return () => clearTimeout(timer)
  }, [initialBusinesses, initialHasMore, initialSelectedId, initialMode, setSelectedId])

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    const nextPage = page + 1
    const query = searchParams.get("q") || ""
    const category = searchParams.get("cat") || ""
    const loc = searchParams.get("loc") || ""
    const currentMode = searchParams.get("mode") === 'service' ? 'service' : 'place'

    try {
      const res = await fetchBusinesses({ query, category, loc, page: nextPage, limit: 20, businessType: currentMode })
      setBusinesses(prev => [...prev, ...res.businesses])
      setPage(nextPage)
      setHasMore(res.hasMore)
    } catch (error) {
      console.error("Failed to fetch more:", error)
    } finally {
      setIsLoading(false)
    }
  }, [page, hasMore, isLoading, searchParams])

  useEffect(() => {
    if (inView) loadMore()
  }, [inView, loadMore])

  // Mapbox resize fix on layout transitions
  useEffect(() => {
    const timer = setTimeout(() => window.dispatchEvent(new Event('resize')), 550)
    return () => clearTimeout(timer)
  }, [viewMode, showDesktopMap, panelMode])

  const handleMarkerClick = (id: string) => {
    setSelectedId(id)
    const el = cardRefs.current.get(id)
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const isServiceMode = mode === 'service'

  return (
    <div className="h-[calc(100vh-56px)] w-full flex overflow-hidden bg-white font-sans relative">
      {/* Left panel */}
      <div className={`transition-all duration-500 ease-in-out ${showDesktopMap ? "w-full md:w-[45%] lg:w-[40%] xl:w-[35%]" : "w-full"} flex flex-col h-full relative z-10 border-r border-gray-200 bg-white ${viewMode === "map" ? "hidden md:flex" : ""}`}>

        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 bg-white z-10 sticky top-0 border-b border-gray-100 shadow-sm flex flex-col gap-4">

          {/* Title row */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-serif tracking-tight text-slate-900">
              {isServiceMode ? "Explore Services" : "Explore Vallecito"}
            </h1>
            {!isServiceMode && (
              <button
                onClick={() => setShowDesktopMap(!showDesktopMap)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm rounded-full text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                {showDesktopMap ? <MapPinOff className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
                {showDesktopMap ? "Hide Map" : "Map"}
              </button>
            )}
          </div>

          {/* Sub-tabs — only in Places mode */}
          {!isServiceMode && (
            <div className="bg-slate-100 p-1 rounded-lg flex w-full">
              <button
                onClick={() => setPanelMode("categories")}
                className={`flex-1 flex justify-center items-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${panelMode === "categories" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <LayoutGrid className="w-4 h-4" /> Discover
              </button>
              <button
                onClick={() => setPanelMode("itinerary")}
                className={`flex-1 flex justify-center items-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${panelMode === "itinerary" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"} ${!activeItinerary && "opacity-50 cursor-not-allowed"}`}
                disabled={!activeItinerary}
              >
                <CalendarDays className="w-4 h-4" />
                Itinerary
                {activeItinerary && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              </button>
            </div>
          )}

          {/* Search filters always visible now, except in itinerary mode we want the AI input to be prominent */}
          {isServiceMode ? (
            <ServiceSearch initialQuery={initialQuery} />
          ) : (
            <ExploreSearch initialQuery={initialQuery} isItineraryMode={panelMode === "itinerary"} />
          )}
        </div>

        {/* ── Content ── */}
        {isServiceMode ? (
          <ServiceList
            businesses={businesses}
            isLoading={isLoading}
            infiniteRef={ref}
          />
        ) : panelMode === "categories" ? (
          <PlacesList
            businesses={businesses}
            selectedId={selectedId}
            showDesktopMap={showDesktopMap}
            cardRefs={cardRefs}
            isLoading={isLoading}
            infiniteRef={ref}
            onSelect={(id) => setSelectedId(id)}
          />
        ) : (
          <div className="flex-1 overflow-hidden relative">
            <ItineraryPanel />
          </div>
        )}
      </div>

      {/* Map panel — only in Places mode */}
      {!isServiceMode && (
        <div className={`transition-all duration-500 ease-in-out ${showDesktopMap ? "w-full md:w-[55%] lg:w-[60%] xl:w-[65%]" : "w-0 translate-x-full opacity-0"} flex flex-col relative z-10 bg-slate-100 ${viewMode === "list" ? "hidden md:flex" : ""}`}>
          {showDesktopMap && (
            <ExploreMap
              businesses={businesses}
              selectedId={selectedId}
              onSelectBusiness={handleMarkerClick}
            />
          )}
        </div>
      )}

      {/* Mobile toggle — Places mode only */}
      {!isServiceMode && (
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center bg-white border border-gray-200 rounded-full p-1 shadow-2xl">
            <button onClick={() => setViewMode("list")} className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${viewMode === "list" ? "bg-slate-900 text-white" : "text-slate-600"}`}>List</button>
            <button onClick={() => setViewMode("map")} className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${viewMode === "map" ? "bg-slate-900 text-white" : "text-slate-600"}`}>Map</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PlacesList({ businesses, selectedId, showDesktopMap, cardRefs, isLoading, infiniteRef, onSelect }: {
  businesses: Business[]; selectedId: string | null; showDesktopMap: boolean
  cardRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
  isLoading: boolean; infiniteRef: (node?: Element | null) => void; onSelect: (id: string) => void
}) {
  if (businesses.length === 0) return (
    <div className="flex flex-col items-center justify-center flex-1 text-slate-400 space-y-2 p-8 text-center">
      <p className="text-lg font-medium text-slate-600">No places found.</p>
      <p className="text-sm">Try "massage", "ATV", or "coffee".</p>
    </div>
  )
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
      <div className={`grid grid-cols-1 ${showDesktopMap ? "2xl:grid-cols-2" : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"} gap-x-6 gap-y-8 pb-8 transition-all duration-500`}>
        {businesses.map((business, i) => (
          <div key={`${business.id}-${i}`} ref={el => { if (el) cardRefs.current.set(business.id, el); else cardRefs.current.delete(business.id) }}>
            <BusinessCard business={business} isHighlighted={selectedId === business.id} onSelect={() => onSelect(business.id)} />
          </div>
        ))}
      </div>
      <div ref={infiniteRef} className="flex justify-center h-16 pb-20">
        {isLoading && <Loader2 className="w-6 h-6 text-rose-600 animate-spin" />}
      </div>
    </div>
  )
}

function ServiceList({ businesses, isLoading, infiniteRef }: {
  businesses: Business[]; isLoading: boolean; infiniteRef: (node?: Element | null) => void
}) {
  if (businesses.length === 0 && !isLoading) return (
    <div className="flex flex-col items-center justify-center flex-1 text-slate-400 space-y-2 p-8 text-center">
      <Briefcase className="w-10 h-10 text-slate-200 mb-2" />
      <p className="text-lg font-medium text-slate-600">No services found.</p>
      <p className="text-sm">Try filtering by Taxi, Guide, or Agency.</p>
    </div>
  )
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
        {businesses.map((b, i) => <ServiceCard key={`${b.id}-${i}`} business={b} />)}
      </div>
      <div ref={infiniteRef} className="flex justify-center h-16 pb-20">
        {isLoading && <Loader2 className="w-6 h-6 text-rose-600 animate-spin" />}
      </div>
    </div>
  )
}
