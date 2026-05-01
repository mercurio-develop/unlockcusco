"use client"

import { useState, useMemo } from "react"
import { useBuilder } from "@/features/pro-builder/store/builder-context"
import { Calendar, Users, MapPin, ChevronRight, ChevronLeft } from "lucide-react"
import { DraftDay } from "@/features/pro-builder/types"

export function BuilderWizard() {
  const { draftTrip, updateTripMeta, setViewState } = useBuilder()
  const [step, setStep] = useState(1)
  
  // Local state for Step 1
  const [title, setTitle] = useState(draftTrip.title || "")
  const [startDate, setStartDate] = useState(draftTrip.startDate || "")
  const [endDate, setEndDate] = useState(draftTrip.endDate || "")
  const [paxCount, setPaxCount] = useState(draftTrip.paxCount || 1)

  // Local state for Step 2
  const [days, setDays] = useState<DraftDay[]>(draftTrip.days || [])

  const minStartDate = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])

  const minEndDate = useMemo(() => {
    if (!startDate) return minStartDate
    const d = new Date(startDate)
    d.setDate(d.getDate() + 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [startDate, minStartDate])

  const numDays = useMemo(() => {
    if (!startDate || !endDate) return 0
    return Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)
  }, [startDate, endDate])

  const isStep1Valid = title.trim() !== "" && startDate && endDate && startDate >= minStartDate && endDate >= minEndDate && numDays > 0

  const handleNextToStep2 = () => {
    // Generate empty days if not enough
    const generatedDays: DraftDay[] = []
    const start = new Date(startDate)
    
    for (let i = 0; i < numDays; i++) {
      const currentDate = new Date(start)
      currentDate.setDate(start.getDate() + i + 1) // +1 to fix timezone offset issues locally for display
      const dateStr = currentDate.toISOString().split('T')[0]
      
      const existingDay = days.find(d => d.dayNumber === i + 1)
      
      if (existingDay) {
        generatedDays.push({ ...existingDay, date: dateStr })
      } else {
        generatedDays.push({
          dayNumber: i + 1,
          date: dateStr,
          startAnchor: { title: "Morning Pickup", locationStr: "", time: "08:00" },
          endAnchor: { title: "Evening Drop-off", locationStr: "", time: "18:00" },
          guideNotes: "",
          packageIds: []
        })
      }
    }
    
    setDays(generatedDays)
    setStep(2)
  }

  const handleCompleteWizard = () => {
    updateTripMeta({
      title,
      startDate,
      endDate,
      paxCount,
      days
    })
    setViewState('canvas')
  }

  const updateDayAnchor = (index: number, type: 'startAnchor' | 'endAnchor', field: 'locationStr' | 'time', value: string) => {
    const newDays = [...days]
    newDays[index] = {
      ...newDays[index],
      [type]: {
        ...newDays[index][type],
        [field]: value
      }
    }
    setDays(newDays)
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-8 bg-white min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">
          {step === 1 ? "Trip Foundations" : "Daily Anchors"}
        </h1>
        <p className="text-slate-500">
          {step === 1 ? "Set the basic parameters for this itinerary." : "Configure pickup and drop-off locations for each day."}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1">
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2">Itinerary Title</label>
              <input 
                type="text" 
                placeholder="e.g. The Jenkins Family Adventure"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xl font-serif text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Start Date
                </label>
                <input
                  type="date"
                  min={minStartDate}
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> End Date
                </label>
                <input
                  type="date"
                  min={minEndDate}
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" /> Number of Travelers (Pax)
              </label>
              <div className="flex items-center gap-4">
                <button onClick={() => setPaxCount(Math.max(1, paxCount - 1))} className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-900 hover:bg-slate-200 transition-colors">-</button>
                <span className="text-2xl font-bold w-12 text-center text-slate-900">{paxCount}</span>
                <button onClick={() => setPaxCount(paxCount + 1)} className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-900 hover:bg-slate-200 transition-colors">+</button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
            {days.map((day, idx) => (
              <div key={idx} className="p-6 border border-slate-100 bg-slate-50 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900">Day {day.dayNumber}</h3>
                  <span className="text-xs font-semibold text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Start Anchor */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
                      <MapPin className="w-4 h-4" /> Start
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="time" 
                        value={day.startAnchor.time}
                        onChange={(e) => updateDayAnchor(idx, 'startAnchor', 'time', e.target.value)}
                        className="p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-rose-500 bg-white"
                      />
                      <input 
                        type="text" 
                        placeholder="e.g. Hotel Monasterio, Cusco"
                        value={day.startAnchor.locationStr}
                        onChange={(e) => updateDayAnchor(idx, 'startAnchor', 'locationStr', e.target.value)}
                        className="flex-1 p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-rose-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* End Anchor */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                      <MapPin className="w-4 h-4" /> End
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="time" 
                        value={day.endAnchor.time}
                        onChange={(e) => updateDayAnchor(idx, 'endAnchor', 'time', e.target.value)}
                        className="p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-rose-500 bg-white"
                      />
                      <input 
                        type="text" 
                        placeholder="e.g. Tambo del Inka, Urubamba"
                        value={day.endAnchor.locationStr}
                        onChange={(e) => updateDayAnchor(idx, 'endAnchor', 'locationStr', e.target.value)}
                        className="flex-1 p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-rose-500 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Nav */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
        {step === 1 ? (
          <div /> // Empty div for spacing
        ) : (
          <button 
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-slate-500 font-semibold hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}

        {step === 1 ? (
          <button
            onClick={handleNextToStep2}
            disabled={!isStep1Valid}
            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-slate-800 transition-colors"
          >
            Configure Days <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleCompleteWizard}
            className="flex items-center gap-2 bg-rose-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors"
          >
            Enter Itinerary Canvas <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
