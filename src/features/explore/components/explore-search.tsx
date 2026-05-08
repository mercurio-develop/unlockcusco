"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useMemo, useEffect, useRef } from "react"
import { Search, X, Star, Utensils, Sprout, Mountain as MountainIcon, Bed, Landmark, Ticket, Car, Scissors, User } from "lucide-react"

const CATEGORIES = [
  { label: "Tourist Ticket", value: "Boleto", icon: Ticket },
  { label: "Adventure", value: "Adventure", icon: MountainIcon },
  { label: "Wellness", value: "Wellness", icon: Sprout },
  { label: "Dining", value: "Dining", icon: Utensils },
  { label: "Culture", value: "Culture", icon: Landmark },
  { label: "Textiles", value: "Textiles", icon: Scissors },
  { label: "Stays", value: "Stays", icon: Bed },
  { label: "Transport", value: "Transport", icon: Car },
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

const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Highest Rated", value: "rating_desc" },
  { label: "Price (Low to High)", value: "price_asc" },
  { label: "Price (High to Low)", value: "price_desc" },
]

const RADIUS_MARKS: number[] = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 10, 15];

interface ExploreSearchProps {
  initialQuery: string
  showFilters?: boolean
  setShowFilters?: (v: boolean) => void
  categoryCounts?: Record<string, number>
}

