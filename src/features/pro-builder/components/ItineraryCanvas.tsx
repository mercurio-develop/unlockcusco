"use client"

import { useState } from "react"
import { useBuilder } from "@/features/pro-builder/store/builder-context"
import { MapPin, Plus, Edit2, Calendar, Users, Moon, Plane } from "lucide-react"
import { ExperiencePickerModal } from "./ExperiencePickerModal"

export function ItineraryCanvas() {
  const { draftTrip, setViewState } = useBuilder()
  const [activeDayPicker, setActiveDayPicker] = useState<number | null>(null)

  return (
    <div className="w-full flex bg-slate-50 min-h-[600px]">
      
      {/* Left Sidebar - Summary */}
      <div className="w-1/3 bg-slate-900 text-white p-8 overflow-y-auto border-r border-slate-800 hidden md:block">
        <h2 className="text-3xl font-serif font-bold mb-2 leading-tight">{draftTrip.title || "Untitled Expedition"}</h2>
        
        <div className="space-y-4 mt-8">
          <div className="flex items-center gap-3 text-slate-300">
            <Calendar className="w-5 h-5 text-rose-500" />
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-slate-500">Dates</p>
              <p className="font-medium text-white">{draftTrip.startDate} to {draftTrip.endDate}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-slate-300">
            <Users className="w-5 h-5 text-rose-500" />
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-slate-500">Travelers</p>
              <p className="font-medium text-white">{draftTrip.paxCount} Pax</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setViewState('wizard')}
          className="mt-12 flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <Edit2 className="w-4 h-4" /> Edit Trip Settings
        </button>
      </div>

      {/* Right Content - Timeline Canvas */}
      <div className="flex-1 p-8 overflow-y-auto relative bg-white">
        
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-white/90 backdrop-blur-md py-4 z-30">
          <h2 className="text-2xl font-serif font-bold text-slate-900">Itinerary Canvas</h2>
          <button 
            onClick={() => setViewState('checkout')}
            className="bg-rose-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-rose-700 transition-colors"
          >
            Finalize Details &rarr;
          </button>
        </div>

        <div className="max-w-2xl mx-auto relative border-l-2 border-slate-100 ml-4 pl-8 space-y-12 pb-24">
          
          {draftTrip.days.map((day, idx) => (
            <div key={day.dayNumber} className="relative">
              
              {/* Day Header */}
              <div className="mb-6 flex items-center gap-3">
                 <div className="absolute -left-[45px] w-6 h-6 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center z-10 text-[10px] font-bold text-slate-500">
                    {day.dayNumber}
                 </div>
                 <h3 className="font-bold text-slate-900 text-xl font-serif">Day {day.dayNumber}</h3>
                 <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                   {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                 </span>
              </div>

              {/* Start Anchor */}
              <div className="relative group mb-6">
                <div className="absolute -left-[43px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)] z-20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em] block mb-1">Morning Pickup</span>
                      <h4 className="text-slate-900 font-bold">{day.startAnchor.locationStr || 'Location not set'}</h4>
                    </div>
                    <div className="text-slate-500 text-xs font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      {day.startAnchor.time}
                    </div>
                  </div>
                </div>
              </div>

              {/* Experiences Block */}
              <div className="relative pl-4 space-y-4 mb-6">
                 {day.packageIds.map((pkgId, pIdx) => (
                   <div key={pIdx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1">Selected Experience</span>
                     <h4 className="font-bold text-slate-900">Experience ID: {pkgId}</h4>
                     <p className="text-xs text-slate-500 mt-1">Full details loaded at checkout or preview.</p>
                   </div>
                 ))}
                 
                 <button 
                   onClick={() => setActiveDayPicker(day.dayNumber)}
                   className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-semibold hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50/50 transition-all flex items-center justify-center gap-2"
                 >
                   <Plus className="w-4 h-4" /> Add Experience
                 </button>
              </div>

              {/* End Anchor */}
              <div className="relative group">
                <div className="absolute -left-[43px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-slate-800 z-20 flex items-center justify-center">
                  <Moon className="w-3 h-3 text-slate-800" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1">Evening Drop-off</span>
                      <h4 className="text-slate-900 font-bold">{day.endAnchor.locationStr || 'Location not set'}</h4>
                    </div>
                    <div className="text-slate-500 text-xs font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      {day.endAnchor.time}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ))}

        </div>
      </div>

      <ExperiencePickerModal 
        isOpen={activeDayPicker !== null} 
        onClose={() => setActiveDayPicker(null)} 
        dayNumber={activeDayPicker || 1} 
      />

    </div>
  )
}
