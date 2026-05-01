"use client"

import { useItinerary } from "@/lib/store/itinerary-context"
import { Moon, Plane, MapPin, Star, User, ChevronRight, Clock, Car, Plus, Trash2, Repeat, Navigation } from "lucide-react"
import { cn } from "@/lib/utils"
import { BasecampCarousel } from "./BasecampCarousel"
import { useSearchParams } from "next/navigation"

export function DayExplorer() {
  const { activeItinerary, setSelectedId, macroTrip, setPanelMode, isEditMode, removeWaypoint, setExchangeTargetIndex, setStartAnchorLocation } = useItinerary()
  const searchParams = useSearchParams()

  if (!activeItinerary) return null

  const startAnchor = (activeItinerary as any).startAnchor || (activeItinerary as any).origin
  const endAnchor = (activeItinerary as any).endAnchor || (activeItinerary as any).destination
  const waypoints = activeItinerary.waypoints || []
  const transitEdges = activeItinerary.transitEdges || []

  const dayNum = Number(searchParams.get("day"))
  const currentMacroDay = macroTrip?.days?.find((d: any) => d.dayNumber === dayNum)

  const handleUseCurrentLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setStartAnchorLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Could not access your location. Please check your browser permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 scrollbar-hide">

      <div className="relative border-l-2 border-gray-200 ml-4 pl-8 space-y-12">

        <div 
          className="relative group cursor-pointer"
          onClick={() => setSelectedId('itin-start')}
        >
          {/* Top line mask */}
          <div className="absolute -left-[34px] bottom-1/2 w-[4px] h-[500px] bg-gray-50 z-10" />

          <div className="absolute -left-[43px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)] z-20 flex items-center justify-center">
            {startAnchor?.type === 'AIRPORT' ? <Plane className="w-3 h-3 text-rose-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-rose-300 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em] block mb-1">Start Anchor</span>
                <h3 className="text-slate-900 font-serif font-bold text-lg">{startAnchor?.title}</h3>
                <p className="text-slate-500 text-xs">{startAnchor?.locationStr}</p>
              </div>
              {startAnchor?.time && <div className="text-slate-500 text-xs font-mono">{startAnchor.time}</div>}
            </div>
            
            {isEditMode && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={handleUseCurrentLocation}
                  className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors w-full justify-center"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Use Current Location
                </button>
              </div>
            )}
          </div>
        </div>

        {(!currentMacroDay?.tourPackageTitle && !isEditMode) ? null : (
          <div className="relative group mt-12 mb-12">
            <div className="absolute -left-[43px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)] z-20 flex items-center justify-center">
              <Star className="w-3 h-3 text-rose-500" />
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:border-rose-300 transition-all">
              {currentMacroDay?.tourPackageTitle ? (
                <div>
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em] block mb-2">Macro Experience</span>
                  <h3 className="text-slate-900 font-serif font-bold text-xl mb-2">{currentMacroDay.tourPackageTitle}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">This anchor experience defines your day's narrative arc.</p>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em] block mb-2">Macro Experience</span>
                    <h3 className="text-slate-900 font-serif font-bold text-xl mb-1">No Primary Experience Selected</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">Enhance this day by adding a curated Vallecito expedition.</p>
                  </div>
                  <button 
                    onClick={() => setPanelMode("categories")}
                    className="flex items-center gap-2 text-xs font-bold bg-rose-600 text-white px-5 py-2.5 rounded-full hover:bg-rose-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Experience
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WAYPOINTS & TRANSIT */}
        {waypoints.map((wp: any, idx: number) => {
          const edge = transitEdges[idx]

          return (
            <div key={`${wp.id}-${idx}`} className="space-y-12">

              {edge && (
                <div className="relative">
                  <div className="absolute -left-[48px] top-0 bottom-0 flex flex-col justify-center">
                    <div className="bg-white border border-gray-200 p-1.5 rounded-full shadow-sm z-10">
                      <Car className="w-3 h-3 text-slate-500" />
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-gray-50 inline-block px-2 -ml-2">
                    {edge.defaultDriver?.name} · {edge.fromLocation} → {edge.toLocation}
                  </div>
                </div>
              )}

              <div 
                className="relative group"
              >
                <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)] z-20 transition-transform" />

                <div 
                  onClick={() => setSelectedId(wp.id)}
                  className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">{wp.category}</span>
                        {wp.rating && (
                          <div className="flex items-center gap-0.5 text-[9px] text-amber-500 font-bold">
                            <Star className="w-2.5 h-2.5 fill-current" /> {wp.rating}
                          </div>
                        )}
                      </div>
                      <h3 className="text-slate-900 font-serif font-bold text-base">{wp.title}</h3>
                      <p className="text-slate-500 text-xs leading-relaxed mt-1">{wp.locationStr}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {wp.durationMins && (
                        <div className="text-slate-500 text-[10px] font-bold uppercase flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {wp.durationMins}m
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {isEditMode && (
                  <div className="flex items-center gap-2 mt-3 ml-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setExchangeTargetIndex(idx); setPanelMode("categories"); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-slate-900 transition-colors shadow-sm"
                    >
                      <Repeat className="w-3.5 h-3.5" /> Exchange
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeWaypoint(idx); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 transition-colors shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        <div className="space-y-8">
           {transitEdges.length > waypoints.length && (
              <div className="relative">
                <div className="absolute -left-[48px] top-0 bottom-0 flex flex-col justify-center">
                  <div className="bg-white border border-gray-200 p-1.5 rounded-full shadow-sm z-10">
                    <Car className="w-3 h-3 text-slate-500" />
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-gray-50 inline-block px-2 -ml-2">
                  Return to Basecamp
                </div>
              </div>
           )}

          <div 
            className="relative group cursor-pointer"
            onClick={() => setSelectedId('itin-arrival')}
          >
            {/* Bottom line mask */}
            <div className="absolute -left-[34px] top-1/2 w-[4px] h-[800px] bg-gray-50 z-10" />

            <div className="absolute -left-[43px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)] z-20 flex items-center justify-center">
              <Moon className="w-3 h-3 text-rose-500" />
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-rose-300 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em] block mb-1">End Anchor</span>
                  <h3 className="text-slate-900 font-serif font-bold text-lg">{endAnchor?.title}</h3>
                  <p className="text-slate-500 text-xs">{endAnchor?.locationStr}</p>
                </div>
              </div>
            </div>
          </div>

          {endAnchor?.type === 'GENERIC_TOWN' && (
            <div className="mt-8 p-6 border border-rose-200 rounded-3xl bg-white shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100">
                   <Moon className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                   <h3 className="text-slate-900 font-serif font-bold text-lg leading-tight">Secure your sanctuary in {endAnchor.locationStr}</h3>
                   <p className="text-slate-500 text-xs mt-0.5">Choose a verified basecamp to complete your day.</p>
                </div>
              </div>
              <BasecampCarousel locationTown={endAnchor.locationStr} />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
