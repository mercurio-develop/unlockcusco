"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useItineraryStore } from "@/lib/store/use-itinerary-store";
import { useMapboxRoute } from "@/features/discovery/hooks/use-mapbox-route";
import { useMapUiStore } from "@/lib/store/use-map-ui-store";
import { usePanelStore } from "@/lib/store/use-panel-store";
import { BusinessCard } from "@/features/discovery/components/business-card";
import { getCategoryColor } from "@/lib/utils/category-style";
import { explorePath, parseLocale } from "@/paths";
import { Navigation, Clock, Bed } from "lucide-react";
import type { Business } from "@prisma/client";
import { StopDrawer } from "./stop-drawer";

interface SelectedStopState {
  business?: Business | null;
  title?: string;
  category?: string;
  description?: string;
  lat?: number;
  lng?: number;
  stopNumber?: number;
}

export function ItineraryTimelineDisplay({ isEs }: { isEs: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = parseLocale(pathname?.split('/')[1]);

  const activeItinerary = useItineraryStore(s => s.activeTab === 'primary' ? s.activeItinerary : s.secondaryItinerary);
  const { routeData } = useMapboxRoute();

  const [selectedStop, setSelectedStop] = useState<SelectedStopState | null>(null);

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

  const handleSearchNearby = (category: string) => {
    const activeLat = selectedStop?.business?.lat ?? selectedStop?.lat;
    const activeLng = selectedStop?.business?.lng ?? selectedStop?.lng;
    const activeTitle = selectedStop?.business?.name ?? selectedStop?.title;

    if (!activeLat || !activeLng) return;

    useMapUiStore.getState().setRadarState({
      waypointId: 'itin-anchor',
      lat: activeLat,
      lng: activeLng,
      name: activeTitle || 'Location',
      category: category === 'dining' ? 'Dining' : category === 'stays' ? 'Stays' : 'Culture'
    });
    usePanelStore.getState().setPanelMode('discover');
    useMapUiStore.getState().setMobileViewMode('map');

    setSelectedStop(null);
    router.push(explorePath(locale));
  };

  const handleShowOnMap = () => {
    const activeLat = selectedStop?.business?.lat ?? selectedStop?.lat;
    const activeLng = selectedStop?.business?.lng ?? selectedStop?.lng;
    const activeSlug = selectedStop?.business?.locationSlug || '';
    const activeId = selectedStop?.business?.id || '';

    if (!activeLat || !activeLng) return;

    setSelectedStop(null);
    router.push(explorePath(locale, {
      loc: activeSlug,
      lat: activeLat,
      lng: activeLng,
      id: activeId,
    }));
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto py-12">
      {/* Central Spine */}
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-slate-200 -translate-x-px" />

      {/* Start Anchor */}
      {activeItinerary.startAnchor && (
        <div 
          onClick={() => {
            if (activeItinerary.startAnchor?.service) {
              setSelectedStop({
                business: activeItinerary.startAnchor.service as Business,
                lat: activeItinerary.startAnchor.lat ?? undefined,
                lng: activeItinerary.startAnchor.lng ?? undefined,
                title: activeItinerary.startAnchor.title
              });
            }
          }}
          className={`relative flex flex-col md:flex-row items-start md:items-center justify-center mb-16 md:mb-24 group ${
            activeItinerary.startAnchor.service ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
          }`}
        >
          <div className="absolute left-8 md:left-1/2 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center -translate-x-1/2 shadow-lg z-10 border-4 border-white transition-transform group-hover:scale-105">
            <Navigation className="w-5 h-5" />
          </div>
          <div className="ml-20 md:ml-0 md:w-1/2 md:pr-16 text-left md:text-right pt-2 md:pt-0">
            <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">{isEs ? "Punto de Partida" : "Start Point"}</p>
            <h3 className="text-2xl font-serif font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
              {activeItinerary.startAnchor.title || "Current Location"}
            </h3>
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
                className="absolute left-8 md:left-1/2 w-14 h-14 rounded-full flex items-center justify-center -translate-x-1/2 shadow-lg z-10 border-4 border-white text-white font-serif text-xl font-bold cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                style={{ backgroundColor: stopColor }}
                onClick={() => {
                  if (waypoint.service) {
                    setSelectedStop({
                      business: waypoint.service as Business,
                      stopNumber: idx + 1
                    });
                  } else {
                    setSelectedStop({
                      title: waypoint.title,
                      category: waypoint.category,
                      description: "Description not available.",
                      lat: waypoint.lat ?? undefined,
                      lng: waypoint.lng ?? undefined,
                      stopNumber: idx + 1
                    });
                  }
                }}
              >
                {idx + 1}
              </div>

              {/* Card Container */}
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
                        showActions={false}
                        simple={true}
                        onSelect={() => setSelectedStop({
                          business: waypoint.service as Business,
                          stopNumber: idx + 1
                        })}
                      />
                    ) : (
                      <div 
                        className="p-8 cursor-pointer hover:bg-slate-50/50 transition-colors"
                        onClick={() => setSelectedStop({
                          title: waypoint.title,
                          category: waypoint.category,
                          description: "Description not available.",
                          lat: waypoint.lat ?? undefined,
                          lng: waypoint.lng ?? undefined,
                          stopNumber: idx + 1
                        })}
                      >
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
        <div 
          onClick={() => {
            if (activeItinerary.endAnchor?.service) {
              setSelectedStop({
                business: activeItinerary.endAnchor.service as Business,
                lat: activeItinerary.endAnchor.lat ?? undefined,
                lng: activeItinerary.endAnchor.lng ?? undefined,
                title: activeItinerary.endAnchor.title
              });
            }
          }}
          className={`relative flex flex-col md:flex-row items-start md:items-center justify-center mt-16 md:mt-24 group ${
            activeItinerary.endAnchor.service ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
          }`}
        >
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

          <div className="absolute left-8 md:left-1/2 w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center -translate-x-1/2 shadow-lg z-10 border-4 border-white transition-transform group-hover:scale-105">
            <Bed className="w-5 h-5" />
          </div>
          <div className="ml-20 md:ml-0 md:w-1/2 md:pr-16 text-left md:text-right pt-2 md:pt-0">
            <p className="text-xs font-bold tracking-widest text-rose-500 uppercase mb-2">{isEs ? "Punto Final" : "End Point"}</p>
            <h3 className="text-2xl font-serif font-bold text-slate-900 group-hover:text-rose-600 transition-colors animate-pulse-once">
              {activeItinerary.endAnchor.title || "Destination"}
            </h3>
          </div>
          <div className="hidden md:block md:w-1/2 md:pl-16" />
        </div>
      )}

      {/* Vault Drawer for stop details */}
      {selectedStop && (
        <StopDrawer
          isOpen={!!selectedStop}
          onClose={() => setSelectedStop(null)}
          isEs={isEs}
          business={selectedStop.business}
          title={selectedStop.title}
          category={selectedStop.category}
          description={selectedStop.description}
          lat={selectedStop.lat}
          lng={selectedStop.lng}
          stopNumber={selectedStop.stopNumber}
          onSearchNearby={handleSearchNearby}
          onShowOnMap={handleShowOnMap}
        />
      )}
    </div>
  );
}

