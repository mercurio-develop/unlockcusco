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
    let newEvent: TimelineEvent;

    switch (type) {
      case 'TRANSPORT':
        newEvent = { id, type, startTime: "10:00", title: 'Private Transfer', method: 'CAR', from: '', to: '' };
        break;
      case 'MEAL':
        newEvent = { id, type, startTime: "10:00", title: 'Lunch Reservation' };
        break;
      case 'STAY':
        newEvent = { id, type, startTime: "10:00", title: 'Hotel Check-in' };
        break;
      case 'NOTE':
        newEvent = { id, type, startTime: "10:00", title: 'Note', content: '' };
        break;
      case 'EXPERIENCE':
      default:
        newEvent = { id, type: 'EXPERIENCE', startTime: "10:00", title: 'New Block' };
        break;
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
    <div className="flex-1 bg-[#FAFAFA] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-10 lg:p-16">
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-5xl font-serif text-slate-900 tracking-tight">Day {activeDay.dayNumber}</h2>
            <p className="text-xl text-slate-500 font-light">{activeDay.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto relative border-l border-slate-200 ml-4 pl-10 space-y-10 pb-32">
          {/* Start Anchor */}
          <div className="relative group">
             <div className="absolute -left-[45px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-900 ring-4 ring-slate-100 z-20 flex items-center justify-center" />
             <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Day Start</span>
                <LocationAutocomplete 
                  value={activeDay.startAnchor?.title || ""}
                  onChange={(val) => {}} // TODO: Impl updateDay
                  className="w-full bg-transparent text-xl font-serif placeholder:text-slate-300 outline-none focus:text-slate-900"
                  placeholder="Where does the day begin?"
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
                <div className="absolute -left-[45px] top-8 w-2 h-2 rounded-full bg-slate-200 z-20 flex items-center justify-center transition-colors group-hover:bg-rose-500" />
                
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 relative group-hover:-translate-y-0.5">
                  <div className="absolute -top-3 -right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                    <button onClick={() => removeEvent(activeDay.dayNumber, evt.id)} className="w-10 h-10 bg-white border border-slate-100 text-slate-400 hover:text-rose-600 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2.5">
                      {getEventIcon(evt.type)}
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{evt.type}</span>
                    </div>
                    <input type="time" value={evt.startTime} onChange={(e) => updateEvent(activeDay.dayNumber, evt.id, { startTime: e.target.value })} className="text-sm font-mono font-medium text-slate-500 hover:text-slate-900 bg-transparent outline-none cursor-pointer" />
                  </div>
                  
                  <h4 className="text-2xl font-serif text-slate-900">{evt.title}</h4>
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
