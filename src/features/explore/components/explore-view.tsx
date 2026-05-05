"use client"

import { useRef, useState, useEffect, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { LayoutGrid, Map as RouteMap, CalendarDays } from "lucide-react"
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
  const searchParams = useSearchParams()
  const { panelMode, setPanelMode, activeItinerary, macroTrip, selectedId, setSelectedId } = useTrip()
  
  const [showFilters, setShowFilters] = useState(true)

  // Sync when server re-renders
  const [prevInitialBusinesses, setPrevInitialBusinesses] = useState(initialBusinesses)

  if (initialBusinesses !== prevInitialBusinesses) {
    setPrevInitialBusinesses(initialBusinesses)
    setBusinesses(initialBusinesses)
    setShowFilters(true)
  }

  useEffect(() => {
    setSelectedId(initialSelectedId ?? null)
    setPanelMode("categories")
  }, [initialSelectedId, setSelectedId, setPanelMode])

  const sidebar = (
    <div className="px-6 pt-5 pb-4 bg-white border-b border-gray-100 flex flex-col gap-4 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif tracking-tight text-slate-900">Explore Vallecito</h1>
      </div>

      <div className="bg-slate-100 p-1 rounded-lg flex w-full">
        <button onClick={() => setPanelMode("categories")} className={`flex-1 flex justify-center items-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${panelMode === "categories" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><LayoutGrid className="w-4 h-4" /> Discover</button>
        {macroTrip && <button onClick={() => setPanelMode("macro")} className={`flex-1 flex justify-center items-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${panelMode === "macro" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><RouteMap className="w-4 h-4" /> Trip Plan</button>}
        <button onClick={() => setPanelMode("itinerary")} className={`flex-1 flex justify-center items-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${panelMode === "itinerary" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`} disabled={!activeItinerary}><CalendarDays className="w-4 h-4" /> Day View</button>
      </div>

      <div className={panelMode === "categories" ? "block" : "hidden"}>
        <ExploreSearch 
          initialQuery={initialQuery} 
        />
      </div>    </div>  )

  const content = (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
      {panelMode === "macro" && macroTrip ? (
        <MacroItineraryCard itinerary={macroTrip} isExploreView={true} />
      ) : panelMode === "categories" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 pb-20">
           {businesses.map(e => (
             <BusinessCard key={e.id} business={e} isHighlighted={selectedId === e.id} onSelect={() => setSelectedId(e.id)} />
           ))}
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