export function ExploreSearch({ 
  initialQuery,
  showFilters = true,
  setShowFilters = () => {},
  categoryCounts = {}
}: ExploreSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialQuery)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const currentLoc = searchParams.get("loc") || ""
  const currentCatStr = searchParams.get("cat") || ""
  const isRadEnabled = searchParams.has("rad")
  const currentRad = searchParams.has("rad") ? parseFloat(searchParams.get("rad")!) : 2
  const currentLat = searchParams.get("lat") || ""
  const currentLng = searchParams.get("lng") || ""
  const currentSort = searchParams.get("sort") || "recommended"
  
  const [localRad, setLocalRad] = useState(currentRad)

  const currentCats = useMemo(() => {
    return currentCatStr ? currentCatStr.split(',').filter(Boolean) : []
  }, [currentCatStr])

  const totalCount = useMemo(() => {
    return Object.values(categoryCounts).reduce((acc, curr) => acc + curr, 0)
  }, [categoryCounts])

  useEffect(() => {
    setValue(searchParams.get("q") || "")
  }, [searchParams])

  useEffect(() => {
    setLocalRad(currentRad)
  }, [currentRad])

  const navigateFilters = (loc?: string, cats?: string[], q?: string, rad?: number, lat?: string, lng?: string, sort?: string) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (loc) params.set("loc", loc)
    if (cats && cats.length > 0) params.set("cat", cats.join(','))
    if (rad !== undefined) params.set("rad", rad.toString())
    if (lat && lng) {
      params.set("lat", lat)
      params.set("lng", lng)
    }
    if (sort && sort !== "recommended") params.set("sort", sort)
    
    router.push(`/explore?${params.toString()}`)
  }

  const handleSearchChange = (newVal: string) => {
    setValue(newVal)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    
    debounceRef.current = setTimeout(() => {
      navigateFilters(currentLoc, currentCats, newVal.trim(), isRadEnabled ? currentRad : undefined, currentLat, currentLng, currentSort)
    }, 800)
  }

  const handleCategoryToggle = (catValue: string) => {
    let nextCats = [...currentCats]
    if (nextCats.includes(catValue)) {
      nextCats = nextCats.filter(c => c !== catValue)
    } else {
      nextCats.push(catValue)
    }
    navigateFilters(currentLoc, nextCats, value.trim(), isRadEnabled ? currentRad : undefined, currentLat, currentLng, currentSort)
  }

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value)
    const newRad = RADIUS_MARKS[index]
    setLocalRad(newRad)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    
    debounceRef.current = setTimeout(() => {
      navigateFilters(currentLoc, currentCats, value.trim(), newRad, currentLat, currentLng, currentSort)
    }, 800)
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
        navigateFilters(currentLoc, currentCats, value.trim(), currentRad, lat, lng, currentSort)
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
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`shrink-0 text-xs font-semibold px-4 py-3.5 rounded-full transition-colors border shadow-sm ${showFilters ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'}`}
        >
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-col gap-5 pt-2">
          {/* Location */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Location</span>
              {(currentLoc || currentCats.length > 0) && (
                <button 
                  onClick={() => navigateFilters("", [], value.trim(), isRadEnabled ? currentRad : undefined, currentLat, currentLng)}
                  className="text-xs text-rose-500 hover:text-rose-700 font-bold transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => navigateFilters("", currentCats, value.trim(), isRadEnabled ? currentRad : undefined, currentLat, currentLng)}
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
                  onClick={() => navigateFilters(loc.value, currentCats, value.trim(), isRadEnabled ? currentRad : undefined, currentLat, currentLng)}
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
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Radius Search</span>
                <button
                  onClick={() => navigateFilters(currentLoc, currentCats, value.trim(), isRadEnabled ? undefined : localRad, currentLat, currentLng)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${isRadEnabled ? 'bg-rose-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${isRadEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
              <button 
                onClick={handleUseMyLocation}
                disabled={isGettingLocation || !isRadEnabled}
                className="text-xs text-rose-500 hover:text-rose-700 font-bold transition-colors disabled:opacity-30"
              >
                {isGettingLocation ? "Locating..." : (currentLat ? "Using Device GPS" : "Use My Location")}
              </button>
            </div>
            <div className={`flex items-center gap-4 bg-white px-4 py-3 rounded-2xl border border-gray-200 transition-opacity ${!isRadEnabled && 'opacity-50 pointer-events-none'}`}>
              <input 
                type="range" 
                min="0" 
                max={RADIUS_MARKS.length - 1} 
                step="1"
                value={RADIUS_MARKS.indexOf(localRad) !== -1 ? RADIUS_MARKS.indexOf(localRad) : RADIUS_MARKS.indexOf(2)}
                onChange={handleRadiusChange}
                disabled={!isRadEnabled}
                className="flex-1 accent-rose-600 disabled:accent-slate-400"
              />
              <span className="text-sm font-bold text-slate-900 w-12 text-right">{localRad} km</span>
            </div>
          </div>

          {/* Sort By */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sort By</span>
            <div className="flex flex-wrap gap-2.5">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => navigateFilters(currentLoc, currentCats, value.trim(), isRadEnabled ? currentRad : undefined, currentLat, currentLng, option.value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border duration-200 whitespace-nowrap ${
                    currentSort === option.value 
                      ? "bg-slate-900 text-white shadow-md border-slate-900" 
                      : "bg-white text-slate-600 hover:bg-gray-50 border-gray-200 hover:border-slate-900 hover:text-slate-900"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Category (Multi-Select)</span>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => navigateFilters(currentLoc, [], value.trim(), isRadEnabled ? currentRad : undefined, currentLat, currentLng)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border duration-200 whitespace-nowrap flex items-center gap-2 ${
                  currentCats.length === 0 
                    ? "bg-slate-900 text-white shadow-md border-slate-900" 
                    : "bg-white text-slate-600 hover:bg-gray-50 border-gray-200 hover:border-slate-900 hover:text-slate-900"
                }`}
              >
                All Experiences
                {totalCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${currentCats.length === 0 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {totalCount}
                  </span>
                )}
              </button>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon
                const isActive = currentCats.includes(cat.value)
                const count = categoryCounts[cat.value.toUpperCase()] || 0
                return (
                  <button
                    key={cat.value}
                    onClick={() => handleCategoryToggle(cat.value)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border duration-200 whitespace-nowrap flex items-center gap-2 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-md border-slate-900" 
                        : "bg-white text-slate-600 hover:bg-gray-50 border-gray-200 hover:border-slate-900 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    {cat.label}
                    {count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

