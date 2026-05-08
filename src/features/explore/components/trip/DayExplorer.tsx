"use client"
import { TripDay, Traveler } from "@prisma/client";
import { TimelineEvent, FullTrip } from "@/lib/types/trip";

import { useState, useEffect } from "react"
import { useItinerary } from "@/lib/store/itinerary-context"
import { Moon, Plane, MapPin, Star, User, ChevronRight, Clock, Car, Plus, Trash2, Repeat, Navigation, ArrowUp, ArrowDown, Flag } from "lucide-react"
import { cn } from "@/lib/utils"
import { calculateTravelEstimate } from "@/lib/utils/geo-math"
import { BasecampCarousel } from "./BasecampCarousel"
import { useSearchParams } from "next/navigation"

export function DayExplorer() {
  const { activeItinerary, setSelectedId, selectedId, macroTrip, setPanelMode, removeWaypoint, setExchangeTargetIndex, setStartAnchorLocation, swapDriverAlternative, moveWaypoint, truncateAfterWaypoint } = useItinerary()
  const searchParams = useSearchParams()

  const [showConfirmModal, setShowConfirmModal] = useState<number | null>(null)
  const [openTransportId, setOpenTransportId] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  if (!activeItinerary) return null

  const isWaypointActive = (startTime?: string, durationMins?: number) => {
    if (!startTime) return false
    const parts = startTime.split(':')
    if (parts.length < 2) return false
    const hours = parseInt(parts[0])
    const minutes = parseInt(parts[1])
    const start = new Date(currentTime)
    start.setHours(hours, minutes, 0, 0)
    const end = new Date(start.getTime() + (durationMins || 120) * 60000)
    return currentTime >= start && currentTime <= end
  }

  const startAnchor = activeItinerary.startAnchor;
  const endAnchor = activeItinerary.endAnchor;
  const waypoints = activeItinerary.waypoints || []
  const transitEdges = activeItinerary.transitEdges || []
  
  if (startAnchor && !startAnchor.locationStr) {
    startAnchor.locationStr = "Plaza"
  }

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
          console.error("Error getting location:", error instanceof GeolocationPositionError ? error.message : error);
          alert("Could not access your location. Please check your browser permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 scrollbar-hide">
      <div className="flex flex-col space-y-6">

        {/* Start Anchor */}
        <div 
          className="relative group cursor-pointer flex gap-4"
          onClick={() => setSelectedId('itin-start')}
        >
          <div className="flex flex-col items-center pt-2">
            <div className="w-8 h-8 rounded-full bg-white border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)] z-20 flex items-center justify-center shrink-0 hover:scale-110 transition-transform">
              {startAnchor?.type === 'AIRPORT' ? <Plane className="w-4 h-4 text-rose-500" /> : <div className="w-2 h-2 rounded-full bg-rose-500" />}
            </div>
            <div className="w-0.5 h-full bg-rose-200 mt-2 min-h-6" />
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-rose-300 transition-all flex-1">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em] block mb-1">Start Anchor</span>
                <h3 className="text-slate-900 font-serif font-bold text-lg">{startAnchor?.title}</h3>
                <p className="text-slate-500 text-xs">{startAnchor?.locationStr}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {startAnchor?.time && <div className="text-slate-500 text-xs font-mono">{startAnchor.time}</div>}
                <button
                  onClick={(e) => { e.stopPropagation(); setExchangeTargetIndex(-1); setPanelMode("categories"); }}
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-rose-600 transition-colors uppercase tracking-widest"
                >
                  <Repeat className="w-3 h-3" /> Exchange
                </button>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={handleUseCurrentLocation}
                className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors w-full justify-center"
              >
                <Navigation className="w-3.5 h-3.5" />
                Use Current Location
              </button>
            </div>
          </div>
        </div>

        {/* Empty State / Add Experience */}
        {waypoints.length === 0 && (
          <div className="relative group flex gap-4">
            <div className="flex flex-col items-center pt-2">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-dashed border-slate-300 z-20 flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4 text-slate-400" />
              </div>
              <div className="w-0.5 h-full bg-gray-200 mt-2 min-h-6" />
            </div>

            <div 
              onClick={() => setPanelMode("categories")}
              className="bg-white border border-dashed border-gray-300 rounded-2xl p-6 shadow-sm hover:shadow hover:border-rose-300 hover:bg-rose-50/30 transition-all flex-1 cursor-pointer flex flex-col items-center justify-center text-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Plus className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-sm">Add an Experience</h3>
                <p className="text-slate-500 text-xs mt-1">Discover activities, dining, or wellness in Vallecito to build your day.</p>
              </div>
            </div>
          </div>
        )}

        {/* WAYPOINTS & TRANSIT */}        {waypoints.map((wp: any /* TODO: Waypoint */, idx: number) => {
          const edge = transitEdges[idx]
          const prevWp = idx === 0 ? startAnchor : waypoints[idx - 1]
          const estimate = calculateTravelEstimate(prevWp?.lat, prevWp?.lng, wp?.lat, wp?.lng);

          return (
            <div key={`${wp.id}-${idx}`} className="space-y-6">

              {edge && (
                <div className="relative group flex gap-4">
                  <div className="flex flex-col items-center pt-2">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm z-10 flex items-center justify-center shrink-0">
                      <Car className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="w-0.5 h-full bg-gray-200 mt-2 min-h-6" />
                  </div>
                  <div className="bg-gray-50 flex flex-col p-3 rounded-xl border border-gray-100 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {edge.fromLocation} → {edge.toLocation}
                      </span>
                      {estimate && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          {(() => {
                            const driverName = edge?.defaultDriver?.name?.toLowerCase() || '';
                            const isColectivo = driverName.includes('colectivo');
                            const isMoto = driverName.includes('moto');
                            
                            let timeMins = Math.ceil(estimate.distanceKm * 2.5); // default taxi speed
                            let icon = '🚕';
                            let labelText = 'Taxi';
                            
                            const isWalking = edge.defaultDriver?.name?.toLowerCase().includes('walk') || edge.isWalkingOverride;

                            if (isWalking) {
                              timeMins = Math.ceil(estimate.distanceKm * 12);
                              icon = '🚶‍♂️';
                              labelText = 'Walking';
                            } else if (isColectivo) {
                              timeMins = Math.ceil(estimate.distanceKm * 3.5);
                              icon = '🚌';
                              labelText = 'Bus';
                            } else if (isMoto) {
                              timeMins = Math.ceil(estimate.distanceKm * 3.0);
                              icon = '🛺';
                              labelText = 'Moto Taxi';
                            }
                            
                            return (
                              <div className="flex items-center gap-2">
                                <span>{icon} {labelText} (approx {timeMins} mins)</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // This is a placeholder for updating the context
                                    alert("Mode toggle coming soon! Switching to " + (isWalking ? "Taxi" : "Walking"));
                                  }}
                                  className="ml-1 p-1 rounded-md bg-white/50 hover:bg-white text-[9px] font-bold uppercase tracking-tighter"
                                >
                                  {isWalking ? "Use Taxi" : "Use Walk"}
                                </button>
                              </div>
                            );
                          })()}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm transition-all hover:border-rose-200">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">
                          {edge.defaultDriver?.name?.toLowerCase().includes('colectivo') ? '🚌' : '🚕'}
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{edge.defaultDriver?.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-500">${edge.defaultDriver?.priceUsd}</span>
                        {edge.alternativeDrivers && edge.alternativeDrivers.length > 0 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenTransportId(openTransportId === idx ? null : idx); }}
                            className="p-1 hover:bg-rose-100 rounded-md transition-colors"
                            title="Change Driver"
                          >
                            <Repeat className="w-3.5 h-3.5 text-rose-500" />
                          </button>
                        )}
                      </div>
                    </div>
                    {openTransportId === (idx === -1 ? 'return' : idx) && edge.alternativeDrivers && (
                      <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Available Drivers</div>
                        <div className="grid gap-1.5">
                          {edge.alternativeDrivers.map((alt: any /* TODO: AlternativeDriver */, altIdx: number) => (
                            <button
                              key={alt.id}
                              onClick={(e) => { e.stopPropagation(); swapDriverAlternative(idx === -1 ? transitEdges.length - 1 : idx, altIdx); setOpenTransportId(null); }}
                              className="text-left w-full px-3 py-2 text-xs text-slate-600 bg-white border border-gray-200 rounded-xl hover:border-rose-400 hover:bg-rose-50/30 transition-all flex justify-between items-center group/btn shadow-sm hover:shadow"
                            >
                              <div className="flex flex-col">
                                <span className="font-bold group-hover/btn:text-rose-700">{alt.name}</span>
                                {alt.id?.includes('colectivo') && <span className="text-[9px] text-slate-400">Public Business</span>}
                              </div>
                              <span className="font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded group-hover/btn:bg-rose-100 group-hover/btn:text-rose-700 transition-colors">${alt.priceUsd}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="relative group flex gap-4">
                <div 
                  className="flex flex-col items-center pt-2 cursor-pointer"
                  onClick={() => setSelectedId(wp.id)}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full bg-white border-2 z-20 shrink-0 transition-all hover:scale-110 shadow-sm flex items-center justify-center",
                    selectedId === wp.id ? "border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]" : 
                    isWaypointActive(wp.startTime, wp.durationMins) ? "border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "border-rose-400"
                  )}>
                    {isWaypointActive(wp.startTime, wp.durationMins) && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                  </div>
                  <div className="w-0.5 h-full bg-rose-200 mt-2 min-h-6" />
                </div>

                <div className="flex-1">
                  <div 
                    onClick={() => setSelectedId(wp.id)}
                    className={cn(
                      "bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer",
                      isWaypointActive(wp.startTime, wp.durationMins) && "ring-2 ring-emerald-500/20 border-emerald-200 bg-emerald-50/10"
                    )}
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
                        {wp.startTime && (
                          <div className="text-rose-600 text-xs font-bold bg-rose-50 px-2 py-1 rounded-md">
                            {wp.startTime}
                          </div>
                        )}
                        {wp.durationMins && (
                          <div className="text-slate-500 text-[10px] font-bold uppercase flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {wp.durationMins}m
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Inline Editing Controls shown on hover */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {idx > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); moveWaypoint(idx, idx - 1); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-slate-900 transition-colors shadow-sm"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {idx < waypoints.length - 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); moveWaypoint(idx, idx + 1); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-slate-900 transition-colors shadow-sm"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    )}
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
                    {wp.service?.slug && (
                      <a
                        href={wp.service.category === 'AGENCY' ? `/agencies/${wp.service.slug}` : `/therapists/${wp.service.slug}`}
                        target="_blank"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Details
                      </a>
                    )}
                    
                    {/* Final Destination Set Button */}
                    {idx < waypoints.length - 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowConfirmModal(idx); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm"
                      >
                        <Flag className="w-3.5 h-3.5" /> Set as Final Destination
                      </button>
                    )}
                  </div>
                </div>

                {showConfirmModal === idx && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                      <h3 className="font-bold text-lg text-slate-900 mb-2">Set Final Destination?</h3>
                      <p className="text-sm text-slate-500 mb-6">Are you sure? This will remove your previous Basecamp return trip and end the day here.</p>
                      <div className="flex gap-3 justify-end">
                        <button onClick={() => setShowConfirmModal(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                        <button onClick={() => { truncateAfterWaypoint(idx); setShowConfirmModal(null); }} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors">Confirm & Truncate</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Return Transit */}
        {transitEdges.length > waypoints.length && (
          <div className="relative group flex gap-4">
            <div className="flex flex-col items-center pt-2">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm z-10 flex items-center justify-center shrink-0">
                <Car className="w-4 h-4 text-slate-500" />
              </div>
              <div className="w-0.5 h-full bg-gray-200 mt-2 min-h-6" />
            </div>
            <div className="bg-gray-50 flex flex-col p-3 rounded-xl border border-gray-100 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Return to Basecamp
                </span>
                {(() => {
                  const lastWp = waypoints.length > 0 ? waypoints[waypoints.length - 1] : startAnchor;
                  const estimate = calculateTravelEstimate(lastWp?.lat, lastWp?.lng, endAnchor?.lat, endAnchor?.lng);
                  const idx = transitEdges.length - 1;
                  const edge = transitEdges[idx];
                  return estimate ? (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {(() => {
                        const driverName = edge?.defaultDriver?.name?.toLowerCase() || '';
                        const isColectivo = driverName.includes('colectivo');
                        const isMoto = driverName.includes('moto');
                        const isWalk = driverName.includes('walk');
                        
                        let timeMins = Math.ceil(estimate.distanceKm * 2.5); // default taxi speed
                        let icon = '🚕';
                        let labelText = 'Taxi';
                        
                        if (isWalk) {
                          timeMins = Math.ceil(estimate.distanceKm * 12);
                          icon = '🚶‍♂️';
                          labelText = 'Walking';
                        } else if (isColectivo) {
                          timeMins = Math.ceil(estimate.distanceKm * 3.5);
                          icon = '🚌';
                          labelText = 'Bus';
                        } else if (isMoto) {
                          timeMins = Math.ceil(estimate.distanceKm * 3.0);
                          icon = '🛺';
                          labelText = 'Moto Taxi';
                        }
                        
                        return `${icon} ${labelText} (approx ${timeMins || 1} mins)`;
                      })()}
                    </span>
                  ) : null;
                })()}
              </div>
              {(() => {
                const idx = transitEdges.length - 1;
                const edge = transitEdges[idx];

                return (
                  <>
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm transition-all hover:border-rose-200">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">
                          {(() => {
                            const name = edge?.defaultDriver?.name?.toLowerCase() || '';
                            if (name.includes('walk')) return '🚶‍♂️';
                            if (name.includes('colectivo')) return '🚌';
                            if (name.includes('moto')) return '🛺';
                            return '🚕';
                          })()}
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{edge.defaultDriver?.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-500">${edge.defaultDriver?.priceUsd}</span>
                        {edge.alternativeDrivers && edge.alternativeDrivers.length > 0 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenTransportId(openTransportId === idx ? null : idx); }}
                            className="p-1 hover:bg-rose-100 rounded-md transition-colors"
                            title="Change Driver"
                          >
                            <Repeat className="w-3.5 h-3.5 text-rose-500" />
                          </button>
                        )}
                      </div>
                    </div>
                    {openTransportId === (idx === -1 ? 'return' : idx) && edge.alternativeDrivers && (
                      <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Available Drivers</div>
                        <div className="grid gap-1.5">
                          {edge.alternativeDrivers.map((alt: any /* TODO: AlternativeDriver */, altIdx: number) => (
                            <button
                              key={alt.id}
                              onClick={(e) => { e.stopPropagation(); swapDriverAlternative(idx === -1 ? transitEdges.length - 1 : idx, altIdx); setOpenTransportId(null); }}
                              className="text-left w-full px-3 py-2 text-xs text-slate-600 bg-white border border-gray-200 rounded-xl hover:border-rose-400 hover:bg-rose-50/30 transition-all flex justify-between items-center group/btn shadow-sm hover:shadow"
                            >
                              <div className="flex flex-col">
                                <span className="font-bold group-hover/btn:text-rose-700">{alt.name}</span>
                                {alt.id?.includes('colectivo') && <span className="text-[9px] text-slate-400">Public Business</span>}
                              </div>
                              <span className="font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded group-hover/btn:bg-rose-100 group-hover/btn:text-rose-700 transition-colors">${alt.priceUsd}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {/* End Anchor */}
        <div 
          className="relative group cursor-pointer flex gap-4"
          onClick={() => setSelectedId('itin-arrival')}
        >
          <div className="flex flex-col items-center pt-2">
            <div className="w-8 h-8 rounded-full bg-white border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)] z-20 flex items-center justify-center shrink-0 hover:scale-110 transition-transform">
              <Moon className="w-4 h-4 text-rose-500" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-rose-300 transition-all flex-1">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em] block mb-1">End Anchor</span>
                <h3 className="text-slate-900 font-serif font-bold text-lg">{endAnchor?.title}</h3>
                <p className="text-slate-500 text-xs">{endAnchor?.locationStr}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setExchangeTargetIndex(-2); setPanelMode("categories"); }}
                className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-rose-600 transition-colors uppercase tracking-widest"
              >
                <Repeat className="w-3 h-3" /> Exchange
              </button>
            </div>
            
            {endAnchor?.service?.slug && (
              <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2 justify-end">
                <a
                  href={endAnchor.service.category === 'AGENCY' ? `/agencies/${endAnchor.service.slug}` : `/therapists/${endAnchor.service.slug}`}
                  target="_blank"
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Details
                </a>
              </div>
            )}
          </div>
        </div>

        {endAnchor?.type === 'GENERIC_TOWN' && (
          <div className="mt-2 p-6 border border-gray-200 rounded-3xl bg-white shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BasecampCarousel locationTown={endAnchor.locationStr} />
          </div>
        )}
      </div>
    </div>
  )
}
