"use client"

import { useState } from "react"
import { useBuilder } from "@/features/pro-builder/store/builder-context"
import { MapPin, Plus, Edit2, Calendar, Users, Moon, Plane, Car, Utensils, AlignLeft, Trash2, Check, X, ArrowUp, ArrowDown } from "lucide-react"
import { ExperiencePickerModal } from "./ExperiencePickerModal"
import { PackagePreviewModal } from "./PackagePreviewModal"
import { LocationAutocomplete } from "./LocationAutocomplete"
import { motion, AnimatePresence } from "framer-motion"
import { TimelineEvent, EventType } from "../types"
import { v4 as uuidv4 } from "uuid"

function getEventIcon(type: EventType) {
  switch (type) {
    case 'EXPERIENCE': return <MapPin className="w-4 h-4 text-emerald-500" />
    case 'TRANSPORT': return <Car className="w-4 h-4 text-blue-500" />
    case 'MEAL': return <Utensils className="w-4 h-4 text-amber-500" />
    case 'NOTE': return <AlignLeft className="w-4 h-4 text-slate-500" />
  }
}

export function BuilderWorkspace() {
  const { draftTrip, updateDay, activeDayNumber, setActiveDayNumber, setViewState, removeEventFromDay, addEventToDay, updateEventInDay, moveEvent } = useBuilder()
  
  const [activeDayPicker, setActiveDayPicker] = useState<{dayNumber: number, eventId?: string} | null>(null)
  const [viewingPackage, setViewingPackage] = useState<string | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)

  const activeDay = draftTrip.days.find(d => d.dayNumber === activeDayNumber)

  const handleAddMockEvent = (type: EventType) => {
    if (!activeDayNumber || !activeDay) return
    const id = uuidv4()
    let newEvent: TimelineEvent

    // Auto-fill logic for from/to based on previous events and anchors
    let defaultFrom = activeDay.startAnchor.locationStr || "Start Location"
    let defaultTo = activeDay.endAnchor.locationStr || "End Location"
    let defaultStartTime = "10:00"

    if (activeDay.events.length > 0) {
      const lastEvent = activeDay.events[activeDay.events.length - 1]
      // Guess start time: 2 hours after the last event
      if (lastEvent.startTime) {
        const [hours, minutes] = lastEvent.startTime.split(':').map(Number)
        defaultStartTime = `${String((hours + 2) % 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      }
      
      if (lastEvent.type === 'TRANSPORT') {
        defaultFrom = lastEvent.to || defaultFrom
      } else if (lastEvent.type === 'MEAL') {
        defaultFrom = lastEvent.experienceTitle || lastEvent.location || lastEvent.name || defaultFrom
      } else if (lastEvent.type === 'EXPERIENCE') {
        defaultFrom = lastEvent.title || defaultFrom
      }
    } else {
      if (activeDay.startAnchor.time) {
        const [hours, minutes] = activeDay.startAnchor.time.split(':').map(Number)
        defaultStartTime = `${String((hours + 1) % 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      }
    }
    
    switch (type) {
      case 'TRANSPORT':
        newEvent = { id, type, startTime: defaultStartTime, method: "CAR", from: defaultFrom, to: defaultTo }
        break
      case 'MEAL':
        newEvent = { id, type, startTime: defaultStartTime, name: "Lunch Reservation", location: defaultTo }
        break
      case 'NOTE':
        newEvent = { id, type, startTime: defaultStartTime, content: "Client has requested extra time for photography." }
        break
      case 'EXPERIENCE':
        setActiveDayPicker({ dayNumber: activeDayNumber })
        setShowAddMenu(false)
        return
    }
    
    addEventToDay(activeDayNumber, newEvent)
    setShowAddMenu(false)
  }

  return (
    <div className="w-full flex bg-slate-50 min-h-[600px] h-[800px]">
      
      {/* Left Sidebar - Timeline */}
      <div className="w-1/3 bg-slate-900 flex flex-col border-r border-slate-800 hidden md:flex">
        
        {/* Trip Header */}
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-serif font-bold text-white mb-2 leading-tight">{draftTrip.title}</h2>
          <div className="flex gap-4 text-slate-400 text-xs font-semibold">
            <span>{draftTrip.startDate}</span>
            <span>•</span>
            <span>{draftTrip.paxCount} Pax</span>
          </div>
        </div>

        {/* Days List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {draftTrip.days.map((day) => {
            const isActive = day.dayNumber === activeDayNumber
            return (
              <button
                key={day.dayNumber}
                onClick={() => setActiveDayNumber(day.dayNumber)}
                className={`w-full text-left p-4 rounded-2xl transition-all border ${
                  isActive 
                    ? 'bg-slate-800 border-slate-700 shadow-md' 
                    : 'bg-transparent border-transparent hover:bg-slate-800/50'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`font-bold font-serif ${isActive ? 'text-white' : 'text-slate-300'}`}>Day {day.dayNumber}</h3>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                    {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {day.startAnchor.locationStr || 'Location pending'}
                </div>
                
                {/* Mini Event Indicators */}
                {day.events.length > 0 && (
                  <div className="flex gap-1 mt-3">
                    {day.events.map(e => (
                      <div key={e.id} className="w-2 h-2 rounded-full opacity-70" style={{ 
                        backgroundColor: e.type === 'EXPERIENCE' ? '#10b981' : e.type === 'TRANSPORT' ? '#3b82f6' : e.type === 'MEAL' ? '#f59e0b' : '#64748b' 
                      }} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800">
          <button 
            onClick={() => setViewState('checkout')}
            className="w-full bg-rose-600 text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-rose-700 transition-colors"
          >
            Finalize Trip &rarr;
          </button>
        </div>
      </div>

      {/* Right Content - Day Editor */}
      <div className="flex-1 bg-white relative flex flex-col">
        <AnimatePresence mode="wait">
          {activeDay ? (
            <motion.div 
              key={activeDay.dayNumber}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-y-auto p-8"
            >
              
              <div className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-slate-900">Editing Day {activeDay.dayNumber}</h2>
                <p className="text-slate-500">{new Date(activeDay.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>

              <div className="max-w-2xl mx-auto relative border-l-2 border-slate-100 ml-4 pl-8 space-y-8 pb-32">
                
                {/* START ANCHOR */}
                <div className="relative group">
                  <div className="absolute -left-[43px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)] z-20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-rose-300 transition-colors">
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em] block mb-2">Start Anchor</span>
                    <div className="flex gap-2">
                      <input 
                        type="time" 
                        value={activeDay.startAnchor.time}
                        onChange={(e) => updateDay(activeDay.dayNumber, { startAnchor: { ...activeDay.startAnchor, time: e.target.value }})}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-rose-500 font-mono text-slate-900"
                      />
                      <div className="flex-1">
                        <LocationAutocomplete 
                          placeholder="e.g. Hotel Monasterio, Cusco"
                          value={activeDay.startAnchor.locationStr}
                          onChange={(val) => updateDay(activeDay.dayNumber, { startAnchor: { ...activeDay.startAnchor, locationStr: val }})}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-rose-500 font-semibold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* EVENTS LOOP */}
                {activeDay.events.map((evt) => (
                  <div key={evt.id} className="relative group animate-in fade-in slide-in-from-bottom-2">
                    <div className="absolute -left-[41px] top-6 w-4 h-4 rounded-full bg-white border-2 border-slate-300 z-20 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-slate-300" />
                    </div>
                    
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative">
                      
                      {/* Action Buttons (appears on hover) */}
                      <div className="absolute -top-3 -right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                        <button 
                          onClick={() => moveEvent(activeDay.dayNumber, evt.id, -1)}
                          className="w-8 h-8 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 rounded-full flex items-center justify-center shadow-sm"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => removeEventFromDay(activeDay.dayNumber, evt.id)}
                          className="w-8 h-8 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-full flex items-center justify-center shadow-sm"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => moveEvent(activeDay.dayNumber, evt.id, 1)}
                          className="w-8 h-8 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 rounded-full flex items-center justify-center shadow-sm"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          {getEventIcon(evt.type)}
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{evt.type}</span>
                        </div>
                        <input 
                          type="time" 
                          value={evt.startTime} 
                          onChange={(e) => updateEventInDay(activeDay.dayNumber, evt.id, { startTime: e.target.value })}
                          className="text-sm font-mono text-slate-900 font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none cursor-pointer transition-all shadow-sm [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                        />
                      </div>
                      
                      {evt.type === 'EXPERIENCE' && (
                        <div>
                          <h4 className="font-bold text-slate-900 font-serif text-lg">{evt.title || "Selected Vallecito Experience"}</h4>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-slate-500">ID: {evt.packageId}</p>
                            <button 
                              onClick={() => setViewingPackage(evt.packageId)} 
                              className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              See Details
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {evt.type === 'TRANSPORT' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 relative">
                             <div className="w-1/2">
                               <LocationAutocomplete 
                                 value={evt.from} 
                                 onChange={(val, lat, lng) => updateEventInDay(activeDay.dayNumber, evt.id, { from: val, fromLat: lat, fromLng: lng })} 
                                 className="w-full border-b border-dashed border-slate-300 pb-1 outline-none focus:border-blue-500" 
                                 placeholder="From" 
                               />
                             </div>
                             <span className="text-slate-400">&rarr;</span>
                             <div className="w-1/2">
                               <LocationAutocomplete 
                                 value={evt.to} 
                                 onChange={(val, lat, lng) => updateEventInDay(activeDay.dayNumber, evt.id, { to: val, toLat: lat, toLng: lng })} 
                                 className="w-full border-b border-dashed border-slate-300 pb-1 outline-none focus:border-blue-500" 
                                 placeholder="To" 
                               />
                             </div>
                          </div>
                          <input type="text" value={evt.details || ''} onChange={(e) => updateEventInDay(activeDay.dayNumber, evt.id, { details: e.target.value })} className="w-full text-xs text-slate-500 outline-none" placeholder="e.g. Private Driver - Juan" />
                        </div>
                      )}

                      {evt.type === 'MEAL' && (
                        <div className="space-y-2">
                          <input type="text" value={evt.name} onChange={(e) => updateEventInDay(activeDay.dayNumber, evt.id, { name: e.target.value })} className="w-full font-bold text-slate-900 outline-none focus:text-amber-600" placeholder="Restaurant Name" />
                          <input type="text" value={evt.notes || ''} onChange={(e) => updateEventInDay(activeDay.dayNumber, evt.id, { notes: e.target.value })} className="w-full text-xs text-slate-500 outline-none" placeholder="Reservation notes..." />
                          {evt.packageId ? (
                            <div className="relative border border-amber-200 bg-amber-50/50 rounded-xl p-3 mt-3 shadow-sm group/nested">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4 text-amber-600" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Linked Experience</p>
                                    <h5 className="font-bold text-slate-900 text-sm leading-tight">{evt.experienceTitle}</h5>
                                  </div>
                                </div>
                                <button onClick={() => updateEventInDay(activeDay.dayNumber, evt.id, { packageId: undefined, experienceTitle: undefined })} className="text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover/nested:opacity-100 p-1">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex justify-end mt-2">
                                <button 
                                  onClick={() => setViewingPackage(evt.packageId!)} 
                                  className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                >
                                  See Details
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setActiveDayPicker({ dayNumber: activeDay.dayNumber, eventId: evt.id })} className="mt-2 flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">
                              <Plus className="w-3.5 h-3.5" /> Add Experience
                            </button>
                          )}
                        </div>
                      )}

                      {evt.type === 'NOTE' && (
                        <textarea 
                          value={evt.content} 
                          onChange={(e) => updateEventInDay(activeDay.dayNumber, evt.id, { content: e.target.value })}
                          className="w-full text-sm text-slate-700 outline-none resize-none h-16 bg-slate-50 p-2 rounded-lg" 
                          placeholder="Free text notes for the client..." 
                        />
                      )}

                    </div>
                  </div>
                ))}

                {/* ADD BLOCK BUTTON */}
                <div className="relative pt-4">
                  {!showAddMenu ? (
                    <button 
                      onClick={() => setShowAddMenu(true)}
                      className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-semibold hover:border-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-2 bg-slate-50/50"
                    >
                      <Plus className="w-4 h-4" /> Add Itinerary Block
                    </button>
                  ) : (
                    <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-4 animate-in zoom-in-95 duration-200">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Block Type</span>
                        <button onClick={() => setShowAddMenu(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleAddMockEvent('EXPERIENCE')} className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors text-sm font-semibold text-slate-700">
                          <MapPin className="w-4 h-4 text-emerald-500" /> Experience
                        </button>
                        <button onClick={() => handleAddMockEvent('TRANSPORT')} className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors text-sm font-semibold text-slate-700">
                          <Car className="w-4 h-4 text-blue-500" /> Transport
                        </button>
                        <button onClick={() => handleAddMockEvent('MEAL')} className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50 transition-colors text-sm font-semibold text-slate-700">
                          <Utensils className="w-4 h-4 text-amber-500" /> Meal
                        </button>
                        <button onClick={() => handleAddMockEvent('NOTE')} className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-700">
                          <AlignLeft className="w-4 h-4 text-slate-500" /> Note
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* END ANCHOR */}
                <div className="relative group mt-8">
                  <div className="absolute -left-[43px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-slate-800 z-20 flex items-center justify-center">
                    <Moon className="w-3 h-3 text-slate-800" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-400 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">End Anchor</span>
                      {activeDay.events.length > 0 && (
                        <button 
                          onClick={() => {
                            const lastEvent = activeDay.events[activeDay.events.length - 1];
                            let lastLoc = "";
                            if (lastEvent.type === 'TRANSPORT') lastLoc = lastEvent.to;
                            else if (lastEvent.type === 'MEAL') lastLoc = lastEvent.location || lastEvent.name;
                            else if (lastEvent.type === 'EXPERIENCE') lastLoc = lastEvent.title;
                            if (lastLoc) updateDay(activeDay.dayNumber, { endAnchor: { ...activeDay.endAnchor, locationStr: lastLoc } });
                          }}
                          className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-md transition-colors border border-rose-100"
                        >
                          Use Last Location
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="time" 
                        value={activeDay.endAnchor.time}
                        onChange={(e) => updateDay(activeDay.dayNumber, { endAnchor: { ...activeDay.endAnchor, time: e.target.value }})}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-500 font-mono text-slate-900"
                      />
                      <div className="flex-1">
                        <LocationAutocomplete 
                          placeholder="e.g. Tambo del Inka, Urubamba"
                          value={activeDay.endAnchor.locationStr}
                          onChange={(val) => updateDay(activeDay.dayNumber, { endAnchor: { ...activeDay.endAnchor, locationStr: val }})}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-500 font-semibold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-slate-400"
            >
              <Calendar className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-serif">Select a day from the timeline to edit.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ExperiencePickerModal 
        isOpen={activeDayPicker !== null} 
        onClose={() => setActiveDayPicker(null)} 
        dayNumber={activeDayPicker?.dayNumber || 1}
        eventId={activeDayPicker?.eventId}
      />

      <PackagePreviewModal 
        packageId={viewingPackage}
        onClose={() => setViewingPackage(null)}
      />

    </div>
  )
}
