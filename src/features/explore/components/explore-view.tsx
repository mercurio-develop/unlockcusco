"use client"

import { useRef, useState, useEffect, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { useSearchParams, useRouter } from "next/navigation"
import { LayoutGrid, Map as RouteMap, CalendarDays, Search } from "lucide-react"
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
  const searchParams = useSearchParams()
  const router = useRouter()
  const { panelMode, setPanelMode, activeItinerary, macroTrip, selectedId, setSelectedId, setIsChatOpen } = useTrip()
  
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
  }

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
        {macroTrip && <button onClick={() => setPanelMode("macro")} className={`flex-1 flex justify-center items-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${panelMode === "macro" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><RouteMap className="w-4 h-4" /> Trip Plan</button>}
        <button onClick={() => setPanelMode("itinerary")} className={`flex-1 flex justify-center items-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${panelMode === "itinerary" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><CalendarDays className="w-4 h-4" /> Day View</button>
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
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
      {panelMode === "macro" && macroTrip ? (
        <MacroItineraryCard itinerary={macroTrip} isExploreView={true} />
      ) : panelMode === "categories" ? (
        businesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-rose-100 rounded-full blur-2xl opacity-50 scale-150 animate-pulse" />
              <div className="relative bg-white p-6 rounded-full shadow-sm border border-slate-50">
                <Search className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-2xl font-serif tracking-tight text-slate-900 mb-3">No experiences found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
              The Valley is vast, but we couldn't find matches for these specific filters. Try expanding your search or resetting your preferences.
            </p>
            <button 
              onClick={() => router.push('/explore')}
              className="bg-slate-900 text-white px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 pb-20">
             {businesses.map(e => (
               <BusinessCard key={e.id} business={e} isHighlighted={selectedId === e.id} onSelect={() => setSelectedId(e.id)} />
             ))}
          </div>
        )
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
