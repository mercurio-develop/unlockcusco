"use client"

import { useRef, useState, useEffect, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { useSearchParams, useRouter } from "next/navigation"
import { LayoutGrid, Map as RouteMap, CalendarDays, Search, Sparkles } from "lucide-react"
import { ExploreSearch } from "./explore-search"
import { DiscoverPanel } from "./DiscoverPanel"
import { BusinessCard } from "@/features/discovery/components/business-card"
import { fetchBusinesses } from "@/features/discovery/actions/fetch-businesses"
import { useTrip } from "@/lib/store/trip-context"
import { usePreferences } from "@/lib/store/preferences-context"
import { ThreePaneLayout } from "@/components/layout/three-pane-layout"
import { ItineraryPanel } from "./itinerary-panel"

import type { Business } from "@prisma/client"

interface ExploreViewProps {
  initialBusinesses: Business[]
  initialMapBusinesses: Business[]
  initialCategoryCounts: Record<string, number>
  initialHasMore: boolean
  initialQuery: string
  initialSelectedId?: string | null
  dict?: any
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
  dict
}: ExploreViewProps) {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses || [])
  const [mapBusinesses, setMapBusinesses] = useState<Business[]>(initialMapBusinesses || [])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(initialCategoryCounts || {})
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [mapBounds, setMapBounds] = useState<[number, number, number, number] | null>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const { panelMode, setPanelMode, activeItinerary, selectedId, setSelectedId, mapClickMode, setMapClickMode, updateEndAnchorLocation, setStartAnchorLocation, mapSearchResults } = useTrip()
  const { isChatOpen, setIsChatOpen } = usePreferences()

  const effectiveBusinesses = mapSearchResults && mapSearchResults.length > 0 ? (mapSearchResults as Business[]) : businesses;

  const isSearchActive = !!initialQuery;

  const visibleBusinesses = useMemo(() => {
    if (isSearchActive) return effectiveBusinesses;
    if (!mapBounds) return [];
    if (effectiveBusinesses.length === 0) return effectiveBusinesses;
    const [west, south, east, north] = mapBounds;
    const centerLat = (south + north) / 2;
    const centerLng = (west + east) / 2;

    const inside: Business[] = [];
    const outside: Business[] = [];

    effectiveBusinesses.forEach(b => {
      if (b.lat == null || b.lng == null) {
        outside.push(b);
        return;
      }
      const lat = Number(b.lat);
      const lng = Number(b.lng);
      if (lng >= west && lng <= east && lat >= south && lat <= north) {
        inside.push(b);
      } else {
        outside.push(b);
      }
    });

    outside.sort((a, b) => {
      if (a.lat == null || a.lng == null) return 1;
      if (b.lat == null || b.lng == null) return -1;
      const distA = Math.pow(Number(a.lat) - centerLat, 2) + Math.pow(Number(a.lng) - centerLng, 2);
      const distB = Math.pow(Number(b.lat) - centerLat, 2) + Math.pow(Number(b.lng) - centerLng, 2);
      return distA - distB;
    });

    return [...inside, ...outside];
  }, [effectiveBusinesses, mapBounds, isSearchActive]);

  const effectiveMapBusinesses = useMemo(() => {
    if (!mapSearchResults || mapSearchResults.length === 0) return mapBusinesses;
    const searchMap = new Map((mapSearchResults as Business[]).map(b => [b.id, b]));
    const otherBusinesses = mapBusinesses.filter(b => !searchMap.has(b.id));
    return [...Array.from(searchMap.values()), ...otherBusinesses];
  }, [mapSearchResults, mapBusinesses]);
  
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
    if (initialSelectedId) {
      setSelectedId(initialSelectedId)
    }
  }, [initialSelectedId, setSelectedId])

  const sidebar = (
    <div className="px-6 pt-5 pb-4 bg-white border-b border-gray-100 flex flex-col gap-4 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif tracking-tight text-slate-900">{dict?.explore?.exploreUnlockCusco || "Explore UnlockCusco"}</h1>
      </div>

      <div className="hidden md:flex w-full justify-start overflow-x-auto scrollbar-hide gap-2 pb-1 px-0">
        <button title={dict?.explore?.discover || "Discover"} onClick={() => { setPanelMode("discover"); }} className={`shrink-0 flex items-center justify-center gap-1 md:gap-1.5 px-2.5 py-1.5 md:py-2 md:px-4 text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest rounded-full transition-all border ${panelMode === "discover" ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-sm"}`}><LayoutGrid className="w-3 h-3 md:w-4 md:h-4" /> <span>{dict?.explore?.discover || "Discover"}</span></button>
        <button title={dict?.explore?.concierge || "Concierge"} onClick={() => setIsChatOpen(!isChatOpen)} className={`shrink-0 flex items-center justify-center gap-1 md:gap-1.5 px-2.5 py-1.5 md:py-2 md:px-4 text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest rounded-full transition-all border ${isChatOpen ? "bg-rose-600 text-white border-rose-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600 shadow-sm"}`}><Sparkles className={`w-3 h-3 md:w-4 md:h-4 ${isChatOpen ? 'text-white' : 'text-rose-500'}`} /> <span>{dict?.explore?.concierge || "Concierge"}</span></button>
        <button title={dict?.explore?.itinerary || "Itinerary"} onClick={() => setPanelMode("itinerary")} className={`shrink-0 flex items-center justify-center gap-1 md:gap-1.5 px-2.5 py-1.5 md:py-2 md:px-4 text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest rounded-full transition-all border ${panelMode === "itinerary" ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-sm"}`}><CalendarDays className="w-3 h-3 md:w-4 md:h-4" /> <span>{dict?.explore?.itinerary || "Itinerary"}</span></button>
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
        <DiscoverPanel
          businesses={visibleBusinesses}
          totalCount={effectiveMapBusinesses.length}
          selectedId={selectedId}
          setSelectedId={setSelectedId}          onReset={() => router.push('/explore')}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore || (!mapBounds && !isSearchActive)}
          onLoadMore={loadMore}
          dict={dict}
        />
      ) : panelMode === "itinerary" ? (
        <ItineraryPanel dict={dict} />
      ) : (
        <div className="p-8 text-center text-slate-500">{dict?.explore?.featureDisabled || "Feature disabled"}</div>
      )}
    </div>
  )

  return (
    <ThreePaneLayout
      sidebar={sidebar}
      content={content}
      map={<ExploreMap businesses={effectiveMapBusinesses} selectedId={selectedId} categoryCounts={categoryCounts} currentLoc={searchParams.get("loc") || ""} onSelectBusiness={(id) => {
        setSelectedId(id);
        window.dispatchEvent(new CustomEvent('drawer-snap-half'));
      }} mapClickMode={mapClickMode} onMapAnchorPick={(lat, lng) => { 
        if (mapClickMode === 'start') {
          setStartAnchorLocation(lat, lng, 'Custom Start');
        } else if (mapClickMode === 'end') {
          updateEndAnchorLocation(lat, lng, 'Custom End');
        }
        setMapClickMode(null); 
      }} onBoundsChange={setMapBounds} dict={dict} />}
      showMap={true}
    />
  )
}
