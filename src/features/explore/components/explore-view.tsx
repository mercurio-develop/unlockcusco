"use client"

import { useRef, useState, useEffect, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { LayoutGrid, Map as RouteMap, CalendarDays, Loader2 } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { ExploreSearch } from "./explore-search"
import { EntityCard } from "@/features/business/components/entity-card"
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
  const [localSearch, setLocalSearch] = useState("")
  
  const searchParams = useSearchParams()
  const { ref, inView } = useInView()
  const { panelMode, setPanelMode, activeItinerary, macroTrip, selectedId, setSelectedId } = useTrip()

  // Sync when server re-renders
  useEffect(() => {
    setBusinesses(initialBusinesses)
    setHasMore(initialHasMore)
    setPage(0)
    setSelectedId(initialSelectedId ?? null)
  }, [initialBusinesses, initialHasMore, initialSelectedId, setSelectedId])

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

  useEffect(() => { if (inView && !localSearch) loadMore() }, [inView, loadMore, localSearch])

  const filteredEntities = useMemo(() => 
    businesses
      .filter(b => {
        if (!localSearch) return true
        const s = localSearch.toLowerCase()
        return b.name.toLowerCase().includes(s) || b.category.toLowerCase().includes(s)
      })
  , [businesses, localSearch])

  const sidebar = (
    <div className="px-6 pt-5 pb-4 bg-white border-b border-gray-100 flex flex-col gap-4 shadow-sm">
      <h1 className="text-2xl font-serif tracking-tight text-slate-900">Explore Vallecito</h1>
      
      <div className="bg-slate-100 p-1 rounded-lg flex w-full">
        <button onClick={() => setPanelMode("categories")} className={`flex-1 flex justify-center items-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${panelMode === "categories" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><LayoutGrid className="w-4 h-4" /> Discover</button>
        {macroTrip && <button onClick={() => setPanelMode("macro")} className={`flex-1 flex justify-center items-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${panelMode === "macro" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><RouteMap className="w-4 h-4" /> Trip Plan</button>}
        <button onClick={() => setPanelMode("itinerary")} className={`flex-1 flex justify-center items-center gap-2 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${panelMode === "itinerary" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`} disabled={!activeItinerary}><CalendarDays className="w-4 h-4" /> Day View</button>
      </div>

      {panelMode === "categories" && (
        <ExploreSearch 
          initialQuery={initialQuery} 
          localSearch={localSearch}
          onLocalSearchChange={setLocalSearch}
        />
      )}
    </div>
  )

  const content = (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
      {panelMode === "macro" && macroTrip ? (
        <MacroItineraryCard itinerary={macroTrip} isExploreView={true} />
      ) : panelMode === "categories" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-20">
           {filteredEntities.map(e => (
             <EntityCard key={e.id} entity={e} isHighlighted={selectedId === e.id} onSelect={() => setSelectedId(e.id)} />
           ))}
           {!localSearch && (
             <div ref={ref} className="col-span-full h-10 flex justify-center">{isLoading && <Loader2 className="animate-spin text-rose-600" />}</div>
           )}
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
