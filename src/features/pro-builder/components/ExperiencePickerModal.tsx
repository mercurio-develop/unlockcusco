"use client"

import { useState, useEffect } from "react"
import { useTrip } from "@/lib/store/trip-context"
import { MapPin, Plus, Check, Search, Loader2, X, Star } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { ExperienceEvent, MealEvent } from "../types"

// Minimal type for display in picker
type MinimizedPackage = {
  id: string
  title: string
  sector: string
  pace: string
  tags: string
}

const CATEGORIES = [
  { id: 'all', label: 'All Experiences' },
  { id: 'food', label: 'Food & Drink', tags: ['food', 'restaurant', 'cafe', 'tasting', 'gastronomy', 'dining', 'pachamanca', 'drink'] },
  { id: 'culture', label: 'Culture & Ruins', tags: ['culture', 'ruins', 'history', 'archaeology', 'market', 'inca', 'museum'] },
  { id: 'adventure', label: 'Adventure', tags: ['atv', 'trek', 'hike', 'bike', 'rafting', 'zip', 'horse'] },
  { id: 'wellness', label: 'Wellness', tags: ['wellness', 'yoga', 'healing', 'ceremony', 'spa', 'thermal', 'sound'] },
  { id: 'nature', label: 'Nature', tags: ['nature', 'lake', 'mountain', 'wildlife', 'birds'] }
]

const LOCATIONS = [
  { label: "Urubamba", value: "urubamba" },
  { label: "Pisac", value: "pisac" },
  { label: "Maras", value: "maras" },
  { label: "Ollantaytambo", value: "ollantaytambo" },
  { label: "Chinchero", value: "chinchero" },
  { label: "Calca", value: "calca" },
  { label: "Yucay", value: "yucay" },
  { label: "Cusco", value: "cusco" },
  { label: "Machu Picchu", value: "machu_picchu" }
]

interface ExperiencePickerModalProps {
  isOpen: boolean
  onClose: () => void
  dayNumber: number
  eventId?: string
  initialSearch?: string
}

