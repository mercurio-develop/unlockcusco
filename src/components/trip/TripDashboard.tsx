"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SecureManifestForm } from "@/components/checkout/SecureManifestForm"
import { EventDetailsModal } from "./EventDetailsModal"
import TouristMap from "./TouristMap"
import { MapPin, Calendar, ChevronRight, CheckCircle2 } from "lucide-react"

interface TripDashboardProps {
  trip: any
}

export function TripDashboard({ trip }: TripDashboardProps) {
  const [activeDayNum, setActiveDayNum] = useState<number>(trip.days[0]?.dayNumber || 1)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [isBookingMode, setIsBookingMode] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const activeDay = trip.days.find((d: any) => d.dayNumber === activeDayNum) || trip.days[0]
  const events = activeDay?.eventsJson && activeDay.eventsJson !== "[]" ? JSON.parse(activeDay.eventsJson) : []
  const selectedEvent = events.find((e: any) => e.id === selectedEventId)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans">
       
       {/* LEFT SIDEBAR: Itinerary (List of Days) */}
       <div className="w-[320px] flex flex-col bg-white border-r border-gray-200 z-10 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="px-6 py-8 border-b border-gray-100 bg-slate-900 text-white shrink-0">
             <p className="text-rose-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">
               Curated by {trip.agency?.name || "Vallecito"}
             </p>
             <h1 className="text-3xl font-serif leading-tight mb-4">{trip.tripTitle}</h1>
             <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
               <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {trip.days.length} Days</span>
               <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {trip.status}</span>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {trip.days.map((day: any) => (
              <button 
                key={day.dayNumber}
                onClick={() => setActiveDayNum(day.dayNumber)}
                className={`w-full flex flex-col text-left px-5 py-4 rounded-2xl border transition-all ${activeDayNum === day.dayNumber ? "bg-white border-rose-200 shadow-md ring-1 ring-rose-500/20" : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wider ${activeDayNum === day.dayNumber ? 'text-rose-600' : 'text-slate-500'}`}>
                    Day {day.dayNumber}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-slate-900 leading-tight">
                  {day.tourPackage?.title || day.dayTheme || "Exploration"}
                </h3>
              </button>
            ))}
          </div>
       </div>

       {/* MIDDLE AREA: Map */}
       <div className="flex-1 bg-slate-200 relative">
         <AnimatePresence mode="wait">
           {!isBookingMode && !isSuccess ? (
             <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
               <TouristMap trip={trip} activeDayNum={activeDayNum} selectedEventId={selectedEventId} onEventSelect={setSelectedEventId} />
             </motion.div>
           ) : isBookingMode && !isSuccess ? (
             <motion.div key="booking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="w-full h-full bg-white overflow-y-auto p-12">
                <button onClick={() => setIsBookingMode(false)} className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                  <ChevronRight className="w-4 h-4 rotate-180" /> Back to Itinerary Map
                </button>
                <div className="max-w-2xl mx-auto">
                   <SecureManifestForm tripId={trip.id || "mock-trip-123"} paxCount={trip.paxCount || 1} onComplete={() => setIsSuccess(true)} />
                </div>
             </motion.div>
           ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full bg-white flex flex-col items-center justify-center p-12">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-5xl">✅</span>
                </div>
                <h2 className="text-4xl font-serif text-slate-900 mb-4">Journey Secured</h2>
                <p className="text-slate-500 max-w-md text-center">Your manifest is securely encrypted. We are now confirming your trains and sanctuary tickets.</p>
              </motion.div>
           )}
         </AnimatePresence>

         {/* Floating Action Button (when map is active) */}
         {!isBookingMode && !isSuccess && (
           <div className="absolute bottom-8 right-8 z-20">
             <button 
                onClick={() => setIsBookingMode(true)}
                className="bg-rose-600 text-white font-bold px-8 py-4 rounded-full shadow-xl shadow-rose-600/20 hover:bg-rose-700 hover:scale-105 transition-all flex items-center gap-3 text-lg"
              >
                <span className="text-xl">🛎️</span> Secure Expedition
             </button>
           </div>
         )}
       </div>

       {/* RIGHT SIDEBAR: Active Day Timeline */}
       {!isBookingMode && !isSuccess && (
         <div className="w-[400px] flex flex-col bg-white border-l border-gray-200 z-10 shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
            <div className="px-6 py-6 border-b border-gray-100 bg-white">
               <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Selected Day</span>
               <h2 className="text-2xl font-serif font-bold text-slate-900 mt-1">Day {activeDay.dayNumber} Timeline</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
               {activeDay.tourPackage?.description && (
                 <p className="text-sm text-slate-500 mb-6 leading-relaxed bg-white p-4 rounded-xl border border-slate-100">{activeDay.tourPackage.description}</p>
               )}

               <div className="relative border-l-2 border-gray-200 ml-3 pl-6 space-y-6">
                 {events.length > 0 ? events.map((evt: any, idx: number) => (
                     <div key={idx} className="relative group cursor-pointer" onClick={() => setSelectedEventId(evt.id)}>
                        <div className={`absolute -left-[31px] top-3 w-3 h-3 rounded-full border-2 transition-colors ${selectedEventId === evt.id ? "border-rose-500 bg-rose-500" : "border-slate-300 bg-white"}`} />
                        <div className={`p-4 rounded-xl border transition-all ${selectedEventId === evt.id ? "bg-rose-50/50 border-rose-200 shadow-md ring-1 ring-rose-500/20" : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"}`}>
                          <div className="flex items-start justify-between gap-2 mb-1">
                             <h4 className={`font-bold text-sm leading-tight ${selectedEventId === evt.id ? 'text-rose-900' : 'text-slate-900'}`}>{evt.title || evt.name || evt.experienceTitle || "Activity"}</h4>
                             <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">{evt.startTime || "TBD"}</span>
                          </div>
                          {evt.type === 'TRANSPORT' && (
                            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 mt-2"><MapPin className="w-3 h-3 text-slate-400" /> {evt.from} → {evt.to}</div>
                          )}
                          {evt.type === 'MEAL' && evt.location && (
                            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 mt-2"><MapPin className="w-3 h-3 text-slate-400" /> {evt.location}</div>
                          )}
                          {evt.type === 'NOTE' && (
                            <div className="text-[11px] text-slate-600 italic border-l-[3px] border-rose-200 pl-3 py-1 mt-3 bg-rose-50/30 rounded-r-md">{evt.content}</div>
                          )}
                          {evt.type === 'EXPERIENCE' && (
                            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 mt-3 flex items-center gap-1">
                              View Details <ChevronRight className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                     </div>
                   )) : (
                     <div className="text-sm text-slate-400 italic bg-white p-4 rounded-xl border border-slate-100">No specific events scheduled. Enjoy your free time to explore!</div>
                   )}
               </div>
               
               {activeDay.guideNotes && (
                  <div className="mt-8 bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🗣️</span>
                      <div>
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Guide Note</p>
                        <p className="text-xs text-amber-900 leading-relaxed font-medium">
                          &quot;{activeDay.guideNotes}&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
         </div>
       )}

       {/* MODAL DETAIL */}
       <AnimatePresence>
         {selectedEvent && !isBookingMode && !isSuccess && (
           <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEventId(null)} />
         )}
       </AnimatePresence>
    </div>
  )
}
