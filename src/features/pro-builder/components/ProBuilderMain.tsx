"use client"

import { useEffect } from "react"
import { useTrip } from "@/lib/store/trip-context"
import { BuilderWizard } from "./BuilderWizard"
import { BuilderWorkspace } from "./BuilderWorkspace"
import { CheckoutDetailsForm } from "./CheckoutDetailsForm"
import { ThreePaneLayout } from "@/components/layout/three-pane-layout"
import { MapPin, Calendar, Users, Briefcase } from "lucide-react"
import dynamic from "next/dynamic"

const ExploreMap = dynamic(() => import("@/features/explore/components/explore-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-50 animate-pulse" />
})

export function ProBuilderMain() {
  const { viewState, currentTrip, setPanelMode, activeDayNumber, setActiveDayNumber } = useTrip()

  useEffect(() => {
    setPanelMode('builder')
  }, [setPanelMode])

  if (viewState === 'wizard') return <BuilderWizard />
  if (viewState === 'checkout') return <CheckoutDetailsForm />

  // workspace mode uses the 3-pane layout
  const sidebar = currentTrip ? (
    <div className="bg-slate-900 h-full flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-serif font-bold text-white mb-1">{currentTrip.title}</h2>
        <div className="flex gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
          <span>{currentTrip.startDate.toLocaleDateString()}</span>
          <span>•</span>
          <span>{currentTrip.paxCount} Pax</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {currentTrip.days.map((day) => (
          <button
            key={day.dayNumber}
            onClick={() => setActiveDayNumber(day.dayNumber)}
            className={`w-full text-left p-4 rounded-2xl transition-all border ${
              day.dayNumber === activeDayNumber 
                ? 'bg-slate-800 border-slate-700 shadow-md' 
                : 'bg-transparent border-transparent hover:bg-slate-800/50'
            }`}
          >
            <div className="flex justify-between items-center">
              <h3 className={`font-bold ${day.dayNumber === activeDayNumber ? 'text-white' : 'text-slate-400'}`}>Day {day.dayNumber}</h3>
              <span className="text-[9px] text-slate-500 font-bold">{day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
            {day.events.length > 0 && (
               <div className="flex gap-1 mt-2">
                 {day.events.slice(0, 5).map(e => (
                   <div key={e.id} className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
                 ))}
               </div>
            )}
          </button>
        ))}
      </div>
    </div>
  ) : null

  const activeDay = currentTrip?.days.find(d => d.dayNumber === activeDayNumber)
  const mapEntities = activeDay?.events.map(e => ({
    id: e.id,
    name: e.title,
    lat: e.lat,
    lng: e.lng,
    category: e.type
  })) || []

  return (
    <ThreePaneLayout
      sidebar={sidebar}
      content={<BuilderWorkspace />}
      map={<ExploreMap businesses={mapEntities as any} selectedId={null} />}
      showMap={true}
    />
  )
}
