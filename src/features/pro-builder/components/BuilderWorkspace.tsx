"use client"

import { useState, useEffect } from "react"
import { useTrip } from "@/lib/store/trip-context"
import { MapPin, Plus, Trash2, ArrowUp, ArrowDown, Utensils, AlignLeft, Car, Moon, Sparkles, X, Search, Check, ChevronDown, Navigation, Map } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { LocationAutocomplete } from "./LocationAutocomplete"
import { BusinessAutocomplete } from "./BusinessAutocomplete"
import { PackagePreviewModal } from "./PackagePreviewModal"

import type { TimelineEvent, EventType } from "@/lib/types/trip"

export function BuilderWorkspace({ 
  selectedId, 
  onSelectEvent,
  variant = 'pro'
}: { 
  selectedId?: string | null, 
  onSelectEvent?: (id: string) => void,
  variant?: 'live' | 'pro'
}) {
  const { currentTrip, setCurrentTrip, activeDayNumber, addEvent, removeEvent, updateEvent, setViewState, setPanelMode, setExchangeTargetIndex, insertWaypoint, setStartAnchorLocation, updateEndAnchorLocation, isMapPicking, setIsMapPicking } = useTrip()
  const [viewingPackage, setViewingPackage] = useState<string | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [dropError, setDropError] = useState<{ id: string, message: string } | null>(null)
  const [draggedEventIndex, setDraggedEventIndex] = useState<number | null>(null)

  useEffect(() => {
    if (dropError) {
      const timer = setTimeout(() => setDropError(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [dropError])

  const activeDay = currentTrip?.days.find((d: any) => d.dayNumber === activeDayNumber)

  const handleAddExperience = (data: any) => {
    const id = crypto.randomUUID()
    let defaultStartTime = "10:00"
    
    if (activeDay && activeDay.events.length > 0) {
      const lastEvent = activeDay.events[activeDay.events.length - 1]
      const [hours, minutes] = (lastEvent.startTime || "10:00").split(':').map(Number)
      defaultStartTime = `${String((hours + 1) % 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    }

    const tagsStr = (data.tags || '').toLowerCase() + ' ' + (data.category || '').toLowerCase();

    let type: EventType = 'EXPERIENCE';
    if (!data.isPackage) {
      if (tagsStr.includes('stay') || tagsStr.includes('hotel') || tagsStr.includes('lodge')) {
        type = 'STAY';
      } else if (tagsStr.includes('transport') || tagsStr.includes('taxi')) {
        type = 'TRANSPORT';
      } else if (tagsStr.includes('food') || tagsStr.includes('restaurant') || tagsStr.includes('dining')) {
        type = 'MEAL';
      }
    }

    let newEvent: TimelineEvent;
    switch (type) {
      case 'TRANSPORT':
        newEvent = { id, type, startTime: defaultStartTime, title: data.name, method: 'CAR', from: '', to: '', businessId: data.id, packageId: data.isPackage ? data.id : undefined, service: data } as any;
        break;
      case 'MEAL':
        newEvent = { id, type, startTime: defaultStartTime, title: data.name, businessId: data.id, packageId: data.isPackage ? data.id : undefined, service: data, locationLat: data.lat, locationLng: data.lng } as any;
        break;
      case 'STAY':
        newEvent = { id, type, startTime: defaultStartTime, title: data.name, businessId: data.id, packageId: data.isPackage ? data.id : undefined, service: data, lat: data.lat, lng: data.lng } as any;
        break;
      case 'EXPERIENCE':
      default:
        newEvent = { id, type: 'EXPERIENCE', startTime: defaultStartTime, title: data.name, businessId: data.id, packageId: data.isPackage ? data.id : undefined, service: data } as any;
        break;
    }

    addEvent(activeDayNumber!, newEvent)
    setShowAddMenu(false)
  }

  const moveEvent = (dayNumber: number, eventId: string, direction: number) => {
    if (!currentTrip) return
    const day = currentTrip.days.find((d: any) => d.dayNumber === dayNumber)
    if (!day) return
    const index = day.events.findIndex((e: any) => e.id === eventId)
    if (index < 0) return
    if (index + direction < 0 || index + direction >= day.events.length) return
    const newEvents = [...day.events]
    const temp = newEvents[index]
    newEvents[index] = newEvents[index + direction]
    newEvents[index + direction] = temp
    const newDays = currentTrip.days.map((d: any) => d.dayNumber === dayNumber ? { ...d, events: newEvents } : d)
    setCurrentTrip({ ...currentTrip, days: newDays })
  }

  const reorderEvent = (dayNumber: number, oldIndex: number, newIndex: number) => {
    if (!currentTrip) return;
    const day = currentTrip.days.find((d: any) => d.dayNumber === dayNumber);
    if (!day) return;
    if (oldIndex < 0 || oldIndex >= day.events.length || newIndex < 0 || newIndex >= day.events.length) return;
    
    const newEvents = [...day.events];
    const [movedEvent] = newEvents.splice(oldIndex, 1);
    newEvents.splice(newIndex, 0, movedEvent);
    
    const newDays = currentTrip.days.map((d: any) => d.dayNumber === dayNumber ? { ...d, events: newEvents } : d);
    setCurrentTrip({ ...currentTrip, days: newDays });
  };

  const updateDay = (dayNumber: number, updates: any) => {
    if (!currentTrip) return
    const newDays = currentTrip.days.map((d: any) => d.dayNumber === dayNumber ? { ...d, ...updates } : d)
    setCurrentTrip({ ...currentTrip, days: newDays })
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        updateDay(activeDay?.dayNumber || 1, { 
          startAnchor: { 
            ...activeDay?.startAnchor, 
            title: "Current Location", 
            lat: latitude, 
            lng: longitude 
          } 
        })
      },
      () => {
        alert("Unable to retrieve your location")
      }
    )
  }

  const handleDropOnAnchor = (e: React.DragEvent, target: 'start' | 'end') => {
    e.preventDefault();
    try {
      const business = JSON.parse(e.dataTransfer.getData("application/json"));
      if (variant === 'pro') {
        const title = business.name || business.title;
        if (target === 'start') {
          updateDay(activeDayNumber!, { startAnchor: { ...activeDay?.startAnchor, title, lat: business.lat, lng: business.lng, service: business } });
        } else {
          updateDay(activeDayNumber!, { endAnchor: { ...activeDay?.endAnchor, title, lat: business.lat, lng: business.lng, service: business } });
        }
      } else {
        setExchangeTargetIndex(target === 'start' ? -1 : -2);
        insertWaypoint(business);
      }
    } catch (err) {
      console.error("Failed to handle drop on anchor:", err);
    }
  };

  const handleMapSelectionTrigger = (target: 'start' | 'end') => {
    setIsMapPicking({ active: true, target });
  };

  if (!activeDay) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 h-full">
        <Sparkles className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-serif">Select a day to start building</p>
      </div>
    )
  }

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
          </div>

          <div className="max-w-2xl mx-auto relative border-l border-slate-200 ml-4 pl-8 space-y-8 pb-32">

            {/* START ANCHOR */}
            <div 
              className="relative group"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropOnAnchor(e, 'start')}
            >
              <div className={`absolute -left-[37px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-slate-900 z-20 flex items-center justify-center ${isMapPicking.active && isMapPicking.target === 'start' ? 'ring-4 ring-rose-500/30' : ''}`}>
                <div className="w-1 h-1 rounded-full bg-slate-900" />
              </div>
              <div className={cn(
                "bg-white border rounded-3xl p-5 shadow-sm transition-all",
                isMapPicking.active && isMapPicking.target === 'start' ? "border-rose-500 ring-2 ring-rose-500/10 shadow-lg" : "border-slate-100 hover:shadow hover:border-slate-200"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] block">Starting Point</span>
                  {variant === 'pro' && (
                    <input 
                      type="time" 
                      value={activeDay.startAnchor?.time || "09:00"} 
                      onChange={(e) => updateDay(activeDay.dayNumber, { startAnchor: { ...activeDay.startAnchor, time: e.target.value }})}
                      className="text-sm font-mono text-slate-900 font-bold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl hover:bg-slate-100 focus:bg-white focus:border-slate-300 outline-none cursor-pointer transition-all [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                    />
                  )}
                  {variant === 'live' && activeDay.startAnchor?.time && (
                    <span className="text-sm font-bold text-slate-400 font-mono tracking-tighter">{activeDay.startAnchor.time}</span>
                  )}
                </div>
                {dropError && dropError.id === `startAnchor-${activeDay.dayNumber}` && (
                  <div className="mb-2">
                    <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md animate-in slide-in-from-top-1 fade-in">{dropError.message}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="flex-1">
                    {variant === 'pro' ? (
                      <LocationAutocomplete 
                        placeholder="e.g. Hotel Monasterio, Cusco"
                        value={activeDay.startAnchor?.title || ""}
                        onChange={(val, lat, lng) => updateDay(activeDay.dayNumber, { startAnchor: { ...activeDay.startAnchor, title: val, lat, lng }})}
                        className="w-full p-2 bg-transparent border-b border-slate-200 text-base outline-none focus:border-slate-900 font-semibold text-slate-900 transition-colors"
                      />
                    ) : (
                      <h4 className="text-base font-bold text-slate-900 px-2 pb-2 border-b border-transparent">{activeDay.startAnchor?.title || "Establish your starting point"}</h4>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={() => { setExchangeTargetIndex(-1); setPanelMode('categories'); }} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
                      <Search className="w-3.5 h-3.5" /> {variant === 'live' ? "Set Location" : "Drop from library"}
                    </button>
                    {variant === 'live' && (
                      <button 
                        onClick={handleUseCurrentLocation}
                        className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" /> Use My Position
                      </button>
                    )}
                    <button 
                      onClick={() => handleMapSelectionTrigger('start')}
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-bold transition-colors",
                        isMapPicking.active && isMapPicking.target === 'start' ? "text-rose-600" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <Map className="w-3.5 h-3.5" /> {isMapPicking.active && isMapPicking.target === 'start' ? "Picking..." : "Select on Map"}
                    </button>
                  </div>
                  {(activeDay.startAnchor as any)?.service && (
                    <button 
                      onClick={() => setViewingPackage((activeDay.startAnchor as any).service.id)} 
                      className="text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl transition-colors shrink-0"
                    >
                      View
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* EVENTS */}
            <div 
              className="space-y-12"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent triggering other drops if nested
                try {
                  const business = JSON.parse(e.dataTransfer.getData("application/json"));
                  if (variant === 'pro') {
                    handleAddExperience(business);
                  } else {
                    setExchangeTargetIndex(activeDay.events.length);
                    insertWaypoint(business);
                  }
                } catch (err) {
                  console.error("Failed to handle drop on events container:", err);
                }
              }}
            >
              {activeDay.events.map((event: any, index: number) => {
                const isSelected = selectedId === event.id
                
                return (
                  <div 
                    key={event.id} 
                    id={`event-${event.id}`}
                    className={cn(
                      "relative transition-opacity duration-200",
                      draggedEventIndex === index ? "opacity-40" : "opacity-100"
                    )}
                    draggable
                    onDragStart={(e) => {
                      setDraggedEventIndex(index);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('application/vnd.event-index', index.toString());
                    }}
                    onDragEnd={() => setDraggedEventIndex(null)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const fromIndexStr = e.dataTransfer.getData('application/vnd.event-index');
                      if (fromIndexStr !== "") {
                        const fromIndex = parseInt(fromIndexStr, 10);
                        if (!isNaN(fromIndex) && fromIndex !== index) {
                          reorderEvent(activeDay.dayNumber, fromIndex, index);
                        }
                      } else {
                        // Handle a business drop onto a specific index
                        try {
                          const business = JSON.parse(e.dataTransfer.getData("application/json"));
                          if (variant === 'pro') {
                            handleAddExperience(business); // For now appends, ideally we would insert at index.
                          } else {
                            setExchangeTargetIndex(index);
                            insertWaypoint(business);
                          }
                        } catch (err) {
                          console.error("Failed to drop business on event index:", err);
                        }
                      }
                      setDraggedEventIndex(null);
                    }}
                  >
                    {/* Line Connector */}
                    <div className="absolute -left-[32.5px] top-0 bottom-0 flex flex-col items-center">
                       {/* Transport Connection logic could go here */}
                    </div>

                    <div className={`absolute -left-[37px] top-8 w-4 h-4 rounded-full border-2 z-20 flex items-center justify-center transition-colors ${isSelected ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300'}`}>
                      <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-300'}`} />
                    </div>

                    <div 
                      onClick={() => onSelectEvent && onSelectEvent(event.id)}
                      className={cn(
                        "bg-white border rounded-3xl p-6 cursor-pointer transition-all relative group/card",
                        isSelected ? "border-slate-900 shadow-xl ring-1 ring-slate-900/5 -translate-y-1" : "border-slate-100 shadow-sm hover:shadow-md"
                      )}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                           <span className={cn(
                             "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                             event.type === 'MEAL' ? "bg-amber-50 text-amber-600" :
                             event.type === 'STAY' ? "bg-purple-50 text-purple-600" :
                             event.type === 'TRANSPORT' ? "bg-blue-50 text-blue-600" :
                             "bg-emerald-50 text-emerald-600"
                           )}>
                             {event.type}
                           </span>
                        </div>
                        <input 
                          type="time" 
                          value={event.startTime || "10:00"} 
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateEvent(activeDay.dayNumber, event.id, { startTime: e.target.value })}
                          className="text-sm font-mono text-slate-900 font-bold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl hover:bg-slate-100 focus:bg-white focus:border-slate-300 outline-none cursor-pointer transition-all"
                        />
                      </div>

                      <h4 className="text-xl font-serif font-bold text-slate-900 mb-2">{event.title}</h4>
                      
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveEvent(activeDay.dayNumber, event.id, -1); }}
                            className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveEvent(activeDay.dayNumber, event.id, 1); }}
                            className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeEvent(activeDay.dayNumber, event.id); }}
                          className="p-2 text-rose-300 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ADD STOP BUTTON */}
            <div 
              className="relative pt-4"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                try {
                  const business = JSON.parse(e.dataTransfer.getData("application/json"));
                  if (variant === 'pro') {
                    handleAddExperience(business);
                  } else {
                    setExchangeTargetIndex(activeDay.events.length);
                    insertWaypoint(business);
                  }
                } catch (err) {
                  console.error("Failed to handle drop on add stop button:", err);
                }
              }}
            >
               <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-slate-200 bg-white z-20 flex items-center justify-center">
                  <Plus className="w-2 h-2 text-slate-300" />
               </div>
               <button 
                 onClick={() => setPanelMode('categories')}
                 className="w-full py-6 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold text-sm hover:border-slate-400 hover:text-slate-600 transition-all bg-white/50 hover:bg-white"
               >
                 Add Next Stop from Library
               </button>
            </div>

            {/* END ANCHOR */}
            <div 
              className="relative pt-6"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropOnAnchor(e, 'end')}
            >
              <div 
                className="relative group cursor-pointer"
                onClick={() => onSelectEvent && onSelectEvent(`endAnchor-${activeDay.dayNumber}`)}
              >
                <div className={`absolute -left-[37px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 z-20 flex items-center justify-center transition-colors ${selectedId === `endAnchor-${activeDay.dayNumber}` ? 'bg-rose-600 border-rose-600' : 'bg-white border-rose-600 group-hover:bg-rose-50'} ${isMapPicking.active && isMapPicking.target === 'end' ? 'ring-4 ring-rose-500/30' : ''}`}>
                  <div className={`w-1 h-1 rounded-full ${selectedId === `endAnchor-${activeDay.dayNumber}` ? 'bg-white' : 'bg-rose-600'}`} />
                </div>
                <div className={cn(
                  "bg-white border rounded-3xl p-5 shadow-sm transition-all",
                  selectedId === `endAnchor-${activeDay.dayNumber}` ? "border-rose-200 shadow-md ring-1 ring-rose-600/5" : "border-slate-100 hover:shadow hover:border-slate-200",
                  isMapPicking.active && isMapPicking.target === 'end' ? "border-rose-500 ring-2 ring-rose-500/10 shadow-lg" : ""
                )}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] block">End of Day</span>
                    {variant === 'pro' && (
                      <input 
                        type="time" 
                        value={activeDay.endAnchor?.time || "18:00"} 
                        onChange={(e) => updateDay(activeDay.dayNumber, { endAnchor: { ...activeDay.endAnchor, time: e.target.value }})}
                        className="text-sm font-mono text-slate-900 font-bold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl hover:bg-slate-100 focus:bg-white focus:border-slate-300 outline-none cursor-pointer transition-all [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                      />
                    )}
                    {variant === 'live' && activeDay.endAnchor?.time && (
                      <span className="text-sm font-bold text-slate-400 font-mono tracking-tighter">{activeDay.endAnchor.time}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      {variant === 'pro' ? (
                        <LocationAutocomplete 
                          placeholder="e.g. Hotel Monasterio, Cusco"
                          value={activeDay.endAnchor?.title || ""}
                          onChange={(val, lat, lng) => updateDay(activeDay.dayNumber, { endAnchor: { ...activeDay.endAnchor, title: val, lat, lng }})}
                          className="w-full p-2 bg-transparent border-b border-slate-200 text-base outline-none focus:border-slate-900 font-semibold text-slate-900 transition-colors"
                        />
                      ) : (
                        <h4 className="text-base font-bold text-slate-900 px-2 pb-2 border-b border-transparent">{activeDay.endAnchor?.title || "Where will your journey end?"}</h4>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-3 flex-wrap">
                      <button onClick={() => { setExchangeTargetIndex(-2); setPanelMode('categories'); }} className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors">
                        <Search className="w-3.5 h-3.5" /> {variant === 'live' ? "Set Location" : "Drop from library"}
                      </button>
                      <button 
                        onClick={() => handleMapSelectionTrigger('end')}
                        className={cn(
                          "flex items-center gap-1.5 text-xs font-bold transition-colors",
                          isMapPicking.active && isMapPicking.target === 'end' ? "text-rose-600" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        <Map className="w-3.5 h-3.5" /> {isMapPicking.active && isMapPicking.target === 'end' ? "Picking..." : "Select on Map"}
                      </button>
                    </div>
                    {(activeDay.endAnchor as any)?.service && (
                      <button 
                        onClick={() => setViewingPackage((activeDay.endAnchor as any).service.id)} 
                        className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors shrink-0"
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 mb-8 border-t border-slate-200/60 flex flex-col items-center">
               <button 
                 onClick={() => setViewState('checkout')}
                 className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all hover:-translate-y-1 active:translate-y-0"
               >
                 Secure My Day
               </button>
               <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center max-w-[200px]">
                 Connecting you to local experts in Sacred Valley
               </p>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>

      <PackagePreviewModal 
        packageId={viewingPackage} 
        onClose={() => setViewingPackage(null)} 
      />
    </div>
  )
}
