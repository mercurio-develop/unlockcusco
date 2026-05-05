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
      { id: uuidv4(), type: 'TRANSPORT', startTime: '08:30', title: 'Private Transfer - Pisac', from: 'Hotel', to: 'Pisac Ruins' },
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
      <div className="text-center mb-10">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4 tracking-tight">Trip Foundations</h1>
        <p className="text-lg text-slate-500">Set the core parameters before designing the itinerary.</p>
      </div>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full">
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
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl"
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
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="pt-8 flex flex-col gap-4">
          <button
            onClick={handleStartBuilding}
            disabled={!isFormValid}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg disabled:opacity-50 hover:bg-slate-800 transition-colors"
          >
            Start Building <ChevronRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleMagicAutoFill}
            className="w-full flex items-center justify-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-rose-100 transition-colors"
          >
            <Sparkles className="w-5 h-5" /> Magic Auto-Fill Demo
          </button>
        </div>
      </div>
    </div>
  )
}
