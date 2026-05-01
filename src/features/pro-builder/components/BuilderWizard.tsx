"use client"

import { useState, useMemo } from "react"
import { useBuilder } from "@/features/pro-builder/store/builder-context"
import { Calendar, Users, ChevronRight, Sparkles } from "lucide-react"
import { DraftDay } from "@/features/pro-builder/types"
import { v4 as uuidv4 } from "uuid"

export function BuilderWizard() {
  const { draftTrip, updateTripMeta, setViewState, setActiveDayNumber } = useBuilder()
  
  const [title, setTitle] = useState(draftTrip.title || "")
  const [startDate, setStartDate] = useState(draftTrip.startDate || "")
  const [endDate, setEndDate] = useState(draftTrip.endDate || "")
  const [paxCount, setPaxCount] = useState(draftTrip.paxCount || 1)

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

  const generateEmptyDays = (start: string, nDays: number): DraftDay[] => {
    const generated: DraftDay[] = []
    const d = new Date(start)
    for (let i = 0; i < nDays; i++) {
      const currentDate = new Date(d)
      currentDate.setDate(d.getDate() + i + 1) // +1 for local display offset
      generated.push({
        dayNumber: i + 1,
        date: currentDate.toISOString().split('T')[0],
        startAnchor: { title: "Morning Pickup", locationStr: "", time: "08:00" },
        endAnchor: { title: "Evening Drop-off", locationStr: "", time: "18:00" },
        guideNotes: "",
        events: []
      })
    }
    return generated
  }

  const handleStartBuilding = () => {
    const days = draftTrip.days.length > 0 ? draftTrip.days : generateEmptyDays(startDate, numDays)
    updateTripMeta({ title, startDate, endDate, paxCount, days })
    setActiveDayNumber(1)
    setViewState('workspace')
  }

  const handleMagicAutoFill = () => {
    const d1 = new Date()
    d1.setDate(d1.getDate() + 14) // Two weeks from now
    const sd = d1.toISOString().split('T')[0]
    
    const d2 = new Date(d1)
    d2.setDate(d2.getDate() + 3)
    const ed = d2.toISOString().split('T')[0]

    const demoDays = generateEmptyDays(sd, 3)
    
    // Auto-fill some events on Day 1
    demoDays[0].startAnchor.locationStr = "Palacio del Inka, Urubamba"
    demoDays[0].endAnchor.locationStr = "Palacio del Inka, Urubamba"
    demoDays[0].events = [
      { id: uuidv4(), type: 'TRANSPORT', startTime: '08:30', method: 'CAR', from: 'Hotel', to: 'Pisac Ruins', details: 'Private SUV with driver' },
      { id: uuidv4(), type: 'MEAL', startTime: '13:00', name: 'Lunch at Hacienda Huayoccari', location: 'Urubamba', notes: 'Vegetarian options requested.' },
      { id: uuidv4(), type: 'NOTE', startTime: '16:00', content: 'Free time to acclimate and enjoy the spa.' }
    ]

    updateTripMeta({
      title: "The Jenkins Family Expedition",
      startDate: sd,
      endDate: ed,
      paxCount: 4,
      days: demoDays,
      leadPax: { name: "Robert Jenkins", email: "robert@example.com", phone: "+1 555 0192" },
      clientNotes: "Welcome to the Sacred Valley! Drink plenty of coca tea.",
      internalNotes: "VIP Clients. Ensure champagne in room on arrival."
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
              className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 ${startDate ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'}`}
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
              className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 ${endDate ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'}`}
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

        <div className="pt-8 flex flex-col gap-4">
          <button
            onClick={handleStartBuilding}
            disabled={!isFormValid}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg disabled:opacity-50 hover:bg-slate-800 transition-colors"
          >
            Start Building <ChevronRight className="w-5 h-5" />
          </button>
          
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">OR</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

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
