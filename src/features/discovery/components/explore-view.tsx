 
"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useQueryStates } from "nuqs"
import { searchParamsParsers } from "../search-params"
import { LayoutGrid, CalendarDays, Sparkles } from "lucide-react"
import { ExploreSearch } from "./explore-search"
import { ExplorePanel } from "./explore-panel"
import { useUiStore } from "@/lib/store/use-ui-store"
import { useItineraryStore } from "@/lib/store/use-itinerary-store"

import { ThreePaneLayout } from "@/components/layout/three-pane-layout"
import { ItineraryPanel } from "./itinerary-panel"
import { useExploreViewState } from "../hooks/use-explore-view"
import { getVisibleBusinesses, getEffectiveMapBusinesses } from "../utils/business-filters"
import { DICTIONARIES } from "../constants"

import type { OptimizedPlan } from "@/lib/ai/schemas/planner-schema"
import type { Business } from "@prisma/client"

interface ExploreViewProps {
  initialBusinesses: Business[]
  initialMapBusinesses: Business[]
  initialCategoryCounts: Record<string, number>
  initialHasMore: boolean
  initialQuery: string
  initialSelectedId?: string | null
  initialItinerary?: unknown
  dict?: Record<string, unknown>
}

const ExploreMap = dynamic(() => import("@/features/discovery/components/explore-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-50 animate-pulse" />
})
export function ExploreView({ 
  initialBusinesses, 
  initialMapBusinesses,
  initialCategoryCounts,
  initialHasMore, 
  initialQuery, 
  initialSelectedId,
  initialItinerary,
  dict
}: ExploreViewProps) {

  const [mapLoaded, setMapLoaded] = useState(false)

  const {
    businesses,
    mapBusinesses,
    categoryCounts,
    hasMore,
    isLoadingMore,
    mapBounds,
    setMapBounds,
    loadMore
  } = useExploreViewState({
    initialBusinesses,
    initialMapBusinesses,
    initialCategoryCounts,
    initialHasMore
  })

  // Set mapLoaded to true when we get our first set of mapBounds
  useEffect(() => {
    if (mapBounds && !mapLoaded) {
      setMapLoaded(true)
    }
  }, [mapBounds, mapLoaded])
  
  const [params, setParams] = useQueryStates(searchParamsParsers)
  const router = useRouter()
  const panelMode = useUiStore(s => s.panelMode);
  const setPanelMode = useUiStore(s => s.setPanelMode);
  const selectedId = useUiStore(s => s.selectedId);
  const setSelectedId = useUiStore(s => s.setSelectedId);
  const mapClickMode = useUiStore(s => s.mapClickMode);
  const setMapClickMode = useUiStore(s => s.setMapClickMode);
  const mapSearchResults = useUiStore(s => s.mapSearchResults);
  const isChatOpen = useUiStore(s => s.isChatOpen);
  const setIsChatOpen = useUiStore(s => s.setIsChatOpen);
  const conciergeSendMessage = useUiStore(s => s.conciergeSendMessage);

  const updateEndAnchorLocation = useItineraryStore(s => s.updateEndAnchorLocation);
  const setStartAnchorLocation = useItineraryStore(s => s.setStartAnchorLocation);

  const effectiveBusinesses = mapSearchResults && mapSearchResults.length > 0 ? (mapSearchResults as Business[]) : businesses;
  const isSearchActive = !!initialQuery;

  const visibleBusinesses = useMemo(() => {
    return getVisibleBusinesses(effectiveBusinesses, mapBounds, isSearchActive)
  }, [effectiveBusinesses, mapBounds, isSearchActive])

  const effectiveMapBusinesses = useMemo(() => {
    return getEffectiveMapBusinesses(mapBusinesses, mapSearchResults)
  }, [mapBusinesses, mapSearchResults])
  
  const isDefaultView = !params.q && !params.loc && !params.cat && !params.trip && !params.id && !initialItinerary;

  const isDrawerOpen = params.filter === "open"
  const setIsDrawerOpen = (open: boolean) => {
    setParams({ filter: open ? "open" : null })
  }

  useEffect(() => {
    if (initialSelectedId) {
      setSelectedId(initialSelectedId)
    }
  }, [initialSelectedId, setSelectedId])

  const initialTripId = (initialItinerary as (OptimizedPlan & { shortId?: string }) | undefined)?.shortId;
  const setMobileViewMode = useUiStore(s => s.setMobileViewMode);
  
  useEffect(() => {
    if (initialTripId) {
      setPanelMode("itinerary");
      setMobileViewMode("map");
    } else {
      setPanelMode("discover");
    }
  }, [initialTripId, setPanelMode, setMobileViewMode]);

  const d = DICTIONARIES.exploreView

  const sidebar = (
    <div className="px-6 pt-5 pb-4 bg-white border-b border-gray-100 flex flex-col gap-4 shadow-sm transition-all duration-300">


      <div className="hidden md:flex w-full justify-start overflow-x-auto scrollbar-hide gap-2 pb-1 px-0">
        <button title={d.discover} onClick={() => { setPanelMode("discover"); }} className={`shrink-0 flex items-center justify-center gap-1 md:gap-1.5 px-2.5 py-1.5 md:py-2 md:px-4 text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest rounded-full transition-all border ${panelMode === "discover" ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-sm"}`}><LayoutGrid className="w-3 h-3 md:w-4 md:h-4" /> <span>{d.discover}</span></button>
        <button title={d.concierge} onClick={() => setIsChatOpen(!isChatOpen)} className={`shrink-0 flex items-center justify-center gap-1 md:gap-1.5 px-2.5 py-1.5 md:py-2 md:px-4 text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest rounded-full transition-all border ${isChatOpen ? "bg-rose-600 text-white border-rose-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600 shadow-sm"}`}><Sparkles className={`w-3 h-3 md:w-4 md:h-4 ${isChatOpen ? 'text-white' : 'text-rose-500'}`} /> <span>{d.concierge}</span></button>
        <button title={d.itinerary} onClick={() => setPanelMode("itinerary")} className={`shrink-0 flex items-center justify-center gap-1 md:gap-1.5 px-2.5 py-1.5 md:py-2 md:px-4 text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest rounded-full transition-all border ${panelMode === "itinerary" ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-sm"}`}><CalendarDays className="w-3 h-3 md:w-4 md:h-4" /> <span>{d.itinerary}</span></button>
      </div>

      <div className={panelMode === "discover" ? "block" : "hidden"}>
        <ExploreSearch 
          initialQuery={initialQuery} 
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          categoryCounts={categoryCounts}
          dict={dict}
        />
      </div>
    </div>
  )
  const content = (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden text-slate-900">
      {panelMode === "discover" ? (
        <ExplorePanel
          businesses={visibleBusinesses}
          totalCount={effectiveMapBusinesses.length}
          selectedId={selectedId}
          setSelectedId={setSelectedId}          
          onReset={() => router.push('/explore')}
          hasMore={hasMore}
          isLoadingMore={!mapLoaded || isLoadingMore}
          onLoadMore={loadMore}
          dict={dict}
        />
      ) : panelMode === "itinerary" ? (
        <ItineraryPanel dict={dict} />
      ) : (
        <div className="p-8 text-center text-slate-500">{d.featureDisabled}</div>
      )}
    </div>
  )

  return (
    <ThreePaneLayout
      sidebar={sidebar}
      content={content}
      map={<ExploreMap isDefaultView={isDefaultView} businesses={effectiveMapBusinesses} selectedId={selectedId} categoryCounts={categoryCounts} currentLoc={params.loc || ""} onSelectBusiness={(id) => {
        setSelectedId(id);
        window.dispatchEvent(new CustomEvent('drawer-snap-half'));
      }} mapClickMode={mapClickMode} onMapAnchorPick={(lat, lng) => { 
        if (mapClickMode === 'start') {
          setStartAnchorLocation(lat, lng, 'Custom Start');
          if (conciergeSendMessage) conciergeSendMessage({ text: `[INTERNAL] I just updated my start location to coordinates ${lat.toFixed(5)}, ${lng.toFixed(5)}.` });
        } else if (mapClickMode === 'end') {
          updateEndAnchorLocation(lat, lng, 'Custom End');
          if (conciergeSendMessage) conciergeSendMessage({ text: `[INTERNAL] I just updated my end location to coordinates ${lat.toFixed(5)}, ${lng.toFixed(5)}.` });
        }
        setMapClickMode(null); 
      }} onBoundsChange={setMapBounds} dict={dict} />}
      showMap={true}
    />
  )
}
