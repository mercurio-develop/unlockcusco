"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useItinerary } from "@/lib/store/itinerary-context";
import { MapPin, Star, ChevronRight, Check, X, Loader2, CheckCircle2, Edit2, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OptimizedPlan } from "@/lib/ai/schemas/planner-schema";
import { fetchAccommodations } from "@/features/business/actions/fetch-accommodations";

function WaypointCard({ waypoint, stepIdx }: { waypoint: OptimizedPlan['waypoints'][0]; stepIdx: number }) {
  const { swapWaypointAlternative, removeWaypoint, isEditMode, moveWaypoint, activeItinerary, setSelectedId } = useItinerary();
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === ((activeItinerary?.waypoints.length || 1) - 1);

  return (
    <div className="relative pl-10">
      {/* Timeline dot */}
      <div className="absolute left-0 top-4 w-8 h-8 rounded-full bg-slate-900 border-2 border-white shadow-md flex items-center justify-center text-sm z-10">
        📍
      </div>

      <div className={cn("bg-white rounded-2xl border shadow-sm overflow-hidden transition-all", isEditMode ? "border-indigo-200 shadow-indigo-100" : "border-gray-100")}>
        {/* Step header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-50 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-0.5">
              Stop {stepIdx + 1}
            </p>
            <h3 className="text-sm font-semibold text-slate-900">{waypoint.category} in {waypoint.locationStr}</h3>
          </div>
          {isEditMode ? (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => moveWaypoint(stepIdx, stepIdx - 1)}
                disabled={isFirst}
                className="text-slate-400 hover:text-slate-700 disabled:opacity-30 p-1"
                title="Move up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button 
                onClick={() => moveWaypoint(stepIdx, stepIdx + 1)}
                disabled={isLast}
                className="text-slate-400 hover:text-slate-700 disabled:opacity-30 p-1"
                title="Move down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-200 mx-1" />
              <button 
                onClick={() => removeWaypoint(stepIdx)}
                className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                title="Remove stop"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => removeWaypoint(stepIdx)}
              className="text-slate-400 hover:text-rose-500 transition-colors p-1 hidden"
              title="Remove stop"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Alternatives */}
        <div className="divide-y divide-gray-50">
          {waypoint.alternatives?.map((alt, altIdx) => {
            const isSelected = waypoint.id === alt.id;
            return (
              <div 
                key={alt.id ?? altIdx} 
                onDoubleClick={() => isSelected && alt.id && setSelectedId(alt.id)}
                className={cn(
                  "transition-all duration-200 border-l-4",
                  isSelected ? "bg-emerald-50/40 border-emerald-500 shadow-inner" : "border-transparent hover:bg-gray-50 text-slate-600"
                )}
              >
                <button
                  onClick={() => swapWaypointAlternative(stepIdx, altIdx)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                >
                  {/* Radio indicator */}
                  <div className={cn(
                    "shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                    isSelected ? "border-emerald-600 bg-emerald-50" : "border-gray-300"
                  )}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                  </div>

                  {/* Name */}
                  <span className={cn(
                    "flex-1 text-sm font-medium truncate",
                    isSelected ? "text-slate-900" : "text-slate-800"
                  )}>
                    {alt.name}
                  </span>

                  {/* Rating */}
                  {alt.rating !== undefined && (
                    <div className={cn(
                      "flex items-center gap-1 shrink-0 text-xs font-semibold",
                      isSelected ? "text-emerald-700" : "text-slate-500"
                    )}>
                      <Star className={cn("w-3 h-3", isSelected ? "fill-emerald-600 text-emerald-600" : "fill-amber-400 text-amber-400")} />
                      {Number(alt.rating).toFixed(1)}
                    </div>
                  )}

                  {/* Arrow for selected */}
                  {isSelected && <ChevronRight className={cn("w-3.5 h-3.5 text-emerald-600 shrink-0", alt.whatsapp && "rotate-90")} />}
                </button>
                
                {/* Expanded Details */}
                {isSelected && alt.whatsapp && (
                  <div className="px-4 pb-3 pt-1 border-t border-emerald-100/50 mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const msg = encodeURIComponent(`Hello ${alt.name}, I am planning to visit and would like to check availability!`);
                        window.open(`https://wa.me/51${alt.whatsapp}?text=${msg}`, "_blank");
                      }}
                      className="w-full text-[10px] font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 py-1.5 rounded-md transition-colors"
                    >
                      Check Availability
                    </button>
                  </div>
                )}
                {isSelected && (
                  <div className="px-4 pb-2 text-center text-[10px] text-slate-400 font-medium">
                    Double-click to view on map
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Cost chip */}
        {waypoint.priceUsd !== undefined && waypoint.priceUsd > 0 && (
          <div className="px-4 pb-3 pt-2">
            <span className="text-xs text-slate-400 font-medium">
              Est. ${waypoint.priceUsd}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function TransitEdgeCard({ edge, stepIdx }: { edge: OptimizedPlan['transitEdges'][0]; stepIdx: number }) {
  const { swapDriverAlternative } = useItinerary();
  const allDrivers = [edge.defaultDriver, ...(edge.alternativeDrivers || [])];

  return (
    <div className="relative pl-10 my-2">
      {/* Timeline line connecting */}
      <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-slate-200 z-0" />
      {/* Timeline dot */}
      <div className="absolute left-[11px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-400 border border-white shadow-sm z-10" />

      <div className="bg-slate-50/50 rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
               <span className="text-lg">🚕</span>
               <div className="flex flex-col">
                 <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Transit Options</span>
                 <span className="text-[10px] text-slate-500">
                   {edge.fromLocation} → {edge.toLocation}
                 </span>
               </div>
            </div>
          </div>
          
          <div className="space-y-1 mt-2">
            {allDrivers.map((driver, altIdx) => {
              const isSelected = altIdx === 0;
              return (
                <div key={driver.id ?? altIdx} className={cn(
                  "rounded-lg transition-colors border",
                  isSelected ? "bg-white border-gray-200 shadow-sm" : "border-transparent"
                )}>
                  <button 
                    onClick={() => {
                      if (altIdx > 0) swapDriverAlternative(stepIdx, altIdx - 1);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-xs hover:bg-gray-100/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "shrink-0 w-3 h-3 rounded-full border flex items-center justify-center transition-colors",
                        isSelected ? "border-slate-900 bg-white" : "border-gray-300"
                      )}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                      </div>
                      <span className={cn("font-medium", isSelected ? "text-slate-900" : "text-slate-600")}>
                        {driver.name}
                      </span>
                    </div>
                    {driver.priceUsd !== undefined && (
                      <span className={cn("font-bold", isSelected ? "text-slate-900" : "text-slate-500")}>
                        ${driver.priceUsd}
                      </span>
                    )}
                  </button>
                  {isSelected && driver.whatsapp && (
                    <div className="px-3 pb-2 pt-1 border-t border-gray-50 mt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const msg = encodeURIComponent(`Hello ${driver.name}, I need transport from ${edge.fromLocation} to ${edge.toLocation}. Are you available?`);
                          window.open(`https://wa.me/51${driver.whatsapp}?text=${msg}`, "_blank");
                        }}
                        className="w-full text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 hover:bg-rose-100 py-1.5 rounded-md transition-colors"
                      >
                        Check Availability
                      </button>
                    </div>
                  )}
                  {isSelected && !driver.whatsapp && driver.name.includes("Public") && (
                    <div className="px-3 pb-2 pt-1 text-[10px] text-slate-500 font-medium text-center border-t border-gray-50 mt-1">
                      Pay directly to driver
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ItineraryPanel() {
  const { activeItinerary, setPanelMode, dismissAccommodation, addAccommodation, isEditMode, setIsEditMode, setSelectedId } = useItinerary();
  const [activeTab, setActiveTab] = useState<"itinerary" | "transport">("itinerary");
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!activeItinerary) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
        <MapPin className="w-10 h-10 mb-4 text-slate-200" />
        <h3 className="text-base font-serif text-slate-600 mb-2">No active itinerary</h3>
        <p className="text-sm leading-relaxed">
          Ask the AI Concierge to plan your day — e.g. <span className="italic">"I'm in Pisac, want coffee, then need to sleep in Ollantaytambo"</span>
        </p>
        <button
          onClick={() => setPanelMode("categories")}
          className="mt-6 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
        >
          Browse places instead →
        </button>
      </div>
    );
  }

  const { origin, destination, waypoints, transitEdges } = activeItinerary;
  const totalCost = (activeItinerary as any).totalCost ?? 0;

  return (
    <div className="flex flex-col h-full bg-gray-50/80 overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Live Plan</span>
          </div>
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-colors",
              isEditMode ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {isEditMode ? <><CheckCircle2 className="w-3.5 h-3.5" /> Done</> : <><
              Edit2 className="w-3.5 h-3.5" /> Edit</>}
          </button>
        </div>
        <h2 className="text-xl font-serif font-semibold text-slate-900">{(activeItinerary as any).title ?? `${origin.title} → ${destination.title}`}</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          {origin.title} · {waypoints.length} stops · {destination.title}
        </p>

        {/* Tabs */}
        <div className="bg-slate-100 p-1 rounded-lg flex w-full">
          <button
            onClick={() => setActiveTab("itinerary")}
            className={cn(
              "flex-1 flex justify-center items-center py-1.5 px-3 text-sm font-medium rounded-md transition-colors",
              activeTab === "itinerary" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Activities
          </button>
          <button
            onClick={() => setActiveTab("transport")}
            className={cn(
              "flex-1 flex justify-center items-center py-1.5 px-3 text-sm font-medium rounded-md transition-colors",
              activeTab === "transport" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Transport Options
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 px-5 py-6 space-y-0">
        {/* Vertical spine */}
        <div className="relative">
          {/* Background line spanning full height */}
          <div className="absolute left-[15px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 z-0" />

          <div className="space-y-4 relative z-10">
            {activeTab === "itinerary" ? (
              <>
                {/* Origin */}
                <div 
                  className="relative pl-10 opacity-80 hover:opacity-100 transition-opacity cursor-pointer select-none"
                  onDoubleClick={() => setSelectedId('itin-start')}
                  title="Double-click to view on map"
                >
                  <div className="absolute left-[12px] top-2 w-2 h-2 rounded-full bg-slate-400 z-10" />
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Start</h3>
                  <p className="text-sm font-semibold text-slate-900">{origin.title}</p>
                </div>

                {/* Waypoints Only */}
                {waypoints.map((waypoint, idx) => (
                  <WaypointCard key={idx} waypoint={waypoint} stepIdx={idx} />
                ))}

                {/* Add Activity Button in Edit Mode */}
                {isEditMode && (
                  <div className="relative pl-10 mt-2">
                    <button 
                      onClick={() => setPanelMode("categories")}
                      className="w-full border-2 border-dashed border-slate-300 rounded-xl py-3 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 hover:border-slate-400 hover:bg-slate-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Add Activity</span>
                    </button>
                  </div>
                )}

                {/* Destination */}
                <div 
                  className="relative pl-10 mt-4 cursor-pointer select-none opacity-90 hover:opacity-100 transition-opacity"
                  onDoubleClick={() => setSelectedId('itin-arrival')}
                  title="Double-click to view on map"
                >
                  <div className="absolute left-[10px] top-1.5 w-3 h-3 rounded-full bg-slate-900 ring-4 ring-white z-10 flex items-center justify-center">
                     <div className="w-1 h-1 bg-white rounded-full" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     Arrival <Check className="w-3 h-3 text-emerald-500" />
                  </h3>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{destination.title}</p>
                </div>
                
                {/* Services Upsell */}
                <div className="relative pl-10 mt-6">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 shadow-sm relative overflow-hidden">
                    <div className="flex gap-2">
                      <span className="text-base mt-1">💼</span>
                      <div className="flex-1 pr-2">
                        <p className="text-xs font-bold text-indigo-900">Enhance Your Trip</p>
                        <p className="text-[10px] text-indigo-700 mt-0.5 leading-tight">Ask the AI Concierge to book a Local Guide or Therapist for this itinerary.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accommodation Upsell */}
                {activeItinerary.needsAccommodationUpsell && (
                  <div className="relative pl-10 mt-6">
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 shadow-sm relative overflow-hidden">
                      <button 
                        onClick={dismissAccommodation}
                        className="absolute top-2 right-2 text-rose-400 hover:text-rose-600 transition-colors p-1"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex gap-2">
                        <span className="text-base mt-1">🛌</span>
                        <div className="flex-1 pr-4">
                          <p className="text-xs font-bold text-rose-900">Need a place to stay?</p>
                          <p className="text-[10px] text-rose-700 mt-0.5 leading-tight">Ask the concierge for highly-rated hotels in {destination.title}.</p>
                          <button
                            onClick={async () => {
                              setIsLoadingHotels(true);
                              try {
                                const hotels = await fetchAccommodations(destination.title);
                                if (hotels.length > 0) {
                                  addAccommodation(hotels);
                                } else {
                                  // Fallback if none found
                                  dismissAccommodation();
                                }
                              } finally {
                                setIsLoadingHotels(false);
                              }
                            }}
                            disabled={isLoadingHotels}
                            className="mt-2 w-full flex justify-center text-[10px] font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 py-1.5 rounded-md transition-colors disabled:opacity-50"
                          >
                            {isLoadingHotels ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Discover Options"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mb-4 pl-10">
                  <p className="text-sm text-slate-600">Select your preferred transport for each leg of the journey.</p>
                </div>
                {/* Transit Edges Only */}
                {transitEdges.map((edge, idx) => (
                  <TransitEdgeCard key={idx} edge={edge} stepIdx={idx} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer total */}
      <div className="px-6 py-5 bg-white border-t border-gray-100 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total estimated</p>
            <p className="text-2xl font-bold text-slate-900">${totalCost}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">{waypoints.length} stops</p>
          </div>
        </div>
        <button className="w-full bg-slate-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm">
          Book All · ${totalCost}
        </button>
      </div>
    </div>
  );
}
