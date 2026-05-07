"use client"

import { useEffect, useState, useMemo } from "react"
import { useTrip } from "@/lib/store/trip-context"
import { BuilderWizard } from "./BuilderWizard"
import { BuilderWorkspace } from "./BuilderWorkspace"
import { CheckoutDetailsForm } from "./CheckoutDetailsForm"
import { MapPin, Calendar, Users, Briefcase, ChevronLeft, ChevronRight, ListCollapse, Utensils, Car, Moon, AlignLeft, Receipt, UserCircle2, ChevronDown, ChevronUp } from "lucide-react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"

const ExploreMap = dynamic(() => import("@/features/explore/components/explore-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-50 animate-pulse" />
})

export function ProBuilderMain() {
  const { viewState, currentTrip, setPanelMode, activeDayNumber, setActiveDayNumber, setViewState, isWorkspaceCollapsed, setIsWorkspaceCollapsed, isChatOpen } = useTrip()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    setPanelMode('builder')
  }, [setPanelMode])

  // Fix white gap: Trigger Mapbox resize when sidebars toggle
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 310); // slightly longer than the 300ms transition
    return () => clearTimeout(timer);
  }, [isSidebarCollapsed, isWorkspaceCollapsed]);

  const mapEntities = useMemo(() => {
    if (!currentTrip) return [];
    const mapEvents = currentTrip.days.filter(d => d.isComplete || d.dayNumber === activeDayNumber).flatMap(d => d.events).filter(e => e.type !== 'NOTE');
    
    return mapEvents.map(e => {
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
        id: e.id,
        name: e.title,
        lat: evtLat,
        lng: evtLng,
        category: e.type
      };
    }).filter(e => e.lat != null && e.lng != null);
  }, [currentTrip, activeDayNumber]);

  if (viewState === 'wizard') return <BuilderWizard />
  if (viewState === 'checkout') return <CheckoutDetailsForm />

  const activeDay = currentTrip?.days.find(d => d.dayNumber === activeDayNumber)

  // Helper to get small icons for event types
  const getSmallIcon = (type: string) => {
    switch (type) {
      case 'EXPERIENCE': return <MapPin className="w-3 h-3 text-emerald-600" />
      case 'TRANSPORT': return <Car className="w-3 h-3 text-blue-600" />
      case 'MEAL': return <Utensils className="w-3 h-3 text-amber-600" />
      case 'STAY': return <Moon className="w-3 h-3 text-purple-600" />
      default: return <AlignLeft className="w-3 h-3 text-slate-500" />
    }
  }

  // Calculate mock budget
  const estimatedTotal = currentTrip ? (currentTrip.days.length * 150 * currentTrip.paxCount) : 0;
  const perPerson = currentTrip ? estimatedTotal / currentTrip.paxCount : 0;

  return (
    <div className="h-[calc(100vh-56px)] w-full flex overflow-hidden bg-[#FAF9F6] font-sans relative">
      {/* Left Panel - Days List (Magazine / Airbnb Style) */}
      <div className={`shrink-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-16' : 'w-[420px]'} bg-[#FAF9F6] h-full flex flex-col z-20 shadow-xl border-r border-slate-100 relative`}>
        {/* Left Rail Toggle */}
        <div className="absolute top-6 right-3 z-30">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-10 h-10 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-xl transition-all flex items-center justify-center"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Content Container - fades out when collapsed */}
        <div className={`flex-1 flex flex-col transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100 overflow-hidden'}`}>
          {currentTrip && (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Itinerary Timeline</h3>
                {currentTrip.days.map((day) => {
                  const isActive = day.dayNumber === activeDayNumber
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
                        
                        {/* Condensed summary for non-active days */}
                        {(!isActive) && day.events.length > 0 && (
                          <div className="flex flex-wrap justify-end gap-1 max-w-[120px]">
                            {day.events.slice(0, 4).map(e => (
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
                      
                      {/* Always Expanded Timeline View for Active Day */}
                      {isActive && (
                        <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 fade-in duration-300">
                          {day.events.length === 0 ? (
                            <p className="text-sm text-slate-500 font-medium bg-slate-50 p-5 rounded-2xl text-center border border-slate-200 border-dashed">No events scheduled.</p>
                          ) : (
                            <div className="flex flex-col gap-4 relative before:absolute before:inset-0 before:left-3 before:h-full before:w-px before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent pt-2">
                              {day.events.map((e, i) => (
                                <div key={e.id} className="relative flex items-center justify-between group pl-8">
                                  <div className="absolute left-[9px] w-2 h-2 rounded-full bg-slate-300 z-10 group-hover:bg-slate-900 transition-colors ring-4 ring-white" />
                                  <span className="text-slate-700 text-[15px] font-medium truncate pr-4">{e.title}</span>
                                  <span className="text-slate-400 text-xs font-bold font-mono shrink-0">{e.startTime}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              
              <div className="p-8 bg-transparent border-t border-slate-100 shrink-0">
                <button
                  onClick={() => setViewState('checkout')}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-2xl font-bold text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center Panel - Map */}
      <div className="flex-1 relative z-10 bg-slate-100 overflow-hidden">
        <ExploreMap businesses={mapEntities as any} selectedId={null} onSelectBusiness={() => {}} />
      </div>

      {/* Right Panel - Builder Workspace */}
      <div className={`shrink-0 transition-all duration-300 ease-in-out ${isWorkspaceCollapsed ? 'w-16' : 'w-[500px]'} z-20 bg-[#FAF9F6] shadow-[-10px_0_20px_rgba(0,0,0,0.03)] relative flex flex-col border-l border-slate-200`}>
        {/* Right Rail Toggle */}
        <div className="absolute top-6 left-3 z-30">
          <button 
            onClick={() => setIsWorkspaceCollapsed(!isWorkspaceCollapsed)}
            className="w-10 h-10 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-xl transition-all flex items-center justify-center"
          >
            {isWorkspaceCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto transition-opacity duration-300 ${isWorkspaceCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <BuilderWorkspace selectedId={selectedId} onSelectEvent={setSelectedId} />
        </div>
      </div>
    </div>
  )
}
