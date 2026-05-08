"use client"

import { X, Search, Navigation } from "lucide-react"
import { LOCATIONS, SORT_OPTIONS, RADIUS_MARKS } from "../../constants"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  currentLoc: string
  currentSort: string
  currentRad: number
  isRadEnabled: boolean
  currentLat?: string
  isGettingLocation: boolean
  onLocationSelect: (loc: string) => void
  onSortSelect: (sort: string) => void
  onRadiusChange: (rad: number) => void
  onToggleRadius: (enabled: boolean) => void
  onUseMyLocation: () => void
  onClearAll: () => void
}

export function FilterDrawer({
  isOpen,
  onClose,
  currentLoc,
  currentSort,
  currentRad,
  isRadEnabled,
  currentLat,
  isGettingLocation,
  onLocationSelect,
  onSortSelect,
  onRadiusChange,
  onToggleRadius,
  onUseMyLocation,
  onClearAll
}: FilterDrawerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto rounded-3xl border-none shadow-2xl bg-white/95 backdrop-blur-xl">
        <DialogHeader className="mb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-serif text-slate-900">Refine Search</DialogTitle>
            <button 
              onClick={onClearAll}
              className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors px-2 py-1"
            >
              Clear All
            </button>
          </div>
          <DialogDescription className="text-slate-500">
            Adjust location, distance, and sorting to find your perfect experience.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-8 py-2">
          {/* Location */}
          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Location</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onLocationSelect("")}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border duration-200",
                  currentLoc === "" 
                    ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20" 
                    : "bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100 hover:border-slate-200"
                )}
              >
                Anywhere
              </button>
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.value}
                  onClick={() => onLocationSelect(loc.value)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border duration-200",
                    currentLoc === loc.value 
                      ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20" 
                      : "bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100 hover:border-slate-200"
                  )}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Radius */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Radius Search</span>
                <button
                  onClick={() => onToggleRadius(!isRadEnabled)}
                  className={cn(
                    "w-10 h-5 rounded-full transition-all relative",
                    isRadEnabled ? "bg-rose-500" : "bg-slate-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform",
                    isRadEnabled ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>
              <button 
                onClick={onUseMyLocation}
                disabled={isGettingLocation || !isRadEnabled}
                className="text-[10px] bg-rose-50 text-rose-600 hover:bg-rose-100 px-2 py-1 rounded-md font-bold transition-all disabled:opacity-30 flex items-center gap-1"
              >
                <Navigation className="w-3 h-3" />
                {isGettingLocation ? "Locating..." : (currentLat ? "Using GPS" : "Use My Location")}
              </button>
            </div>
            
            <div className={cn(
              "flex flex-col gap-4 p-4 rounded-2xl border transition-all duration-300",
              isRadEnabled 
                ? "bg-slate-50 border-slate-100 opacity-100" 
                : "bg-gray-50/50 border-transparent opacity-40 grayscale pointer-events-none"
            )}>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" 
                  max={RADIUS_MARKS.length - 1} 
                  step="1"
                  value={RADIUS_MARKS.indexOf(currentRad) !== -1 ? RADIUS_MARKS.indexOf(currentRad) : 1}
                  onChange={(e) => onRadiusChange(RADIUS_MARKS[parseInt(e.target.value)])}
                  className="flex-1 accent-rose-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-900 w-12 text-right">{currentRad}km</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {isRadEnabled ? "Searching within a specific radius of your chosen location or GPS." : "Enable radius search to refine by distance."}
              </p>
            </div>
          </div>

          {/* Sort By */}
          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sort Results</span>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onSortSelect(option.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                    currentSort === option.value 
                      ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-900 hover:text-slate-900"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex gap-3">
          <Button 
            className="flex-1 rounded-xl bg-slate-900 text-white font-bold h-12 shadow-xl shadow-slate-900/10"
            onClick={onClose}
          >
            Show Results
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
