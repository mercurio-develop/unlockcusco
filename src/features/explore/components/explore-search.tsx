"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useMemo, useEffect, useRef } from "react"
import { Search, X, SlidersHorizontal, Navigation, MapPin } from "lucide-react"
import posthog from 'posthog-js'
import { motion, AnimatePresence } from "framer-motion"
import { CATEGORIES, LOCATIONS, SORT_OPTIONS, RADIUS_MARKS } from "../constants"
import { cn } from "@/lib/utils"

interface ExploreSearchProps {
  initialQuery: string
  isDrawerOpen: boolean // Re-using this prop name for internal consistency in ExploreView
  setIsDrawerOpen: (v: boolean) => void
  categoryCounts?: Record<string, number>
}

export function ExploreSearch({ 
  initialQuery,
  isDrawerOpen: showFilters,
  setIsDrawerOpen: setShowFilters,
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
      if (newVal.trim()) {
        posthog.capture('search_performed', {
          query: newVal.trim(),
          location: currentLoc,
          categories: currentCats
        });
      }
      navigateFilters(currentLoc, currentCats, newVal.trim(), isRadEnabled ? currentRad : undefined, currentLat, currentLng, currentSort)
    }, 500)
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
    <div className="flex flex-col gap-4">
      {/* Search and Toggle Row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <input 
            type="text" 
            placeholder="Search Sacred Valley..." 
            value={value}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-slate-50/50 border-b border-slate-100 text-slate-900 text-sm font-medium pl-10 pr-10 py-3 focus:outline-none focus:border-slate-900 focus:bg-white transition-all placeholder:text-slate-300 placeholder:font-normal"
          />
          {value && (
            <button 
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "shrink-0 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] px-2 py-3 border-b transition-all",
            showFilters 
              ? "text-rose-600 border-rose-600" 
              : "text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-100"
          )}
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>Refine</span>
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
            <div className="flex flex-col gap-6 pt-2 pb-4">
              {/* Header with Clear All */}
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Filters</span>
                {(currentLoc || currentCats.length > 0 || currentSort !== "recommended") && (
                  <button 
                    onClick={() => navigateFilters("", [], value.trim(), undefined, undefined, undefined, "recommended")}
                    className="text-[10px] text-rose-500 hover:text-rose-600 font-bold uppercase tracking-wider transition-colors"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Sort By - Editorial Horizontal List */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Sort By</span>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => navigateFilters(currentLoc, currentCats, value.trim(), isRadEnabled ? currentRad : undefined, currentLat, currentLng, option.value)}
                      className={cn(
                        "py-1 border-b text-[11px] font-bold transition-all",
                        currentSort === option.value 
                          ? "text-slate-900 border-slate-900 font-serif italic" 
                          : "text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-200"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories - Editorial 2-Column List */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Categories</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <button
                    onClick={() => navigateFilters(currentLoc, [], value.trim(), isRadEnabled ? currentRad : undefined, currentLat, currentLng, currentSort)}
                    className={cn(
                      "py-2 border-b text-[12px] font-medium transition-all flex items-center justify-between group",
                      currentCats.length === 0 
                        ? "text-slate-900 border-slate-900 font-serif italic" 
                        : "text-slate-400 border-slate-50 hover:text-slate-600 hover:border-slate-200"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className={cn("w-3 h-3", currentCats.length === 0 ? "text-slate-900" : "text-slate-300")} />
                      All Experiences
                    </span>
                    {totalCount > 0 && (
                      <span className="text-[9px] opacity-40 font-sans not-italic">({totalCount})</span>
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
                        className={cn(
                          "py-2 border-b text-[12px] font-medium transition-all flex items-center justify-between group",
                          isActive
                            ? "text-slate-900 border-slate-900 font-serif italic" 
                            : "text-slate-400 border-slate-50 hover:text-slate-600 hover:border-slate-200"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className={cn("w-3 h-3", isActive ? "text-slate-900" : "text-slate-300")} />
                          {cat.label}
                        </span>
                        {count > 0 && (
                          <span className={cn(
                            "text-[9px] font-sans not-italic",
                            isActive ? "text-slate-900 opacity-60" : "text-slate-300 group-hover:text-slate-400"
                          )}>
                            ({count})
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Location - Editorial 2-Column List */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Town / Sector</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <button
                    onClick={() => navigateFilters("", currentCats, value.trim(), isRadEnabled ? currentRad : undefined, currentLat, currentLng, currentSort)}
                    className={cn(
                      "py-2 border-b text-[12px] font-medium transition-all text-left group",
                      currentLoc === "" 
                        ? "text-slate-900 border-slate-900 font-serif italic" 
                        : "text-slate-400 border-slate-50 hover:text-slate-600 hover:border-slate-200"
                    )}
                  >
                    Anywhere
                  </button>
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc.value}
                      onClick={() => navigateFilters(loc.value, currentCats, value.trim(), isRadEnabled ? currentRad : undefined, currentLat, currentLng, currentSort)}
                      className={cn(
                        "py-2 border-b text-[12px] font-medium transition-all text-left group",
                        currentLoc === loc.value 
                          ? "text-slate-900 border-slate-900 font-serif italic" 
                          : "text-slate-400 border-slate-50 hover:text-slate-600 hover:border-slate-200"
                      )}
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radius - Compact */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Radius Search</span>
                    <button
                      onClick={() => navigateFilters(currentLoc, currentCats, value.trim(), isRadEnabled ? undefined : localRad, currentLat, currentLng, currentSort)}
                      className={cn(
                        "w-8 h-4 rounded-full transition-colors relative",
                        isRadEnabled ? 'bg-rose-500' : 'bg-slate-200'
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform",
                        isRadEnabled ? 'translate-x-4' : 'translate-x-0'
                      )} />
                    </button>
                  </div>
                  <button 
                    onClick={handleUseMyLocation}
                    disabled={isGettingLocation || !isRadEnabled}
                    className="text-[9px] text-rose-500 hover:text-rose-600 font-black uppercase tracking-widest transition-colors disabled:opacity-30 flex items-center gap-1"
                  >
                    <Navigation className="w-2.5 h-2.5" />
                    {isGettingLocation ? "Locating..." : (currentLat ? "Using GPS" : "My Location")}
                  </button>
                </div>
                <div className={cn(
                  "flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-transparent transition-all",
                  !isRadEnabled && 'opacity-40 grayscale pointer-events-none'
                )}>
                  <input 
                    type="range" 
                    min="0" 
                    max={RADIUS_MARKS.length - 1} 
                    step="1"
                    value={RADIUS_MARKS.indexOf(localRad) !== -1 ? RADIUS_MARKS.indexOf(localRad) : RADIUS_MARKS.indexOf(2)}
                    onChange={handleRadiusChange}
                    className="flex-1 accent-rose-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] font-black text-slate-900 w-8 text-right">{localRad}km</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
