"use client";

import { useMemo } from "react";
import { useItineraryStore } from "@/lib/store/use-itinerary-store";
import { useMapboxRoute } from "@/features/discovery/hooks/use-mapbox-route";
import { BusinessCard } from "@/features/discovery/components/business-card";
import { getCategoryColor } from "@/lib/utils/category-style";
import { Navigation, Clock, Bed } from "lucide-react";
import type { Business } from "@prisma/client";

export function ItineraryTimelineDisplay({ isEs }: { isEs: boolean }) {
  const activeItinerary = useItineraryStore(s => s.activeItinerary);
  const { routeData } = useMapboxRoute();

  // Calculate cascade stop times
  const stopTimes = useMemo(() => {
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
    let cur = parseTime(activeItinerary?.startAnchor?.time);
    const times: string[] = [];
    (activeItinerary?.waypoints || []).forEach((wp, i) => {
      const travelMins = routeData?.legs?.[i] ? Math.round(routeData.legs[i].duration / 60) : 0;
      cur += travelMins;
      times.push(fmt(cur));
      cur += wp.durationMins || 60;
    });
    return times;
  }, [activeItinerary, routeData]);

  if (!activeItinerary) return null;

  const waypoints = activeItinerary.waypoints || [];

  return (
    <div className="relative w-full max-w-5xl mx-auto py-12">
      {/* Central Spine */}
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-slate-200 -translate-x-px" />

      {/* Start Anchor */}
      {activeItinerary.startAnchor && (
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-center mb-16 md:mb-24 group">
          <div className="absolute left-8 md:left-1/2 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center -translate-x-1/2 shadow-lg z-10 border-4 border-white">
            <Navigation className="w-5 h-5" />
          </div>
          <div className="ml-20 md:ml-0 md:w-1/2 md:pr-16 text-left md:text-right pt-2 md:pt-0">
            <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">{isEs ? "Punto de Partida" : "Start Point"}</p>
            <h3 className="text-2xl font-serif font-bold text-slate-900">{activeItinerary.startAnchor.title || "Current Location"}</h3>
          </div>
          <div className="hidden md:block md:w-1/2 md:pl-16" />
        </div>
      )}

      {/* Waypoints */}
      {waypoints.map((waypoint, idx) => {
        const isEven = idx % 2 === 0; // Even idx -> Left side on desktop, Odd -> Right side
        const leg = routeData?.legs?.[idx];
        const durationMin = leg ? Math.round(leg.duration / 60) : 0;
        const stopColor = getCategoryColor(waypoint.category);

        return (
          <div key={`${waypoint.id}-${idx}`} className="relative mb-16 md:mb-24">
            
            {/* Travel Time Pill (Rendered above the node) */}
            {durationMin > 0 && (
              <div className="absolute left-8 md:left-1/2 -top-10 md:-top-12 -translate-x-1/2 z-10 bg-white border border-slate-200 shadow-sm rounded-full px-3 py-1 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{durationMin} min</span>
              </div>
            )}

            <div className={`relative flex flex-col md:flex-row items-start md:items-center w-full ${isEven ? 'md:flex-row-reverse' : ''}`}>
              
              {/* Central Node */}
              <div 
                className="absolute left-8 md:left-1/2 w-14 h-14 rounded-full flex items-center justify-center -translate-x-1/2 shadow-lg z-10 border-4 border-white text-white font-serif text-xl font-bold"
                style={{ backgroundColor: stopColor }}
              >
                {idx + 1}
              </div>

              {/* Card Container - OPEN STORYBOOK */}
              <div className={`ml-20 md:ml-0 md:w-1/2 pt-2 md:pt-0 ${isEven ? 'md:pl-16' : 'md:pr-16'}`}>
                <div className="relative">
                  {stopTimes[idx] && (
                    <div className={`absolute -top-4 ${isEven ? 'left-4' : 'right-4'} z-20`}>
                      <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 shadow-md px-3 py-1.5 rounded-full">
                        ⏱ {stopTimes[idx]}
                      </span>
                    </div>
                  )}
                  <div 
                    className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
                    style={{ '--tw-ring-color': stopColor } as React.CSSProperties}
                  >
                    {(waypoint.service as Business | null) ? (
                      <BusinessCard 
                        business={(waypoint.service as Business)} 
                        orientation="vertical" 
                        showItineraryAdd={false} 
                        showItineraryEnd={false} 
                        showActions={true}
                      />
                    ) : (
                      <div className="p-8">
                        <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: stopColor }}>
                          {waypoint.category}
                        </p>
                        <h4 className="font-serif text-2xl font-bold text-slate-900 leading-tight mb-2">
                          {waypoint.title}
                        </h4>
                        <p className="text-sm text-slate-500 italic">Description not available.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Empty Space for the other side */}
              <div className="hidden md:block md:w-1/2" />
            </div>
          </div>
        );
      })}

      {/* End Anchor */}
      {activeItinerary.endAnchor && (
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-center mt-16 md:mt-24 group">
           {/* Final Travel Time Pill */}
           {(() => {
              const lastLeg = routeData?.legs?.[waypoints.length];
              const durationMin = lastLeg ? Math.round(lastLeg.duration / 60) : 0;
              if (durationMin > 0) {
                return (
                  <div className="absolute left-8 md:left-1/2 -top-10 md:-top-12 -translate-x-1/2 z-10 bg-white border border-slate-200 shadow-sm rounded-full px-3 py-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{durationMin} min</span>
                  </div>
                )
              }
              return null;
           })()}

          <div className="absolute left-8 md:left-1/2 w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center -translate-x-1/2 shadow-lg z-10 border-4 border-white">
            <Bed className="w-5 h-5" />
          </div>
          <div className="ml-20 md:ml-0 md:w-1/2 md:pr-16 text-left md:text-right pt-2 md:pt-0">
            <p className="text-xs font-bold tracking-widest text-rose-500 uppercase mb-2">{isEs ? "Punto Final" : "End Point"}</p>
            <h3 className="text-2xl font-serif font-bold text-slate-900">{activeItinerary.endAnchor.title || "Destination"}</h3>
          </div>
          <div className="hidden md:block md:w-1/2 md:pl-16" />
        </div>
      )}
    </div>
  );
}
