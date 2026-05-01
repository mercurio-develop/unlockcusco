"use client"

import { useState, useEffect } from "react"
import { useBuilder } from "@/features/pro-builder/store/builder-context"
import { MapPin, Plus, Check, Search, Loader2, X, Star } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { ExperienceEvent } from "../types"

// Minimal type for display in picker
type MinimizedPackage = {
  id: string
  title: string
  sector: string
  pace: string
  tags: string
}

interface ExperiencePickerModalProps {
  isOpen: boolean
  onClose: () => void
  dayNumber: number
}

export function ExperiencePickerModal({ isOpen, onClose, dayNumber }: ExperiencePickerModalProps) {
  const { draftTrip, addEventToDay, removeEventFromDay } = useBuilder()
  const [packages, setPackages] = useState<MinimizedPackage[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  const day = draftTrip.days.find(d => d.dayNumber === dayNumber)
  
  // Find all existing EXPERIENCE events for this day
  const experienceEvents = (day?.events || []).filter(e => e.type === 'EXPERIENCE') as ExperienceEvent[]
  const selectedPackageIds = experienceEvents.map(e => e.packageId)

  useEffect(() => {
    if (isOpen && packages.length === 0) {
      setLoading(true)
      // Fetch packages (re-using existing endpoint)
      fetch('/api/packages')
        .then(res => res.json())
        .then(data => {
          // Filter out agencies, keep only Vallecito Originals for simplicity in this demo, or all.
          // The API endpoint might return everything.
          setPackages(data || [])
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [isOpen, packages.length])

  if (!isOpen) return null

  const filtered = packages.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.tags.toLowerCase().includes(search.toLowerCase())
  )

  const togglePackage = (pkg: MinimizedPackage) => {
    const isSelected = selectedPackageIds.includes(pkg.id)
    if (isSelected) {
      // Find the event ID to remove
      const eventToRemove = experienceEvents.find(e => e.packageId === pkg.id)
      if (eventToRemove) {
        removeEventFromDay(dayNumber, eventToRemove.id)
      }
    } else {
      addEventToDay(dayNumber, {
        id: uuidv4(),
        type: 'EXPERIENCE',
        startTime: "09:00", // Default time
        packageId: pkg.id,
        title: pkg.title
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[80vh] rounded-3xl shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">Add Experience</h2>
            <p className="text-slate-500 text-sm mt-1">Select experiences for Day {dayNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Vallecito library..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-900"
            />
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
                const isSelected = selectedPackageIds.includes(pkg.id)
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
