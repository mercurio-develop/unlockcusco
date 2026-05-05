"use client"

import { useState, useMemo } from "react"
import { useTrip } from "@/lib/store/trip-context"
import { Calendar, Users, ChevronRight, Sparkles } from "lucide-react"
import type { UniversalTrip, TripDay } from "@/lib/types/trip"
import { v4 as uuidv4 } from "uuid"

export function BuilderWizard() {
  const { currentTrip, setCurrentTrip, setViewState, setActiveDayNumber } = useTrip()
  
  const [title, setTitle] = useState(currentTrip?.title || "")
  const [startDate, setStartDate] = useState(currentTrip?.startDate.toISOString().split('T')[0] || "")
  const [endDate, setEndDate] = useState(currentTrip?.endDate.toISOString().split('T')[0] || "")
  const [paxCount, setPaxCount] = useState(currentTrip?.paxCount || 1)

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

  const isFormValid = title.trim() !== "" && startDate && endDate && startDate >= minStartDate && endDate >= minEndDate && numDays > 0

  const generateEmptyDays = (start: string, nDays: number): TripDay[] => {
    const generated: TripDay[] = []
    const d = new Date(start)
    for (let i = 0; i < nDays; i++) {
      const currentDate = new Date(d)
      currentDate.setDate(d.getDate() + i + 1)
      generated.push({
        dayNumber: i + 1,
        date: currentDate,
        events: []
      })
    }
    return generated
  }

  const handleStartBuilding = () => {
    const days = generateEmptyDays(startDate, numDays)
    const newTrip: UniversalTrip = {
        title,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        paxCount,
        days,
        status: 'DRAFT'
    }
    setCurrentTrip(newTrip)
    setActiveDayNumber(1)
    setViewState('workspace')
  }

  const handleMagicAutoFill = () => {
    const d1 = new Date()
    d1.setDate(d1.getDate() + 14)
    const sd = d1.toISOString().split('T')[0]
    
    const d2 = new Date(d1)
    d2.setDate(d2.getDate() + 3)
    const ed = d2.toISOString().split('T')[0]

    const demoDays = generateEmptyDays(sd, 3)
    
    demoDays[0].events = [
      { id: uuidv4(), type: 'TRANSPORT', method: 'CAR', startTime: '08:30', title: 'Private Transfer - Pisac', from: 'Hotel', to: 'Pisac Ruins' },
      { id: uuidv4(), type: 'MEAL', startTime: '13:00', title: 'Lunch at Hacienda Huayoccari' },
      { id: uuidv4(), type: 'NOTE', startTime: '16:00', content: 'Free time to acclimate.', title: 'Rest Time' }
    ]

    setCurrentTrip({
      title: "The Jenkins Family Expedition",
      startDate: new Date(sd),
      endDate: new Date(ed),
      paxCount: 4,
      days: demoDays,
      status: 'DRAFT',
      clientNotes: "Welcome to the Sacred Valley!",
      internalNotes: "VIP Clients."
    })
    
    setActiveDayNumber(1)
    setViewState('workspace')
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-8 bg-white min-h-[600px] flex flex-col justify-center">
      <div className="mb-16">
        <h1 className="text-5xl font-serif text-slate-900 mb-4 tracking-tight">Trip Foundations</h1>
        <p className="text-xl text-slate-500 font-light">Set the core parameters before designing the itinerary.</p>
      </div>

      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl w-full">
        <div className="group relative">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1 transition-colors group-focus-within:text-rose-600">Itinerary Title</label>
          <input 
            type="text" 
            placeholder="e.g. The Jenkins Family Adventure"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full py-3 bg-transparent border-b-2 border-slate-200 text-3xl font-serif text-slate-900 focus:border-rose-600 outline-none transition-colors placeholder:text-slate-200"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          <div className="group relative">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-2 transition-colors group-focus-within:text-rose-600">
              <Calendar className="w-3.5 h-3.5" /> Start Date
            </label>
            <input
              type="date"
              min={minStartDate}
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full py-3 bg-transparent border-b-2 border-slate-200 text-xl font-medium text-slate-900 focus:border-rose-600 outline-none transition-colors"
            />
          </div>
          <div className="group relative">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-2 transition-colors group-focus-within:text-rose-600">
              <Calendar className="w-3.5 h-3.5" /> End Date
            </label>
            <input
              type="date"
              min={minEndDate}
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full py-3 bg-transparent border-b-2 border-slate-200 text-xl font-medium text-slate-900 focus:border-rose-600 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="pt-10 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleStartBuilding}
            disabled={!isFormValid}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-5 rounded-2xl font-bold text-lg disabled:opacity-50 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            Start Building <ChevronRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleMagicAutoFill}
            className="flex-1 flex items-center justify-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 px-8 py-5 rounded-2xl font-bold text-lg hover:bg-rose-100 transition-all"
          >
            <Sparkles className="w-5 h-5" /> Magic Auto-Fill
          </button>
        </div>
      </div>
    </div>
  )
}
