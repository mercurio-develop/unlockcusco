"use client"

import { useRef, useState, useEffect, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { LayoutGrid, Map as RouteMap, CalendarDays, Loader2 } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { ExploreSearch } from "./explore-search"
import { BusinessCard } from "@/features/business/components/business-card"
import { fetchBusinesses } from "@/features/business/actions/fetch-businesses"
import { useTrip } from "@/lib/store/trip-context"
import { ItineraryPanel } from "./itinerary-panel"
import { MacroItineraryCard } from "@/features/concierge/components/MacroItineraryCard"
import { ThreePaneLayout } from "@/components/layout/three-pane-layout"

import type { Business } from "@prisma/client"

interface ExploreViewProps {
  initialBusinesses: Business[]
  initialHasMore: boolean
  initialQuery: string
  initialSelectedId?: string | null
}

const ExploreMap = dynamic(() => import("@/features/explore/components/explore-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-50 animate-pulse" />
})

export function ExploreView({ initialBusinesses, initialHasMore, initialQuery, initialSelectedId }: ExploreViewProps) {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  const searchParams = useSearchParams()
  const { ref, inView } = useInView()
  const { panelMode, setPanelMode, activeItinerary, macroTrip, selectedId, setSelectedId } = useTrip()
  
  const [showFilters, setShowFilters] = useState(true)

  // Sync when server re-renders
  const [prevInitialBusinesses, setPrevInitialBusinesses] = useState(initialBusinesses)

  if (initialBusinesses !== prevInitialBusinesses) {
    setPrevInitialBusinesses(initialBusinesses)
    setBusinesses(initialBusinesses)
    setHasMore(initialHasMore)
    setPage(0)
    setShowFilters(true)
  }

  useEffect(() => {
    setSelectedId(initialSelectedId ?? null)
    setPanelMode("categories")
  }, [initialSelectedId, setSelectedId, setPanelMode])

  useEffect(() => {
    // Automatically hide filters when fetching more experiences to save space
    if (page > 0) {
      setShowFilters(false)
    }
  }, [page])

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
      console.error("Failed to fetch more:", error)
    } finally {
      setIsLoading(false)
    }
  }, [page, hasMore, isLoading, searchParams])

  useEffect(() => { if (inView) loadMore() }, [inView, loadMore])

  const sidebar = (
    <div className="px-6 pt-5 pb-4 bg-white border-b border-gray-100 flex flex-col gap-4 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif tracking-tight text-slate-900">Explore Vallecito</h1>
        {panelMode === "categories" && (
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-colors"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        )}
      </div>
      
      <div className="bg-slate-100 p-1 rounded-lg flex w-full">
        <button onClick={() => setPanelMode("categories")} className={`flex-1 flex justify-center items-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${panelMode === "categories" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><LayoutGrid className="w-4 h-4" /> Discover</button>
        {macroTrip && <button onClick={() => setPanelMode("macro")} className={`flex-1 flex justify-center items-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${panelMode === "macro" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><RouteMap className="w-4 h-4" /> Trip Plan</button>}
        <button onClick={() => setPanelMode("itinerary")} className={`flex-1 flex justify-center items-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${panelMode === "itinerary" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`} disabled={!activeItinerary}><CalendarDays className="w-4 h-4" /> Day View</button>
      </div>

      <div className={showFilters && panelMode === "categories" ? "block" : "hidden"}>
        <ExploreSearch 
          initialQuery={initialQuery} 
        />
      </div>
    </div>
  )

  const content = (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
      {panelMode === "macro" && macroTrip ? (
        <MacroItineraryCard itinerary={macroTrip} isExploreView={true} />
      ) : panelMode === "categories" ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 3xl:grid-cols-3 gap-6 pb-20">
           {businesses.map(e => (
             <BusinessCard key={e.id} business={e} isHighlighted={selectedId === e.id} onSelect={() => setSelectedId(e.id)} />
           ))}
           <div ref={ref} className="col-span-full h-10 flex justify-center">{isLoading && <Loader2 className="animate-spin text-rose-600" />}</div>
        </div>
      ) : (
        <ItineraryPanel />
      )}
    </div>
  )

  return (
    <ThreePaneLayout
      sidebar={sidebar}
      content={content}
      map={<ExploreMap businesses={businesses} selectedId={selectedId} onSelectBusiness={setSelectedId} />}
      showMap={panelMode !== 'macro'}
    />
  )
}
