"use client"

import { useItinerary } from "@/lib/store/itinerary-context"
import { Moon, Plane, MapPin, Star, User, ChevronRight, Clock, Car, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { BasecampCarousel } from "./BasecampCarousel"
import { useSearchParams } from "next/navigation"

export function DayExplorer() {
  const { activeItinerary, setSelectedId, macroTrip, setPanelMode } = useItinerary()
  const searchParams = useSearchParams()

  if (!activeItinerary) return null

  const startAnchor = (activeItinerary as any).startAnchor || (activeItinerary as any).origin
  const endAnchor = (activeItinerary as any).endAnchor || (activeItinerary as any).destination
  const waypoints = activeItinerary.waypoints || []
  const transitEdges = activeItinerary.transitEdges || []

  const dayNum = Number(searchParams.get("day"))
  const currentMacroDay = macroTrip?.days?.find((d: any) => d.dayNumber === dayNum)

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-6 scrollbar-hide">

      <div className="relative border-l-2 border-slate-800 ml-4 pl-8 space-y-12 py-4">

        <div 
          className="relative group cursor-pointer"
          onClick={() => setSelectedId('itin-start')}
        >
          <div className="absolute -left-[43px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-950 border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)] z-20 flex items-center justify-center">
            {startAnchor?.type === 'AIRPORT' ? <Plane className="w-3 h-3 text-rose-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 hover:border-rose-500/50 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] block mb-1">Start Anchor</span>
                <h3 className="text-white font-serif font-bold text-lg">{startAnchor?.title}</h3>
                <p className="text-slate-400 text-xs">{startAnchor?.locationStr}</p>
              </div>
              {startAnchor?.time && <div className="text-slate-400 text-xs font-mono">{startAnchor.time}</div>}
            </div>
          </div>
        </div>

        <div className="relative group mt-12 mb-12">
          <div className="absolute -left-[43px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-950 border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)] z-20 flex items-center justify-center">
            <Star className="w-3 h-3 text-rose-500" />
          </div>

          <div className="bg-slate-900 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-rose-500/50 transition-all shadow-lg">
            {currentMacroDay?.tourPackageTitle ? (
              <div>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] block mb-2">Macro Experience</span>
                <h3 className="text-white font-serif font-bold text-xl mb-2">{currentMacroDay.tourPackageTitle}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">This anchor experience defines your day's narrative arc.</p>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-4">
                <div>
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] block mb-2">Macro Experience</span>
                  <h3 className="text-white font-serif font-bold text-xl mb-1">No Primary Experience Selected</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">Enhance this day by adding a curated Vallecito expedition.</p>
                </div>
                <button 
                  onClick={() => setPanelMode("categories")}
                  className="flex items-center gap-2 text-xs font-bold bg-rose-600 text-white px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" /> Add Experience
                </button>
              </div>
            )}
          </div>
        </div>

        {/* WAYPOINTS & TRANSIT */}
        {waypoints.map((wp: any, idx: number) => {
          const edge = transitEdges[idx]

          return (
            <div key={`${wp.id}-${idx}`} className="space-y-12">

              {edge && (
                <div className="relative">
                  <div className="absolute -left-[48px] top-0 bottom-0 flex flex-col justify-center">
                    <div className="bg-slate-950 border border-slate-800 p-1.5 rounded-full shadow-lg">
                      <Car className="w-3 h-3 text-slate-500" />
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950 inline-block px-2 -ml-2">
                    {edge.defaultDriver?.name} · {edge.fromLocation} → {edge.toLocation}
                  </div>
                </div>
              )}

              <div 
                className="relative group cursor-pointer"
                onClick={() => setSelectedId(wp.id)}
              >
                <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-950 border-2 border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.3)] z-20 group-hover:scale-125 transition-transform" />

                <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-4 hover:border-rose-500/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{wp.category}</span>
                        {wp.rating && (
                          <div className="flex items-center gap-0.5 text-[9px] text-rose-500 font-bold">
                            <Star className="w-2.5 h-2.5 fill-current" /> {wp.rating}
                          </div>
                        )}
                      </div>
                      <h3 className="text-white font-serif font-bold text-base">{wp.title}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed mt-1">{wp.locationStr}</p>
                    </div>
                    {wp.durationMins && (
                      <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {wp.durationMins}m
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        <div className="space-y-8">
           {transitEdges.length > waypoints.length && (
              <div className="relative">
                <div className="absolute -left-[48px] top-0 bottom-0 flex flex-col justify-center">
                  <div className="bg-slate-950 border border-slate-800 p-1.5 rounded-full shadow-lg">
                    <Car className="w-3 h-3 text-slate-500" />
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950 inline-block px-2 -ml-2">
                  Return to Basecamp
                </div>
              </div>
           )}

          <div 
            className="relative group cursor-pointer"
            onClick={() => setSelectedId('itin-arrival')}
          >
            <div className="absolute -left-[43px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-950 border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)] z-20 flex items-center justify-center">
              <Moon className="w-3 h-3 text-rose-500" />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 hover:border-rose-500/50 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] block mb-1">End Anchor</span>
                  <h3 className="text-white font-serif font-bold text-lg">{endAnchor?.title}</h3>
                  <p className="text-slate-400 text-xs">{endAnchor?.locationStr}</p>
                </div>
              </div>
            </div>
          </div>

          {endAnchor?.type === 'GENERIC_TOWN' && (
            <div className="mt-8 p-6 border border-rose-500/30 rounded-3xl bg-slate-900/30 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center">
                   <Moon className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                   <h3 className="text-white font-serif font-bold text-lg leading-tight">Secure your sanctuary in {endAnchor.locationStr}</h3>
                   <p className="text-slate-400 text-xs mt-0.5">Choose a verified basecamp to complete your day.</p>
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
