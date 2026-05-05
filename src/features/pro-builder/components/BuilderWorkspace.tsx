"use client"

import { useState } from "react"
import { useTrip } from "@/lib/store/trip-context"
import { MapPin, Plus, Trash2, ArrowUp, ArrowDown, Utensils, AlignLeft, Car, Moon, Sparkles, X, Search, Check, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { LocationAutocomplete } from "./LocationAutocomplete"
import { BusinessAutocomplete } from "./BusinessAutocomplete"
import { ExperiencePickerModal } from "./ExperiencePickerModal"
import { PackagePreviewModal } from "./PackagePreviewModal"
import { EventType, TimelineEvent, MealEvent } from "@/lib/types/trip"
import { v4 as uuidv4 } from "uuid"

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
  const [activeDayPicker, setActiveDayPicker] = useState<{dayNumber: number, eventId?: string, initialSearch?: string} | null>(null)
  const [viewingPackage, setViewingPackage] = useState<string | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)

  const activeDay = currentTrip?.days.find(d => d.dayNumber === activeDayNumber)

  if (!activeDay) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 h-full">
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

  const moveEvent = (dayNumber: number, eventId: string, direction: number) => {
    if (!currentTrip) return
    const day = currentTrip.days.find(d => d.dayNumber === dayNumber)
    if (!day) return
    const index = day.events.findIndex(e => e.id === eventId)
    if (index < 0) return
    if (index + direction < 0 || index + direction >= day.events.length) return
    const newEvents = [...day.events]
    const temp = newEvents[index]
    newEvents[index] = newEvents[index + direction]
    newEvents[index + direction] = temp
    const newDays = currentTrip.days.map(d => d.dayNumber === dayNumber ? { ...d, events: newEvents } : d)
    setCurrentTrip({ ...currentTrip, days: newDays })
  }

  const updateDay = (dayNumber: number, updates: any) => {
    if (!currentTrip) return
    const newDays = currentTrip.days.map(d => d.dayNumber === dayNumber ? { ...d, ...updates } : d)
    setCurrentTrip({ ...currentTrip, days: newDays })
  }

  const handleAutoCalculate = () => {
    if (!currentTrip || !activeDay) return;
    
    const newEvents = [...activeDay.events].map(e => ({...e})); // deep copy to trigger render
    let currentMins = 9 * 60; // Start at 09:00 AM by default
    
    if (activeDay.startAnchor?.time) {
      const [h, m] = activeDay.startAnchor.time.split(':').map(Number);
      currentMins = h * 60 + m;
    }

    newEvents.forEach((evt) => {
      const h = Math.floor(currentMins / 60) % 24;
      const m = currentMins % 60;
      evt.startTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      let duration = 60;
      if (evt.type === 'EXPERIENCE') duration = 120;
      else if (evt.type === 'MEAL') duration = 90;
      else if (evt.type === 'TRANSPORT') duration = evt.durationMins || 30;
      else if (evt.type === 'STAY') duration = 30;
      else if (evt.type === 'NOTE') duration = 0;

      currentMins += duration;
    });

    updateDay(activeDay.dayNumber, { events: newEvents });
  };

  return (
    <div className="flex-1 bg-transparent relative flex flex-col h-full">
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeDay.dayNumber}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto p-8"
        >
          
          <div className="mb-10 flex justify-between items-start pt-10 pl-6">
            <div>
              <h2 className="text-4xl font-serif font-bold text-slate-900 mb-1">Day {activeDay.dayNumber}</h2>
              <p className="text-slate-500 text-lg">{activeDay.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            <button 
              onClick={handleAutoCalculate}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Auto-Arrange Time
            </button>
          </div>

          <div className="max-w-2xl mx-auto relative border-l border-slate-200 ml-4 pl-8 space-y-8 pb-32">
            
            {/* START ANCHOR */}
            <div className="relative group">
              <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-slate-900 z-20 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-slate-900" />
              </div>
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow transition-shadow">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-3">Starting Point</span>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <LocationAutocomplete 
                      placeholder="e.g. Hotel Monasterio, Cusco"
                      value={activeDay.startAnchor?.title || ""}
                      onChange={(val) => updateDay(activeDay.dayNumber, { startAnchor: { ...activeDay.startAnchor, title: val }})}
                      className="w-full p-2 bg-transparent border-b border-slate-200 text-base outline-none focus:border-slate-900 font-semibold text-slate-900 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* EVENTS LOOP */}
            {activeDay.events.map((evt, index) => {
              const prevLocEvent = activeDay.events.slice(0, index).reverse().find(e => ['EXPERIENCE', 'MEAL', 'STAY'].includes(e.type));
              const nextLocEvent = activeDay.events.slice(index + 1).find(e => ['EXPERIENCE', 'MEAL', 'STAY'].includes(e.type));
              const suggestedFrom = prevLocEvent?.title || activeDay.startAnchor?.title || "Starting Location";
              const suggestedTo = nextLocEvent?.title || activeDay.endAnchor?.title || "Destination";

              return (
              <div key={evt.id} className="relative group animate-in fade-in slide-in-from-bottom-2">
                <div className="absolute -left-[37px] top-8 w-4 h-4 rounded-full bg-white border-2 border-slate-200 z-20 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                </div>
                
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
                  
                  {/* Action Buttons (appears on hover) */}
                  <div className="absolute -top-3 -right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                    <button 
                      onClick={() => moveEvent(activeDay.dayNumber, evt.id, -1)}
                      className="w-8 h-8 bg-white border border-slate-100 text-slate-400 hover:text-slate-600 hover:border-slate-200 rounded-full flex items-center justify-center shadow-sm"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => removeEvent(activeDay.dayNumber, evt.id)}
                      className="w-8 h-8 bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-full flex items-center justify-center shadow-sm"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => moveEvent(activeDay.dayNumber, evt.id, 1)}
                      className="w-8 h-8 bg-white border border-slate-100 text-slate-400 hover:text-slate-600 hover:border-slate-200 rounded-full flex items-center justify-center shadow-sm"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-start mb-4 border-b border-slate-50 pb-3">
                    <div className="flex items-center gap-2">
                      {getEventIcon(evt.type)}
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{evt.type}</span>
                    </div>
                    <input 
                      type="time" 
                      value={evt.startTime} 
                      onChange={(e) => updateEvent(activeDay.dayNumber, evt.id, { startTime: e.target.value })}
                      className="text-sm font-mono text-slate-900 font-bold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl hover:bg-slate-100 focus:bg-white focus:border-slate-300 outline-none cursor-pointer transition-all [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                    />
                  </div>
                  
                  {evt.type === 'EXPERIENCE' && (
                    <div>
                      <h4 className="font-bold text-slate-900 font-serif text-xl mb-1">{evt.title || "Selected Vallecito Experience"}</h4>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">ID: {evt.id.substring(0,8)}...</p>
                        <button 
                          onClick={() => setViewingPackage(evt.id)} 
                          className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {evt.type === 'TRANSPORT' && (
                    <div className="space-y-3">
                      {(evt as any).businessId ? (
                        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 flex items-center justify-between gap-4">
                          <div>
                            <h4 className="font-serif font-bold text-slate-900 text-base leading-tight">{evt.title}</h4>
                            <p className="text-[11px] text-blue-700/80 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                              <Car className="w-3 h-3" /> Transport Provider
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => setViewingPackage((evt as any).businessId!)} 
                              className="text-xs font-bold text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Details
                            </button>
                            <button 
                              onClick={() => updateEvent(activeDay.dayNumber, evt.id, { businessId: undefined } as any)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <BusinessAutocomplete 
                          type="TRANSPORT"
                          title={evt.title === "Private Transfer" ? "" : (evt.title || "")}
                          businessId={(evt as any).businessId}
                          onChange={(title, businessId) => updateEvent(activeDay.dayNumber, evt.id, { title, businessId } as any)}
                        />
                      )}
                      
                      <div className="flex items-center gap-3 text-sm font-medium text-slate-900 relative">
                         <div className="flex-1">
                           <LocationAutocomplete 
                             value={(evt as any).from || ""} 
                             onChange={(val) => updateEvent(activeDay.dayNumber, evt.id, { from: val })} 
                             className="w-full border-b border-slate-200 pb-1.5 outline-none focus:border-slate-900 transition-colors" 
                             placeholder={suggestedFrom}
                           />
                         </div>
                         <span className="text-slate-300">&rarr;</span>
                         <div className="flex-1">
                           <LocationAutocomplete 
                             value={(evt as any).to || ""} 
                             onChange={(val) => updateEvent(activeDay.dayNumber, evt.id, { to: val })} 
                             className="w-full border-b border-slate-200 pb-1.5 outline-none focus:border-slate-900 transition-colors" 
                             placeholder={suggestedTo}
                           />
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="text" value={(evt as any).details || ''} onChange={(e) => updateEvent(activeDay.dayNumber, evt.id, { details: e.target.value })} className="flex-1 text-sm text-slate-500 outline-none bg-slate-50 p-3 rounded-xl border border-transparent focus:border-slate-200 transition-colors" placeholder="Driver notes or vehicle details..." />
                        <div className="flex items-center bg-slate-50 px-3 py-2.5 rounded-xl border border-transparent focus-within:border-slate-200 relative">
                          <select
                            value={evt.durationMins || 30}
                            onChange={(e) => updateEvent(activeDay.dayNumber, evt.id, { durationMins: parseInt(e.target.value) || 30 })}
                            className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer appearance-none pr-6 w-full relative z-10"
                          >
                            <option value={10}>10 mins</option>
                            <option value={15}>15 mins</option>
                            <option value={30}>30 mins</option>
                            <option value={45}>45 mins</option>
                            <option value={60}>1 hr</option>
                            <option value={90}>1.5 hr</option>
                            <option value={120}>2 hr</option>
                            <option value={180}>3 hr</option>
                            <option value={240}>4 hr</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none z-0" />
                        </div>
                      </div>
                    </div>
                  )}

                  {evt.type === 'MEAL' && (
                    <div className="space-y-4">
                      {(evt as MealEvent).businessId ? (
                        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-serif font-bold text-slate-900 text-lg leading-tight">{evt.title}</h4>
                              <p className="text-sm text-amber-700/80 font-medium mt-0.5 tracking-tight flex items-center gap-1.5">
                                <Utensils className="w-3.5 h-3.5" /> Reserved Dining
                              </p>
                            </div>
                            <button 
                              onClick={() => updateEvent(activeDay.dayNumber, evt.id, { businessId: undefined } as any)}
                              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <input 
                            type="text" 
                            value={(evt as any).notes || ''} 
                            onChange={(e) => updateEvent(activeDay.dayNumber, evt.id, { notes: e.target.value } as any)} 
                            className="w-full text-sm text-slate-600 outline-none bg-white p-3 rounded-xl border border-amber-100/50 focus:border-amber-200 transition-colors" 
                            placeholder="Reservation notes or dietary requirements..." 
                          />

                          <div className="flex items-center gap-2 mt-1">
                            <button 
                              onClick={() => setViewingPackage((evt as MealEvent).businessId!)} 
                              className="text-xs font-bold text-amber-700 bg-amber-100/50 hover:bg-amber-100 px-4 py-2 rounded-xl transition-colors"
                            >
                              View Details
                            </button>
                            <button 
                              onClick={() => setActiveDayPicker({ dayNumber: activeDay.dayNumber, eventId: evt.id, initialSearch: evt.title })} 
                              className="text-xs font-bold text-slate-500 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors shadow-sm"
                            >
                              Change
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <BusinessAutocomplete 
                            type="MEAL"
                            title={evt.title || ""}
                            businessId={(evt as any).businessId}
                            onChange={(title, businessId) => updateEvent(activeDay.dayNumber, evt.id, { title, businessId } as any)}
                          />
                          <input type="text" value={(evt as any).notes || ''} onChange={(e) => updateEvent(activeDay.dayNumber, evt.id, { notes: e.target.value } as any)} className="w-full text-sm text-slate-500 outline-none bg-slate-50 p-3 rounded-xl border border-transparent focus:border-slate-200 transition-colors" placeholder="Reservation notes or dietary requirements..." />
                          <div className="flex items-center mt-1">
                            <button onClick={() => setActiveDayPicker({ dayNumber: activeDay.dayNumber, eventId: evt.id, initialSearch: evt.title })} className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">
                              <Search className="w-3.5 h-3.5" /> Browse Vallecito Library
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {evt.type === 'NOTE' && (
                    <textarea 
                      value={(evt as any).content || ""} 
                      onChange={(e) => updateEvent(activeDay.dayNumber, evt.id, { content: e.target.value })}
                      className="w-full text-sm text-slate-600 outline-none resize-none h-20 bg-slate-50 p-4 rounded-2xl border border-transparent focus:border-slate-200 transition-colors leading-relaxed" 
                      placeholder="Add free-text notes, instructions, or recommendations for the client..." 
                    />
                  )}

                  {evt.type === 'STAY' && (
                    <div className="space-y-4">
                      {(evt as any).businessId ? (
                        <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100/50 flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-serif font-bold text-slate-900 text-lg leading-tight">{evt.title}</h4>
                              <p className="text-sm text-purple-700/80 font-medium mt-0.5 tracking-tight flex items-center gap-1.5">
                                <Moon className="w-3.5 h-3.5" /> Booked Stay
                              </p>
                            </div>
                            <button 
                              onClick={() => updateEvent(activeDay.dayNumber, evt.id, { businessId: undefined } as any)}
                              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <button 
                              onClick={() => setViewingPackage((evt as any).businessId!)} 
                              className="text-xs font-bold text-purple-700 bg-purple-100/50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors"
                            >
                              View Details
                            </button>
                            <button 
                              onClick={() => setActiveDayPicker({ dayNumber: activeDay.dayNumber, eventId: evt.id, initialSearch: evt.title })} 
                              className="text-xs font-bold text-slate-500 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors shadow-sm"
                            >
                              Change
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <BusinessAutocomplete 
                            type="STAY"
                            title={evt.title || ""}
                            businessId={(evt as any).businessId}
                            onChange={(title, businessId) => updateEvent(activeDay.dayNumber, evt.id, { title, businessId } as any)}
                          />
                          <div className="flex items-center mt-1">
                            <button onClick={() => setActiveDayPicker({ dayNumber: activeDay.dayNumber, eventId: evt.id, initialSearch: evt.title })} className="flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors">
                              <Search className="w-3.5 h-3.5" /> Browse Vallecito Library
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            )})}

            {/* ADD BLOCK BUTTON */}
            <div className="relative pt-6">
              {!showAddMenu ? (
                <button 
                  onClick={() => setShowAddMenu(true)}
                  className="w-full py-5 border border-slate-200 rounded-3xl text-slate-500 font-bold hover:border-slate-900 hover:text-slate-900 transition-all flex items-center justify-center gap-2 bg-white shadow-sm hover:shadow"
                >
                  <Plus className="w-4 h-4" /> Add Itinerary Block
                </button>
              ) : (
                <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-5 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Block Type</span>
                    <button onClick={() => setShowAddMenu(false)} className="text-slate-400 hover:text-slate-900 bg-slate-50 p-1.5 rounded-full"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleAddMockEvent('EXPERIENCE')} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors text-sm font-semibold text-slate-700">
                      <MapPin className="w-4 h-4 text-emerald-500" /> Experience
                    </button>
                    <button onClick={() => handleAddMockEvent('TRANSPORT')} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors text-sm font-semibold text-slate-700">
                      <Car className="w-4 h-4 text-blue-500" /> Transport
                    </button>
                    <button onClick={() => handleAddMockEvent('MEAL')} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50 transition-colors text-sm font-semibold text-slate-700">
                      <Utensils className="w-4 h-4 text-amber-500" /> Meal
                    </button>
                    <button onClick={() => handleAddMockEvent('STAY')} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-colors text-sm font-semibold text-slate-700">
                      <Moon className="w-4 h-4 text-purple-500" /> Stay
                    </button>
                    <button onClick={() => handleAddMockEvent('NOTE')} className="flex items-center justify-center gap-3 p-4 rounded-2xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-700 col-span-2 mt-1">
                      <AlignLeft className="w-4 h-4 text-slate-500" /> Free Text Note
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* DAY COMPLETE TOGGLE */}
            <div className="pt-8 mb-8 border-t border-slate-200/60 flex flex-col items-center">
              <button 
                onClick={() => updateDay(activeDay.dayNumber, { isComplete: !activeDay.isComplete })}
                className={`w-full max-w-sm py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${activeDay.isComplete ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-slate-900 text-white border border-slate-900 hover:bg-slate-800'}`}
              >
                {activeDay.isComplete ? <><Check className="w-5 h-5" /> Day Completed</> : 'Mark Day Complete'}
              </button>
              {activeDay.isComplete && (
                <p className="text-xs text-slate-500 text-center mt-3 max-w-sm">
                  Route calculated. View the map to see the union of all completed days.
                </p>
              )}
            </div>

          </div>
        </motion.div>
      </AnimatePresence>

      <ExperiencePickerModal 
        isOpen={activeDayPicker !== null} 
        onClose={() => setActiveDayPicker(null)} 
        dayNumber={activeDayPicker?.dayNumber || 1}
        eventId={activeDayPicker?.eventId}
        initialSearch={activeDayPicker?.initialSearch}
      />

      <PackagePreviewModal 
        packageId={viewingPackage}
        onClose={() => setViewingPackage(null)}
      />

    </div>
  )
}
