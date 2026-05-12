"use client"

import { useRef, useState, useEffect, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { useSearchParams, useRouter } from "next/navigation"
import { LayoutGrid, Map as RouteMap, CalendarDays, Search } from "lucide-react"
import { ExploreSearch } from "./explore-search"
import { DiscoverPanel } from "./DiscoverPanel"
import { BusinessCard } from "@/features/business/components/business-card"
import { fetchBusinesses } from "@/features/business/actions/fetch-businesses"
import { useTrip } from "@/lib/store/trip-context"
import { usePreferences } from "@/lib/store/preferences-context"
import { ItineraryPanel } from "./itinerary-panel"
import { MacroItineraryCard } from "@/features/concierge/components/MacroItineraryCard"
import { ThreePaneLayout } from "@/components/layout/three-pane-layout"
import { PlanningDatePicker } from "@/components/layout/planning-date-picker"

import type { Business } from "@prisma/client"

interface ExploreViewProps {
  initialBusinesses: Business[]
  initialMapBusinesses: Business[]
  initialCategoryCounts: Record<string, number>
  initialHasMore: boolean
  initialQuery: string
  initialSelectedId?: string | null
}

const ExploreMap = dynamic(() => import("@/features/explore/components/explore-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-50 animate-pulse" />
})

export function ExploreView({ 
  initialBusinesses, 
  initialMapBusinesses,
  initialCategoryCounts,
  initialHasMore, 
  initialQuery, 
  initialSelectedId 
}: ExploreViewProps) {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses || [])
  const [mapBusinesses, setMapBusinesses] = useState<Business[]>(initialMapBusinesses || [])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(initialCategoryCounts || {})
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { panelMode, setPanelMode, activeItinerary, macroTrip, selectedId, setSelectedId } = useTrip()
  const { setIsChatOpen } = usePreferences()
  
  const isDrawerOpen = searchParams.get("filter") === "open"
  const setIsDrawerOpen = (open: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    if (open) params.set("filter", "open")
    else params.delete("filter")
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Sync when server re-renders
  const [prevInitialBusinesses, setPrevInitialBusinesses] = useState(initialBusinesses)

  if (initialBusinesses !== prevInitialBusinesses) {
    setPrevInitialBusinesses(initialBusinesses)
    setBusinesses(initialBusinesses)
    setMapBusinesses(initialMapBusinesses)
    setCategoryCounts(initialCategoryCounts)
    setPage(0)
    setHasMore(initialHasMore)
  }

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    try {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", (page + 1).toString())
      params.set("limit", "30")
      
      const res = await fetch(`/api/businesses?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const result = await res.json()
      
      setBusinesses(prev => {
        // Simple deduplication based on ID just in case
        const existingIds = new Set(prev.map(b => b.id))
        const newBusinesses = (result.businesses || []).filter((b: Business) => !existingIds.has(b.id))
        return [...prev, ...newBusinesses]
      })
      setPage(p => p + 1)
      setHasMore(result.hasMore)
    } catch (error) {
      console.error("Failed to load more businesses:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [page, hasMore, isLoadingMore, searchParams])

  useEffect(() => {
    setSelectedId(initialSelectedId ?? null)
    setPanelMode("categories")
    // Auto-open concierge to guide the user
    setIsChatOpen(true)
  }, [initialSelectedId, setSelectedId, setPanelMode, setIsChatOpen])

  const sidebar = (
    <div className="px-6 pt-5 pb-4 bg-white border-b border-gray-100 flex flex-col gap-4 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif tracking-tight text-slate-900">Explore Vallecito</h1>
      </div>

      <div className="bg-slate-100 p-1 rounded-lg flex w-full">
        <button onClick={() => { setPanelMode("categories"); }} className={`flex-1 flex justify-center items-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${panelMode === "categories" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><LayoutGrid className="w-4 h-4" /> Discover</button>
        <button onClick={() => setPanelMode("route")} className={`flex-1 flex justify-center items-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${panelMode === "route" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><RouteMap className="w-4 h-4" /> My Route</button>
      </div>

      <div className={panelMode === "categories" ? "block" : "hidden"}>
        <ExploreSearch 
          initialQuery={initialQuery} 
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          categoryCounts={categoryCounts}
        />
      </div>
    </div>
  )

  const content = (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden text-slate-900">
      {panelMode === "categories" ? (
        <DiscoverPanel 
          businesses={businesses} 
          selectedId={selectedId} 
          setSelectedId={setSelectedId} 
          onReset={() => router.push('/explore')}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMore}
        />
      ) : (
        <ItineraryPanel />
      )}
    </div>
  )

  return (
    <ThreePaneLayout
      sidebar={sidebar}
      content={content}
      map={<ExploreMap businesses={mapBusinesses} selectedId={selectedId} onSelectBusiness={setSelectedId} />}
      showMap={panelMode !== 'macro'}
    />
  )
}
