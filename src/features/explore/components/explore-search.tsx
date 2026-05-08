"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useMemo, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import posthog from 'posthog-js'
import { RADIUS_MARKS } from "../constants"
import { QuickFilterStrip } from "./filters/quick-filter-strip"
import { FilterDrawer } from "./filters/filter-drawer"

interface ExploreSearchProps {
  initialQuery: string
  isDrawerOpen: boolean
  setIsDrawerOpen: (v: boolean) => void
  categoryCounts?: Record<string, number>
}

export function ExploreSearch({ 
  initialQuery,
  isDrawerOpen,
  setIsDrawerOpen,
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
  
  const currentCats = useMemo(() => {
    return currentCatStr ? currentCatStr.split(',').filter(Boolean) : []
  }, [currentCatStr])

  useEffect(() => {
    setValue(searchParams.get("q") || "")
  }, [searchParams])

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
    if (catValue === "CLEAR_ALL") {
      navigateFilters(currentLoc, [], value.trim(), isRadEnabled ? currentRad : undefined, currentLat, currentLng, currentSort)
      return
    }

    let nextCats = [...currentCats]
    if (nextCats.includes(catValue)) {
      nextCats = nextCats.filter(c => c !== catValue)
    } else {
      nextCats.push(catValue)
    }
    navigateFilters(currentLoc, nextCats, value.trim(), isRadEnabled ? currentRad : undefined, currentLat, currentLng, currentSort)
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
    <div className="flex flex-col gap-5 mt-1">
      {/* Search Input Row */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
        <input 
          type="text" 
          placeholder="Search experiences..." 
          value={value}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full bg-slate-50 border border-gray-100 text-slate-900 text-[15px] font-medium pl-12 pr-10 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:bg-white focus:border-slate-200 transition-all shadow-sm group-hover:shadow-md"
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

      {/* Quick Filter Strip */}
      <QuickFilterStrip 
        currentCats={currentCats}
        onCategoryToggle={handleCategoryToggle}
        onOpenFilters={() => setIsDrawerOpen(true)}
        categoryCounts={categoryCounts}
      />

      {/* Advanced Filter Drawer */}
      <FilterDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentLoc={currentLoc}
        currentSort={currentSort}
        currentRad={currentRad}
        isRadEnabled={isRadEnabled}
        currentLat={currentLat}
        isGettingLocation={isGettingLocation}
        onLocationSelect={(loc) => navigateFilters(loc, currentCats, value.trim(), isRadEnabled ? currentRad : undefined, currentLat, currentLng, currentSort)}
        onSortSelect={(sort) => navigateFilters(currentLoc, currentCats, value.trim(), isRadEnabled ? currentRad : undefined, currentLat, currentLng, sort)}
        onRadiusChange={(rad) => navigateFilters(currentLoc, currentCats, value.trim(), rad, currentLat, currentLng, currentSort)}
        onToggleRadius={(enabled) => navigateFilters(currentLoc, currentCats, value.trim(), enabled ? currentRad : undefined, currentLat, currentLng, currentSort)}
        onUseMyLocation={handleUseMyLocation}
        onClearAll={() => navigateFilters("", [], value.trim(), undefined, undefined, undefined, "recommended")}
      />
    </div>
  )
}
