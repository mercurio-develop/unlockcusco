"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useMemo, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"

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

const RADIUS_MARKS: number[] = [];
for (let i = 0.1; i <= 5.0; i += 0.1) {
  RADIUS_MARKS.push(Math.round(i * 10) / 10);
}
for (let i = 6.0; i <= 15.0; i += 1.0) {
  RADIUS_MARKS.push(Math.round(i * 10) / 10);
}

interface ExploreSearchProps {
  initialQuery: string
}

export function ExploreSearch({ 
  initialQuery,
}: ExploreSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialQuery)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const currentLoc = searchParams.get("loc") || ""
  const currentCatStr = searchParams.get("cat") || ""
  const currentRad = searchParams.get("rad") ? parseFloat(searchParams.get("rad")!) : 0.5
  const currentLat = searchParams.get("lat") || ""
  const currentLng = searchParams.get("lng") || ""
  
  const [localRad, setLocalRad] = useState(currentRad)

  const currentCats = useMemo(() => {
    return currentCatStr ? currentCatStr.split(',').filter(Boolean) : []
  }, [currentCatStr])

  useEffect(() => {
    setValue(searchParams.get("q") || "")
  }, [searchParams])

  useEffect(() => {
    setLocalRad(currentRad)
  }, [currentRad])

  const navigateFilters = (loc?: string, cats?: string[], q?: string, rad?: number, lat?: string, lng?: string) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (loc) params.set("loc", loc)
    if (cats && cats.length > 0) params.set("cat", cats.join(','))
    if (rad !== undefined && rad !== 0.5) params.set("rad", rad.toString())
    if (lat && lng) {
      params.set("lat", lat)
      params.set("lng", lng)
    }
    
    router.push(`/explore?${params.toString()}`)
  }

  const handleSearchChange = (newVal: string) => {
    setValue(newVal)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    
    debounceRef.current = setTimeout(() => {
      navigateFilters(currentLoc, currentCats, newVal.trim(), currentRad, currentLat, currentLng)
    }, 500)
  }

  const handleCategoryToggle = (catValue: string) => {
    let nextCats = [...currentCats]
    if (nextCats.includes(catValue)) {
      nextCats = nextCats.filter(c => c !== catValue)
    } else {
      nextCats.push(catValue)
    }
    navigateFilters(currentLoc, nextCats, value.trim(), currentRad, currentLat, currentLng)
  }

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRad = parseFloat(e.target.value)
    setLocalRad(newRad)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    
    debounceRef.current = setTimeout(() => {
      navigateFilters(currentLoc, currentCats, value.trim(), newRad, currentLat, currentLng)
    }, 500)
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      return
    }
    
    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsGettingLocation(false)
        const lat = position.coords.latitude.toString()
        const lng = position.coords.longitude.toString()
        navigateFilters(currentLoc, currentCats, value.trim(), currentRad, lat, lng)
      },
      (error) => {
        setIsGettingLocation(false)
        console.error("Error getting location", error)
        alert("Unable to get your location. Please check your browser permissions.")
      }
    )
  }

  return (
    <div className="flex flex-col gap-4 mt-1">
      {/* Search and Toggle Row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search experiences..." 
            value={value}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-white border border-gray-200 text-slate-900 text-[15px] font-medium pl-12 pr-10 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-sm hover:shadow"
          />
          {value && (
            <button 
              onClick={() => handleSearchChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5 pt-2">
        {/* Location */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Location</span>
              {(currentLoc || currentCats.length > 0) && (
                <button 
                  onClick={() => navigateFilters("", [], value.trim())}
                  className="text-xs text-rose-500 hover:text-rose-700 font-bold transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => navigateFilters("", currentCats, value.trim())}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border duration-200 whitespace-nowrap ${
                  currentLoc === "" 
                    ? "bg-slate-900 text-white shadow-md border-slate-900" 
                    : "bg-white text-slate-600 hover:bg-gray-50 border-gray-200 hover:border-slate-900 hover:text-slate-900"
                }`}
              >
                Anywhere
              </button>
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.value}
                  onClick={() => navigateFilters(loc.value, currentCats, value.trim())}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border duration-200 whitespace-nowrap ${
                    currentLoc === loc.value 
                      ? "bg-slate-900 text-white shadow-md border-slate-900" 
                      : "bg-white text-slate-600 hover:bg-gray-50 border-gray-200 hover:border-slate-900 hover:text-slate-900"
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Radius */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Radius Search</span>
              <button 
                onClick={handleUseMyLocation}
                disabled={isGettingLocation}
                className="text-xs text-rose-500 hover:text-rose-700 font-bold transition-colors disabled:opacity-50"
              >
                {isGettingLocation ? "Locating..." : (currentLat ? "Using Device GPS" : "Use My Location")}
              </button>
            </div>
            <div className="flex items-center gap-4 bg-white px-4 py-3 rounded-2xl border border-gray-200">
              <input 
                type="range" 
                min="0.5" 
                max="20" 
                step="0.5"
                value={localRad}
                onChange={handleRadiusChange}
                className="flex-1 accent-rose-600"
              />
              <span className="text-sm font-bold text-slate-900 w-12 text-right">{localRad} km</span>            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Category (Multi-Select)</span>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => navigateFilters(currentLoc, [], value.trim())}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border duration-200 whitespace-nowrap ${
                  currentCats.length === 0 
                    ? "bg-slate-900 text-white shadow-md border-slate-900" 
                    : "bg-white text-slate-600 hover:bg-gray-50 border-gray-200 hover:border-slate-900 hover:text-slate-900"
                }`}
              >
                All Experiences
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryToggle(cat.value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                    currentCats.includes(cat.value)
                      ? "bg-slate-900 text-white shadow-md border-slate-900" 
                      : "bg-white text-slate-600 hover:bg-gray-50 border-gray-200 hover:border-slate-900 hover:text-slate-900"
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
    </div>
  )
}
