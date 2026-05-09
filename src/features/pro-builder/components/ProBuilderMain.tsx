"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTrip } from "@/lib/store/trip-context"
import { usePreferences } from "@/lib/store/preferences-context"
import { BuilderWizard } from "./BuilderWizard"
import { BuilderWorkspace } from "./BuilderWorkspace"
import { CheckoutDetailsForm } from "./CheckoutDetailsForm"
import { DiscoverPanel } from "@/features/explore/components/DiscoverPanel"
import { ExploreSearch } from "@/features/explore/components/explore-search"
import { fetchBusinesses } from "@/features/business/actions/fetch-businesses"
import { MapPin, Calendar, Users, Briefcase, ChevronLeft, ChevronRight, ListCollapse, Utensils, Car, Moon, AlignLeft, Receipt, UserCircle2, ChevronDown, ChevronUp, X, Search, Plus } from "lucide-react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const ExploreMap = dynamic(() => import("@/features/explore/components/explore-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-50 animate-pulse" />
})

export function ProBuilderMain() {
  const { viewState, currentTrip, panelMode, setPanelMode, activeDayNumber, setActiveDayNumber, setViewState, isWorkspaceCollapsed, setIsWorkspaceCollapsed, setSelectedId, selectedId, createDay } = useTrip()
  const { isChatOpen } = usePreferences()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [leftTab, setLeftTab] = useState<'discover' | 'itinerary'>('itinerary')
  
  const [workspaceWidth, setWorkspaceWidth] = useState(500)
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = document.body.clientWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 800) {
        setWorkspaceWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);
  
  const isDrawerOpen = searchParams.get("filter") === "open"
  const setIsDrawerOpen = (open: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    if (open) params.set("filter", "open")
    else params.delete("filter")
    router.push(`?${params.toString()}`, { scroll: false })
  }
  
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const q = searchParams.get("q") || ""
  const loc = searchParams.get("loc") || ""
  const cat = searchParams.get("cat") || ""
  const rad = searchParams.get("rad") ? Number(searchParams.get("rad")) : undefined
  const lat = searchParams.get("lat") || undefined
  const lng = searchParams.get("lng") || undefined
  const sort = searchParams.get("sort") || "recommended"

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const result = await fetchBusinesses({ 
          query: q, 
          loc, 
          category: cat, 
          radiusKm: rad,
          userLat: lat ? Number(lat) : undefined,
          userLng: lng ? Number(lng) : undefined,
          sort,
          limit: 100,
          includePackages: true
        })
        setBusinesses(result.allBusinesses)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [q, loc, cat, rad, lat, lng, sort])

  useEffect(() => {
    if (panelMode === 'categories') {
      setLeftTab('discover')
    }
  }, [panelMode])

  useEffect(() => {
    if (leftTab === 'discover') {
      setPanelMode('categories')
    } else {
      setPanelMode('builder')
    }
  }, [leftTab, setPanelMode])

  // Fix white gap: Trigger Mapbox resize when sidebars toggle
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 310); // slightly longer than the 300ms transition
    return () => clearTimeout(timer);
  }, [isSidebarCollapsed, isWorkspaceCollapsed]);

  const mapEntities = useMemo(() => {
    const entities: any[] = [];
    
    // 1. Add current trip events
    if (currentTrip) {
      currentTrip.days.forEach((d: any) => {
        if (d.events.length > 0 || d.dayNumber === activeDayNumber) {
          if (d.startAnchor?.lat && d.startAnchor?.lng) {
            const id = `startAnchor-${d.dayNumber}`;
            if (!entities.find((e: any) => e.id === id)) entities.push({ id, title: d.startAnchor.title, lat: d.startAnchor.lat, lng: d.startAnchor.lng, type: 'ANCHOR', isItineraryItem: true });
          }
          d.events.filter((e: any) => e.type !== 'NOTE').forEach((e: any) => entities.push({ ...e, isItineraryItem: true }));
          if (d.endAnchor?.lat && d.endAnchor?.lng) {
            const id = `endAnchor-${d.dayNumber}`;
            if (!entities.find((e: any) => e.id === id)) entities.push({ id, title: d.endAnchor.title, lat: d.endAnchor.lat, lng: d.endAnchor.lng, type: 'ANCHOR', isItineraryItem: true });
          }
        }
      });
    }

    // 2. Add library businesses (if on discover tab)
    if (leftTab === 'discover' && businesses.length > 0) {
      businesses.forEach((b: any) => {
        const existing = entities.find((e: any) => e.id === b.id);
        if (existing) {
          existing.isLibraryItem = true;
        } else {
          entities.push({ ...b, isLibraryItem: true });
        }
      });
    }

    return entities.map((e: any) => {
      let evtLat = e.lat;
      let evtLng = e.lng;
      if (e.type === 'TRANSPORT') {
        evtLat = (e as any).fromLat;
        evtLng = (e as any).fromLng;
      } else if (e.type === 'MEAL') {
        evtLat = (e as any).locationLat || e.lat;
        evtLng = (e as any).locationLng || e.lng;
      }

      return {
        ...e,
        id: e.id,
        name: e.name || e.title,
        lat: evtLat,
        lng: evtLng,
        category: e.type === 'ANCHOR' ? 'STAY' : (e.category || e.type)
      };
    }).filter(e => e.lat != null && e.lng != null);
  }, [leftTab, businesses, currentTrip, activeDayNumber]);

  if (viewState === 'wizard') return <BuilderWizard />
  if (viewState === 'checkout') return <CheckoutDetailsForm />

  const activeDay = currentTrip?.days.find((d: any) => d.dayNumber === activeDayNumber)

  // Helper to get small icons for event types
  const getSmallIcon = (type: string) => {
    switch (type) {
      case 'EXPERIENCE': return <MapPin className="w-3 h-3 text-emerald-600" />
      case 'TRANSPORT': return <Car className="w-3 h-3 text-blue-600" />
      case 'MEAL': return <Utensils className="w-3 h-3 text-amber-600" />
      case 'STAY': return <Moon className="w-3 h-3 text-purple-600" />
      case 'ANCHOR': return <MapPin className="w-3 h-3 text-slate-500" />
      default: return <AlignLeft className="w-3 h-3 text-slate-500" />
    }
  }

  return (
    <div className="h-[calc(100vh-56px)] w-full flex overflow-hidden bg-[#FAF9F6] font-sans relative text-slate-900">
      {/* Left Panel - Tabbed Discover & Timeline */}
      <div className={`shrink-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-16' : 'w-[420px]'} bg-[#FAF9F6] h-full flex flex-col z-20 shadow-xl border-r border-slate-100 relative`}>
        {/* Left Rail Toggle */}
        <div className="absolute top-6 -right-5 z-30">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-10 h-10 bg-white border border-slate-200 shadow-md hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-full transition-all flex items-center justify-center"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Content Container */}
        <div className={`flex-1 flex flex-col transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100 overflow-hidden'}`}>
          
          <div className="px-6 pt-6 pb-2">
             <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Pro Planner</h2>
          </div>

          {/* Sidebar Tabs */}
          <div className="px-6 pt-2 pb-2 shrink-0">
             <div className="bg-slate-100 p-1 rounded-2xl flex w-full">
                <button 
                  onClick={() => setLeftTab('discover')} 
                  className={cn(
                    "flex-1 flex justify-center items-center gap-2 py-2 px-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                    leftTab === 'discover' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Search className="w-3.5 h-3.5" /> Library
                </button>
                <button 
                  onClick={() => setLeftTab('itinerary')} 
                  className={cn(
                    "flex-1 flex justify-center items-center gap-2 py-2 px-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                    leftTab === 'itinerary' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <ListCollapse className="w-3.5 h-3.5" /> Days
                </button>
             </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {leftTab === 'discover' ? (
              <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="shrink-0 p-6 bg-white border-b border-slate-50">
                  <ExploreSearch 
                    initialQuery={q} 
                    isDrawerOpen={isDrawerOpen}
                    setIsDrawerOpen={setIsDrawerOpen}
                    categoryCounts={{}}
                  />
                </div>

                <div className="flex-1 overflow-hidden flex flex-col relative">
                  {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Consulting Library...</p>
                      </div>
                    </div>
                  )}
                  <DiscoverPanel 
                    businesses={businesses} 
                    selectedId={selectedId} 
                    setSelectedId={setSelectedId} 
                    onReset={() => setLeftTab('itinerary')}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide bg-slate-50/50 animate-in fade-in slide-in-from-left-4 duration-300">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Itinerary Timeline</h3>
                {currentTrip?.days.map((day: any) => {
                  const isActive = day.dayNumber === activeDayNumber
                  const timelineItems: { id: string, title: string, time: string, type: string }[] = [];
                  if (day.startAnchor) {
                    timelineItems.push({ id: `startAnchor-${day.dayNumber}`, title: day.startAnchor.title || "Starting Point", time: day.startAnchor.time || "09:00", type: 'ANCHOR' });
                  }
                  day.events.forEach((e: any) => timelineItems.push({ id: e.id, title: e.title, time: e.startTime, type: e.type }));
                  if (day.endAnchor) {
                    timelineItems.push({ id: `endAnchor-${day.dayNumber}`, title: day.endAnchor.title || "End of Day", time: day.endAnchor.time || "18:00", type: 'ANCHOR' });
                  }

                  return (
                    <div key={day.dayNumber} className={`rounded-3xl transition-all duration-300 overflow-hidden border ${isActive ? 'bg-white border-slate-200 shadow-md ring-1 ring-slate-900/5' : 'bg-white border-transparent shadow-sm hover:shadow hover:border-slate-200'}`}>
                      <button
                        onClick={() => setActiveDayNumber(day.dayNumber)}
                        className="w-full text-left p-6 flex justify-between items-start"
                      >
                        <div>
                          <h3 className={`font-bold text-xl mb-1 font-serif ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>Day {day.dayNumber}</h3>
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{day.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        </div>
                        {(!isActive) && day.events.length > 0 && (
                          <div className="flex flex-wrap justify-end gap-1 max-w-[120px]">
                            {day.events.slice(0, 4).map((e: any) => (
                              <div key={e.id} className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center" title={e.title}>
                                {getSmallIcon(e.type)}
                              </div>
                            ))}
                            {day.events.length > 4 && (
                              <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500">
                                +{day.events.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                      {isActive && (
                        <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 fade-in duration-300">
                          {timelineItems.length === 0 ? (
                            <p className="text-sm text-slate-500 font-medium bg-slate-50 p-5 rounded-2xl text-center border border-slate-200 border-dashed">No events scheduled.</p>
                          ) : (
                            <div className="flex flex-col gap-4 relative before:absolute before:inset-0 before:left-3 before:h-full before:w-px before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent pt-2">
                              {timelineItems.map((e: any, i: number) => (
                                <div 
                                  key={e.id} 
                                  className="relative flex items-center justify-between group pl-8 cursor-pointer hover:bg-slate-50 py-1 -ml-2 pl-10 rounded-r-xl transition-colors"
                                  onClick={(ev) => { 
                                    ev.stopPropagation(); 
                                    setSelectedId(e.id);
                                    const element = document.getElementById(`event-${e.id}`);
                                    if (element) {
                                      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                  }}
                                >
                                  <div className={`absolute left-[17px] w-2 h-2 rounded-full z-10 transition-colors ring-4 ring-white ${selectedId === e.id ? 'bg-slate-900 ring-rose-500/20' : 'bg-slate-300 group-hover:bg-slate-900'}`} />
                                  <span className={`text-[15px] font-medium truncate pr-4 transition-colors ${selectedId === e.id ? 'text-slate-900 font-bold' : 'text-slate-700 group-hover:text-slate-900'}`}>{e.title}</span>
                                  <span className={`text-xs font-bold font-mono shrink-0 transition-colors ${selectedId === e.id ? 'text-rose-600' : 'text-slate-400 group-hover:text-slate-600'}`}>{e.time}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
                
                <button
                  onClick={createDay}
                  className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Day
                </button>
              </div>
            )}
          </div>
          
          <div className="p-8 bg-transparent border-t border-slate-100 shrink-0">
            <button
              onClick={() => setViewState('checkout')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-2xl font-bold text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Center Panel - Map (Always working) */}
      <div className="flex-1 relative z-10 bg-slate-100 overflow-hidden flex flex-col">
        <ExploreMap businesses={mapEntities as any} selectedId={selectedId} onSelectBusiness={setSelectedId} />
      </div>

      {/* Right Panel - Builder Workspace (Day details) */}
      <div 
        style={{ width: isWorkspaceCollapsed ? 64 : workspaceWidth }}
        className={cn(
          "shrink-0 z-20 bg-[#FAF9F6] shadow-[-10px_0_20px_rgba(0,0,0,0.03)] relative flex flex-col border-l border-slate-200",
          isResizing ? "transition-none" : "transition-all duration-300 ease-in-out"
        )}
      >
        {/* Resize Handle */}
        {!isWorkspaceCollapsed && (
          <div 
            onMouseDown={() => setIsResizing(true)}
            className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-slate-200/50 active:bg-slate-300/50 transition-colors z-40"
          />
        )}

        <div className="absolute top-6 -left-5 z-30">
          <button 
            onClick={() => setIsWorkspaceCollapsed(!isWorkspaceCollapsed)}
            className="w-10 h-10 bg-white border border-slate-200 shadow-md hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-full transition-all flex items-center justify-center"
          >
            {isWorkspaceCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto transition-opacity duration-300 ${isWorkspaceCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <BuilderWorkspace variant="pro" selectedId={selectedId} onSelectEvent={setSelectedId} />
        </div>
      </div>
    </div>
  )
}
