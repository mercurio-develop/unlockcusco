"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useRef, useMemo } from "react"
import { SlidersHorizontal, Sparkles, MapPin, Tag, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
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

const SACRED_VALLEY_LOCATIONS = [
  "Urubamba", "Pisac", "Maras", "Ollantaytambo", "Chinchero", "Calca", "Yucay", "Cusco", "Machu Picchu"
];

export function ExploreSearch({ initialQuery, isItineraryMode = false }: { initialQuery: string, isItineraryMode?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Local state for the filters
  const currentLoc = searchParams.get("loc") || ""
  const currentCatStr = searchParams.get("cat") || ""
  
  const currentCats = useMemo(() => {
    return currentCatStr ? currentCatStr.split(',').filter(Boolean) : []
  }, [currentCatStr])

  const navigateFilters = (loc?: string, cats?: string[]) => {
    const params = new URLSearchParams()
    // Keep the current 'q' param if it exists, otherwise just loc/cat
    const q = searchParams.get("q")
    if (q) params.set("q", q)
    if (loc) params.set("loc", loc)
    if (cats && cats.length > 0) params.set("cat", cats.join(','))
    
    router.push(`/explore?${params.toString()}`)
  }

  const handleSearch = () => {
    if (!value.trim()) return

    const rawValue = value.trim()
    const wordCount = rawValue.split(" ").length

    // If we're explicitly in itinerary mode, or the user typed a conversational sentence (e.g., > 3 words)
    if (isItineraryMode || wordCount > 3) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("ai_prompt", rawValue)
      router.push(`/explore?${params.toString()}`)
      setValue("") // clear input
      return
    }

    let finalQ = rawValue
    let finalLoc = currentLoc

    // Smart extract location from query
    for (const loc of SACRED_VALLEY_LOCATIONS) {
      const locLower = loc.toLowerCase()
      if (finalQ.toLowerCase().includes(locLower)) {
        finalLoc = locLower
        // Remove the location and optional preceding prepositions
        const regex = new RegExp(`\\s*(?:in|near|at|to)?\\s*\\b${locLower}\\b`, 'i')
        finalQ = finalQ.replace(regex, '').trim()
        break
      }
    }

    const params = new URLSearchParams()
    if (finalQ) params.set("q", finalQ)
    if (finalLoc) params.set("loc", finalLoc)
    if (currentCatStr) params.set("cat", currentCatStr)
    
    router.push(`/explore?${params.toString()}`)
  }

  const handleCategoryToggle = (catValue: string) => {
    let nextCats = [...currentCats]
    if (nextCats.includes(catValue)) {
      nextCats = nextCats.filter(c => c !== catValue)
    } else {
      nextCats.push(catValue)
    }
    navigateFilters(currentLoc, nextCats)
  }

  const lastWord = value.split(' ').pop() || "";
  const suggestions = (isFocused && lastWord.length >= 2) 
    ? SACRED_VALLEY_LOCATIONS.filter(l => l.toLowerCase().startsWith(lastWord.toLowerCase()) && l.toLowerCase() !== lastWord.toLowerCase())
    : [];

  const handleSuggestionClick = (suggestion: string) => {
    const words = value.split(' ');
    words.pop();
    words.push(suggestion);
    setValue(words.join(' ') + ' ');
    inputRef.current?.focus();
  };

  const handleDevAutofill = () => {
    const queries = [
      "I'm in Pisac heading to Ollantaytambo. I want coffee, a local market, and a nice lunch with a view.",
      "I am in Urubamba. Train at 4 PM in Ollanta. Quick hike and vegan food before I leave.",
      "Staying in Pisac, heading to Maras today. I want to try a good picantería for lunch while still in Pisac.",
      "Starting in Chinchero ending in Cusco. I just want a relaxing day, wellness stuff, no adventure.",
      "I really want to go ATV riding and get a huge dinner afterwards!"
    ];
    const currentIndex = queries.findIndex(q => q === value);
    const nextIndex = (currentIndex + 1) % queries.length;
    setValue(queries[nextIndex]);
  };

  return (
    <>
      <div className="relative mb-6 z-0">
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute -top-7 right-2 z-20">
            <button
              onClick={handleDevAutofill}
              className="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md transition-colors shadow-sm"
              title="Autofill Test Query (Dev Only)"
            >
              Test AI
            </button>
          </div>
        )}
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
          <Sparkles className="h-5 w-5 text-rose-500" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSearch()
            }
          }}
          placeholder="e.g., 'I need a taxi from Pisac to Ollantaytambo right now'"
          className="w-full py-5 pl-12 pr-6 rounded-2xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all text-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.06)] text-lg placeholder:text-gray-400 font-medium"
        />
        
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 p-2 text-left"
            >
              {suggestions.map(suggestion => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span className="font-medium">{suggestion}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isItineraryMode && (
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-xl text-sm font-semibold whitespace-nowrap hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              {showFilters ? "Hide Filters" : "Show Filters"} 
              {(currentLoc || currentCats.length > 0) && !showFilters && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
              {showFilters ? <ChevronUp className="w-4 h-4 ml-1 opacity-50" /> : <ChevronDown className="w-4 h-4 ml-1 opacity-50" />}
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
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col gap-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Location</span>
                      {(currentLoc || currentCats.length > 0) && (
                        <button 
                          onClick={() => navigateFilters("", [])}
                          className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigateFilters("", currentCats)}
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
                          onClick={() => navigateFilters(loc.value, currentCats)}
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
                        onClick={() => navigateFilters(currentLoc, [])}
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
      )}
    </>
  )
}
