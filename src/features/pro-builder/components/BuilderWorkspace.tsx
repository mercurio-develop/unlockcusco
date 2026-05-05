"use client"

import { useState } from "react"
import { useTrip } from "@/lib/store/trip-context"
import { MapPin, Plus, Trash2, ArrowUp, ArrowDown, Utensils, AlignLeft, Car, Moon, Sparkles, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { LocationAutocomplete } from "./LocationAutocomplete"
import { ExperiencePickerModal } from "./ExperiencePickerModal"
import { PackagePreviewModal } from "./PackagePreviewModal"
import { EventType, TimelineEvent } from "@/lib/types/trip"
import { v4 as uuidv4 } from "uuid"
import { cn } from "@/lib/utils"

function getEventIcon(type: EventType) {
  switch (type) {
    case 'EXPERIENCE': return <MapPin className="w-4 h-4 text-emerald-500" />
    case 'TRANSPORT': return <Car className="w-4 h-4 text-blue-500" />
    case 'MEAL': return <Utensils className="w-4 h-4 text-amber-500" />
    case 'STAY': return <Moon className="w-4 h-4 text-purple-500" />
    default: return <AlignLeft className="w-4 h-4 text-slate-500" />
  }
}

export function BuilderWorkspace() {
  const { currentTrip, setCurrentTrip, activeDayNumber, addEvent, removeEvent, updateEvent, setViewState } = useTrip()
  const [activeDayPicker, setActiveDayPicker] = useState<{dayNumber: number, eventId?: string} | null>(null)
  const [viewingPackage, setViewingPackage] = useState<string | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)

  const activeDay = currentTrip?.days.find(d => d.dayNumber === activeDayNumber)

  if (!activeDay) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
        <Sparkles className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-serif">Select a day to start building</p>
      </div>
    )
  }

  const handleAddMockEvent = (type: EventType) => {
    const id = uuidv4()
    let newEvent: TimelineEvent = {
        id,
        type,
        startTime: "10:00",
        title: type === 'MEAL' ? 'Lunch Reservation' : (type === 'TRANSPORT' ? 'Private Transfer' : 'New Block')
    }
    
    if (type === 'EXPERIENCE') {
        setActiveDayPicker({ dayNumber: activeDayNumber! })
        setShowAddMenu(false)
        return
    }

    addEvent(activeDayNumber!, newEvent)
    setShowAddMenu(false)
  }

  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-between">
             <div>
                <h2 className="text-3xl font-serif font-bold text-slate-900">Day {activeDay.dayNumber}</h2>
                <p className="text-slate-500">{activeDay.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
             </div>
             <button 
                onClick={() => setViewState('checkout')}
                className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-rose-700 transition-colors"
              >
                Checkout &rarr;
              </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto relative border-l-2 border-slate-100 ml-4 pl-8 space-y-8 pb-32">
          {/* Start Anchor */}
          <div className="relative group">
             <div className="absolute -left-[43px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-rose-500 z-20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
             </div>
             <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-2">Start Anchor</span>
                <LocationAutocomplete 
                  value={activeDay.startAnchor?.title || ""}
                  onChange={(val) => {}} // TODO: Impl updateDay
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                  placeholder="Starting location..."
                />
             </div>
          </div>

          {/* Events */}
          <AnimatePresence>
            {activeDay.events.map((evt) => (
              <motion.div 
                key={evt.id} 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
              >
                <div className="absolute -left-[41px] top-6 w-4 h-4 rounded-full bg-white border-2 border-slate-300 z-20 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                </div>
                
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative">
                  <div className="absolute -top-3 -right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                    <button onClick={() => removeEvent(activeDay.dayNumber, evt.id)} className="w-8 h-8 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 rounded-full flex items-center justify-center shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>

                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {getEventIcon(evt.type)}
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{evt.type}</span>
                    </div>
                    <input type="time" value={evt.startTime} onChange={(e) => updateEvent(activeDay.dayNumber, evt.id, { startTime: e.target.value })} className="text-xs font-mono font-bold bg-slate-50 px-2 py-1 rounded" />
                  </div>
                  
                  <h4 className="font-bold text-slate-900">{evt.title}</h4>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Block */}
          <div className="relative pt-4">
             {!showAddMenu ? (
                <button onClick={() => setShowAddMenu(true)} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-semibold hover:border-slate-400 transition-all flex items-center justify-center gap-2">
                   <Plus className="w-4 h-4" /> Add Block
                </button>
             ) : (
                <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-4 animate-in zoom-in-95">
                   <div className="flex justify-between mb-3"><span className="text-xs font-bold text-slate-500 uppercase">Type</span><button onClick={() => setShowAddMenu(false)}><X className="w-4 h-4" /></button></div>
                   <div className="grid grid-cols-2 gap-2">
                      {(['EXPERIENCE', 'TRANSPORT', 'MEAL', 'NOTE', 'STAY'] as EventType[]).map(t => (
                        <button key={t} onClick={() => handleAddMockEvent(t)} className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-sm font-semibold text-slate-700">
                          {getEventIcon(t)} {t.charAt(0) + t.slice(1).toLowerCase()}
                        </button>
                      ))}
                   </div>
                </div>
             )}
          </div>
        </div>
      </div>

      <ExperiencePickerModal 
        isOpen={activeDayPicker !== null} 
        onClose={() => setActiveDayPicker(null)} 
        dayNumber={activeDayPicker?.dayNumber || 1}
      />
    </div>
  )
}
