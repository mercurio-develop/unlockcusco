"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useMemo, useEffect, useRef } from "react"
import { SlidersHorizontal, Search, ChevronDown, ChevronUp, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const CATEGORIES = [
  { label: "🎟️ Boleto", value: "Boleto" },
  { label: "🥾 Adventure", value: "Adventure" },
  { label: "🧘 Wellness", value: "Wellness" },
  { label: "🍽️ Dining", value: "Dining" },
  { label: "🏺 Culture", value: "Culture" },
  { label: "🛌 Stays", value: "Stays" },
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
]

interface ExploreSearchProps {
  initialQuery: string
}

export function ExploreSearch({ 
  initialQuery, 
}: ExploreSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialQuery)
  const [showFilters, setShowFilters] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const currentLoc = searchParams.get("loc") || ""
  const currentCatStr = searchParams.get("cat") || ""
  
  const currentCats = useMemo(() => {
    return currentCatStr ? currentCatStr.split(',').filter(Boolean) : []
  }, [currentCatStr])

  useEffect(() => {
    setValue(searchParams.get("q") || "")
  }, [searchParams])

  const navigateFilters = (loc?: string, cats?: string[], q?: string) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (loc) params.set("loc", loc)
    if (cats && cats.length > 0) params.set("cat", cats.join(','))
    
    router.push(`/explore?${params.toString()}`)
  }

  const handleSearchChange = (newVal: string) => {
    setValue(newVal)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    
    debounceRef.current = setTimeout(() => {
      navigateFilters(currentLoc, currentCats, newVal.trim())
    }, 500)
  }

  const handleCategoryToggle = (catValue: string) => {
    let nextCats = [...currentCats]
    if (nextCats.includes(catValue)) {
      nextCats = nextCats.filter(c => c !== catValue)
    } else {
      nextCats.push(catValue)
    }
    navigateFilters(currentLoc, nextCats, value.trim())
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 w-full">
          {/* Global Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search experiences..." 
              value={value}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 text-slate-800 text-sm pl-9 pr-8 py-2 rounded-xl focus:outline-none focus:border-rose-300 focus:bg-white transition-colors placeholder:text-slate-400"
            />
            {value && (
              <button 
                onClick={() => handleSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Global Filter Toggle */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border shadow-sm shrink-0 ${
              showFilters || currentLoc || currentCats.length > 0
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {(currentLoc || currentCats.length > 0) && !showFilters ? "Filters Active" : "Filters"} 
            {showFilters ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Location</span>
                    {(currentLoc || currentCats.length > 0) && (
                      <button 
                        onClick={() => navigateFilters("", [], value.trim())}
                        className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigateFilters("", currentCats, value.trim())}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                        currentLoc === "" 
                          ? "bg-slate-900 text-white shadow-md" 
                          : "bg-white text-slate-600 hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      Anywhere
                    </button>
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc.value}
                        onClick={() => navigateFilters(loc.value, currentCats, value.trim())}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                          currentLoc === loc.value 
                            ? "bg-slate-900 text-white shadow-md" 
                            : "bg-white text-slate-600 hover:bg-gray-50 border border-gray-200"
                        }`}
                      >
                        {loc.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Category (Multi-Select)</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigateFilters(currentLoc, [], value.trim())}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                        currentCats.length === 0 
                          ? "bg-slate-900 text-white shadow-md" 
                          : "bg-white text-slate-600 hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      All Experiences
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => handleCategoryToggle(cat.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                          currentCats.includes(cat.value)
                            ? "bg-rose-50 text-rose-700 border-rose-200 border shadow-sm" 
                            : "bg-white text-slate-600 hover:bg-gray-50 border border-gray-200"
                        }`}
                      >
                        {currentCats.includes(cat.value) && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
