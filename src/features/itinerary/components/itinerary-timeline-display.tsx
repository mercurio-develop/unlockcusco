"use client";

import { useState } from "react";
import { useItineraryStore } from "@/lib/store/use-itinerary-store";
import { useMapboxRoute, type RouteData } from "@/features/discovery/hooks/use-mapbox-route";
import { BusinessCard } from "@/features/discovery/components/business-card";
import { getCategoryColor } from "@/lib/utils/category-style";
import { MapPin, Navigation, Clock, Bed, ChevronDown } from "lucide-react";
import type { TransportProfile } from "@/lib/store/use-itinerary-store";
import type { Business } from "@prisma/client";

// Reusable edge component from ItineraryPanel
function TransitEdge({ index, routeData, transportProfile }: { index: number; routeData: RouteData | null; transportProfile: TransportProfile }) {
  const leg = routeData?.legs?.[index];
  if (!leg) return (
    <div className="relative h-8 w-full flex items-center">
      <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-slate-200" />
    </div>
  );
  
  const durationMin = Math.round(leg.duration / 60);
  const distanceKm = +(leg.distance / 1000).toFixed(1);

  return (
    <div className="relative py-2 w-full flex items-center">
      <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-slate-200" />
      <div className="ml-[40px] bg-white border border-slate-200 shadow-sm rounded-lg p-1.5 flex items-center gap-3 z-10 relative">
        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest"><Clock className="w-3 h-3" /> {durationMin} min</span>
        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest"><Navigation className="w-3 h-3" /> {distanceKm} km</span>
      </div>
    </div>
  );
}

export function ItineraryTimelineDisplay({ isEs }: { isEs: boolean }) {
  const activeItinerary = useItineraryStore(s => s.activeItinerary);
  const transportProfiles = useItineraryStore(s => s.transportProfiles);
  const { routeData } = useMapboxRoute();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!activeItinerary) return null;

  // Calculate cascade stop times
  const stopTimes = (() => {
    const parseTime = (t: string | undefined): number => {
      if (!t) return 9 * 60; // default 09:00
      const [h, m] = t.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const fmt = (mins: number): string => {
      const h = Math.floor(mins / 60) % 24;
      const m = mins % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };
    let cur = parseTime(activeItinerary.startAnchor?.time);
    return (activeItinerary.waypoints || []).map((wp, i) => {
      const travelMins = routeData?.legs?.[i] ? Math.round(routeData.legs[i].duration / 60) : 0;
      cur += travelMins;
      const arrival = fmt(cur);
      cur += wp.durationMins || 60;
      return arrival;
    });
  })();

  const waypoints = activeItinerary.waypoints || [];

  return (
    <div className="space-y-0 w-full relative">
      {/* Start Anchor */}
      {activeItinerary.startAnchor && (
        <div className="relative">
          <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm z-10 relative">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-inner">
              <Navigation className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">{isEs ? "Punto de Partida" : "Start Point"}</p>
              <p className="text-sm font-semibold text-slate-900 truncate">{activeItinerary.startAnchor.title || "Current Location"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Waypoints */}
      {waypoints.map((waypoint, idx) => (
        <div key={`${waypoint.id}-${idx}`} className="relative">
          <TransitEdge index={idx} routeData={routeData} transportProfile={transportProfiles[idx] || 'driving'} />
          
          <div
            className={`flex flex-col p-4 rounded-2xl border-l-4 border mb-2 border-l-[var(--step-color)] transition-all ${selectedId === waypoint.id ? 'bg-white shadow-lg ring-1 ring-[var(--step-color)] scale-[1.01]' : 'bg-white shadow-sm border-slate-200/60 hover:shadow-md'}`}
            style={{ '--step-color': getCategoryColor(waypoint.category) } as React.CSSProperties}
          >
            <div className="flex gap-3 items-start cursor-pointer select-none" onClick={() => setSelectedId(selectedId === waypoint.id ? null : waypoint.id)}>
              <div
                className="w-10 h-10 rounded-full text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md"
                style={{ backgroundColor: getCategoryColor(waypoint.category) }}
              >
                {idx + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-[10px] font-bold tracking-widest text-rose-500 uppercase">{waypoint.category}</p>
                  <div className="flex items-center gap-1.5">
                    {stopTimes[idx] && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-full">
                        ⏱ {stopTimes[idx]}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{isEs && (waypoint.service as Business)?.nameEs ? (waypoint.service as Business).nameEs : waypoint.title}</p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {waypoint.locationStr}</p>
              </div>

              <div className="shrink-0 flex items-center justify-center text-slate-400 h-10 w-8">
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${selectedId === waypoint.id ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Expandable Section */}
            <div className={`grid transition-all duration-300 ease-in-out ${selectedId === waypoint.id ? "grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t border-gray-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                {(waypoint.service as Business | null) ? (
                  <BusinessCard business={(waypoint.service as Business)} orientation="vertical" showItineraryAdd={false} showItineraryEnd={false} />
                ) : (
                  <p className="text-sm text-slate-500 italic px-2">Description not available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* End Anchor */}
      {activeItinerary.endAnchor && (
        <div className="relative">
          <TransitEdge index={waypoints.length} routeData={routeData} transportProfile={transportProfiles[waypoints.length] || 'driving'} />
          <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm z-10 relative border-l-4 border-l-rose-600">
            <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-inner">
              <Bed className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-[10px] font-bold tracking-widest text-rose-500 uppercase mb-1">{isEs ? "Punto Final" : "End Point"}</p>
              <p className="text-sm font-semibold text-slate-900 truncate">{activeItinerary.endAnchor.title || "Destination"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}