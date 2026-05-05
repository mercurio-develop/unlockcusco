"use client"

import { useEffect, useState } from "react"
import { useTrip } from "@/lib/store/trip-context"
import { BuilderWizard } from "./BuilderWizard"
import { BuilderWorkspace } from "./BuilderWorkspace"
import { CheckoutDetailsForm } from "./CheckoutDetailsForm"
import { MapPin, Calendar, Users, Briefcase, ChevronLeft, ChevronRight, ListCollapse, Utensils, Car, Moon, AlignLeft, Receipt, UserCircle2 } from "lucide-react"
import dynamic from "next/dynamic"

const ExploreMap = dynamic(() => import("@/features/explore/components/explore-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-50 animate-pulse" />
})

export function ProBuilderMain() {
  const { viewState, currentTrip, setPanelMode, activeDayNumber, setActiveDayNumber, setViewState } = useTrip()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isWorkspaceCollapsed, setIsWorkspaceCollapsed] = useState(false)

  useEffect(() => {
    setPanelMode('builder')
  }, [setPanelMode])

  if (viewState === 'wizard') return <BuilderWizard />
  if (viewState === 'checkout') return <CheckoutDetailsForm />

  const activeDay = currentTrip?.days.find(d => d.dayNumber === activeDayNumber)
  const mapEntities = activeDay?.events.map(e => ({
    id: e.id,
    name: e.title,
    lat: e.lat,
    lng: e.lng,
    category: e.type
  })) || []

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
      <div className={`shrink-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-[420px] opacity-100'} bg-[#FAF9F6] h-full flex flex-col z-20 shadow-xl border-r border-slate-100`}>
        {currentTrip && (
          <>
            <div className="p-8 pb-6 border-b border-slate-100 shrink-0 relative bg-transparent">
              <div className="flex items-center justify-between mb-3">
                 <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">{currentTrip.status || "DRAFT"}</span>
                 <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                   <span>{currentTrip.startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                 </div>
              </div>
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6 leading-tight">{currentTrip.title}</h2>
              
              {/* Trip Metadata Section */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <UserCircle2 className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Travelers</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{currentTrip.paxCount} Pax</p>
                    <p className="text-xs text-slate-500 mt-0.5">Primary: Pending</p>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <AlignLeft className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Pace</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">Balanced</p>
                    <p className="text-xs text-slate-500 mt-0.5">Flexible start times</p>
                 </div>
              </div>

              {/* Trip Notes / Intro */}
              <div className="relative">
                <textarea 
                  className="w-full text-sm text-slate-600 outline-none resize-none h-20 bg-slate-50 p-4 rounded-2xl border border-transparent focus:border-slate-200 transition-colors leading-relaxed placeholder:text-slate-400"
                  placeholder="Add an introduction or internal notes about this trip..."
                  defaultValue={currentTrip.clientNotes || ""}
                />
              </div>

            </div>
            
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
                          <div className="flex flex-col gap-4 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent pt-2">
                            {day.events.map((e, i) => (
                              <div key={e.id} className="relative flex items-center justify-between group pl-10">
                                <div className="absolute left-2.5 w-2 h-2 rounded-full bg-slate-300 z-10 group-hover:bg-slate-900 transition-colors ring-4 ring-white" />
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
              {/* Budget Summary */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                 <div>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1"><Receipt className="w-3.5 h-3.5" /> Est. Budget</span>
                    <p className="text-xl font-bold text-slate-900">${estimatedTotal}</p>
                 </div>
                 <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Per Person</span>
                    <p className="text-sm font-semibold text-slate-600">${perPerson}</p>
                 </div>
              </div>

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

      {/* Center Panel - Map */}
      <div className="flex-1 relative z-10">
        <ExploreMap businesses={mapEntities as any} selectedId={null} onSelectBusiness={() => {}} />
        
        {/* Left Sidebar Toggle Button */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-6 left-0 bg-white border border-slate-200 shadow-md p-2 rounded-r-xl z-30 hover:bg-slate-50 transition-colors flex items-center justify-center"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-5 h-5 text-slate-700" /> : <ChevronLeft className="w-5 h-5 text-slate-700" />}
        </button>

        {/* Right Sidebar Toggle Button */}
        <button 
          onClick={() => setIsWorkspaceCollapsed(!isWorkspaceCollapsed)}
          className="absolute top-6 right-0 bg-white border border-slate-200 shadow-md p-2 rounded-l-xl z-30 hover:bg-slate-50 transition-colors flex items-center justify-center"
        >
          {isWorkspaceCollapsed ? <ChevronLeft className="w-5 h-5 text-slate-700" /> : <ChevronRight className="w-5 h-5 text-slate-700" />}
        </button>
      </div>

      {/* Right Panel - Builder Workspace */}
      <div className={`shrink-0 transition-all duration-300 ease-in-out ${isWorkspaceCollapsed ? 'w-0 opacity-0 overflow-hidden border-none' : 'w-[500px] opacity-100 border-l border-slate-200'} z-20 bg-[#FAF9F6] shadow-[-10px_0_20px_rgba(0,0,0,0.03)] relative overflow-y-auto`}>
        <BuilderWorkspace />
      </div>
    </div>
  )
}