export function ExperiencePickerModal({ isOpen, onClose, dayNumber, eventId, initialSearch }: ExperiencePickerModalProps) {
  const { currentTrip, addEvent, removeEvent, updateEvent } = useTrip()
  const [packages, setPackages] = useState<MinimizedPackage[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeLocation, setActiveLocation] = useState("all")

  const day = currentTrip?.days.find(d => d.dayNumber === dayNumber)
  
  // Find all existing EXPERIENCE events for this day
  const experienceEvents = (day?.events || []).filter(e => e.type === 'EXPERIENCE') as ExperienceEvent[]
  
  // If we are in "meal mode", the selected package is the one on the meal event
  const mealEvent = eventId ? day?.events.find(e => e.id === eventId && e.type === 'MEAL') as MealEvent | undefined : undefined;
  
  const selectedPackageIds = mealEvent 
    ? (mealEvent.name ? [mealEvent.name] : []) 
    : experienceEvents.map(e => e.packageId)

  useEffect(() => {
    if (isOpen) {
      setActiveCategory(mealEvent ? 'food' : 'all')
      setSearch(initialSearch || "")
      
      if (packages.length === 0) {
        setLoading(true)
        // Fetch packages and businesses
        fetch('/api/experiences')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              setPackages(data)
            } else {
              setPackages([])
            }
          })
          .catch(console.error)
          .finally(() => setLoading(false))
      }
    }
  }, [isOpen, mealEvent, packages.length, initialSearch])

  if (!isOpen) return null

  const filtered = packages.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.tags.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false

    if (activeLocation !== 'all') {
      const sector = p.sector.toLowerCase();
      const loc = activeLocation.toLowerCase();
      
      let matchesLoc = sector.includes(loc);
      
      if (!matchesLoc) {
        if (loc === 'pisac' || loc === 'calca') {
          matchesLoc = sector.includes('east_valley') || sector.includes('valle_sagrado');
        } else if (loc === 'urubamba' || loc === 'yucay' || loc === 'ollantaytambo' || loc === 'maras' || loc === 'chinchero') {
          matchesLoc = sector.includes('valle_sagrado');
        }
        if (sector === 'any') matchesLoc = true;
      }
      
      if (!matchesLoc) return false;
    }

    if (activeCategory === 'all') return true

    const categoryDef = CATEGORIES.find(c => c.id === activeCategory)
    if (!categoryDef || !categoryDef.tags) return true

    return categoryDef.tags.some(tag => p.tags.toLowerCase().includes(tag))
  })

  const togglePackage = (pkg: MinimizedPackage) => {
    const isSelected = mealEvent ? selectedPackageIds.includes(pkg.title) : selectedPackageIds.includes(pkg.id)
    
    if (mealEvent) {
      if (isSelected) {
        updateEvent(dayNumber, mealEvent.id, { title: "Lunch" })
      } else {
        updateEvent(dayNumber, mealEvent.id, { title: pkg.title })
        onClose() // Close immediately after selecting for a meal
      }
      return;
    }

    if (isSelected) {
      // Find the event ID to remove
      const eventToRemove = experienceEvents.find(e => e.packageId === pkg.id)
      if (eventToRemove) {
        removeEvent(dayNumber, eventToRemove.id)
      }
    } else {
      let defaultStartTime = "10:00"
      if (day && day.events.length > 0) {
        const lastEvent = day.events[day.events.length - 1]
        if (lastEvent.startTime) {
          const [hours, minutes] = lastEvent.startTime.split(':').map(Number)
          defaultStartTime = `${String((hours + 2) % 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
        }
      } else if (day && day.startAnchor?.time) {
        const [hours, minutes] = day.startAnchor.time.split(':').map(Number)
        defaultStartTime = `${String((hours + 1) % 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      }

      addEvent(dayNumber, {
        id: uuidv4(),
        type: 'EXPERIENCE',
        startTime: defaultStartTime,
        packageId: pkg.id,
        title: pkg.title
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[80vh] rounded-3xl shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">Add Experience</h2>
            <p className="text-slate-500 text-sm mt-1">Select experiences for Day {dayNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-100 shrink-0">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Vallecito library..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-full border border-gray-200 bg-white text-slate-900 focus:ring-2 focus:ring-slate-900 text-[15px] font-medium shadow-sm hover:shadow transition-all outline-none"
            />
          </div>
        </div>

        {/* Categories / Filters */}
        <div className="flex flex-col bg-slate-50 border-b border-slate-100 shrink-0 px-6 py-4 gap-4">
          <div className="flex items-start gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2 w-16 shrink-0">Location</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveLocation('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border duration-200 shrink-0 ${
                  activeLocation === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-600 border-gray-200 hover:border-slate-900 hover:text-slate-900 hover:bg-gray-50'
                }`}
              >
                Anywhere
              </button>
              {LOCATIONS.map(loc => (
                <button
                  key={loc.value}
                  onClick={() => setActiveLocation(loc.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border duration-200 shrink-0 ${
                    activeLocation === loc.value
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white text-slate-600 border-gray-200 hover:border-slate-900 hover:text-slate-900 hover:bg-gray-50'
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2 w-16 shrink-0">Category</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border duration-200 shrink-0 ${
                    activeCategory === c.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white text-slate-600 border-gray-200 hover:border-slate-900 hover:text-slate-900 hover:bg-gray-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-rose-500" />
              <p>Loading library...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(pkg => {
                const isSelected = mealEvent ? selectedPackageIds.includes(pkg.title) : selectedPackageIds.includes(pkg.id)
                return (
                  <div 
                    key={pkg.id} 
                    onClick={() => togglePackage(pkg)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-slate-900 bg-slate-50 shadow-sm' 
                        : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-900 font-serif pr-4">{pkg.title}</h3>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${isSelected ? 'bg-slate-900 border-slate-900' : 'border-slate-300'}`}>
                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs font-semibold uppercase tracking-wider mb-3">
                      <span className="text-rose-600">{pkg.sector.replace('_', ' ')}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">{pkg.pace} PACE</span>
                    </div>
                    <p className="text-xs text-slate-500 font-light leading-relaxed">
                      {pkg.tags.split(',').slice(0,3).join(' · ')}
                    </p>
                  </div>
                )
              })}
              {filtered.length === 0 && !loading && (
                <div className="col-span-full text-center py-12 text-slate-500">
                  No experiences found matching "{search}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
          <span className="text-slate-500 text-sm font-semibold">
            {selectedPackageIds.length} experience{selectedPackageIds.length !== 1 && 's'} selected for Day {dayNumber}
          </span>
          <button 
            onClick={onClose}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  )
}
