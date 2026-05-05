"use client"

import { useEffect, useRef, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Map, { Marker, Popup, Source, Layer, NavigationControl, GeolocateControl } from "react-map-gl/mapbox"
import type { MapRef } from "react-map-gl/mapbox"
import 'mapbox-gl/dist/mapbox-gl.css'
import { Star, Zap, Layers, Navigation, Utensils, Sprout, Mountain as MountainIcon, Bed, Landmark, Ticket, MapPin, Plane, Car, Clipboard } from "lucide-react"
import type { Business } from "@prisma/client"
import { useItinerary } from "@/lib/store/itinerary-context"
import { cn } from "@/lib/utils"

const getCategoryStyle = (category: string | undefined | null) => {
  if (!category) return { bg: "#8E8E93", icon: MapPin };
  
  const cat = category.toUpperCase();
  switch (cat) {
    case 'DINING':
    case 'MEAL':
      return { bg: "#FF9500", icon: Utensils }; // Apple Orange
    case 'WELLNESS':
    case 'BIENESTAR':
      return { bg: "#34C759", icon: Sprout };   // Apple Green
    case 'ADVENTURE':
    case 'AVENTURA':
      return { bg: "#5856D6", icon: MountainIcon }; // Apple Indigo
    case 'STAYS':
    case 'STAY':
    case 'DESCANSO':
    case 'LODGING':
      return { bg: "#007AFF", icon: Bed };      // Apple Blue
    case 'CULTURE':
    case 'CULTURA':
      return { bg: "#AF52DE", icon: Landmark }; // Apple Purple
    case 'BOLETO':
      return { bg: "#FF2D55", icon: Ticket };   // Apple Red
    case 'TRANSPORT':
    case 'TAXI':
      return { bg: "#5AC8FA", icon: Car };      // Apple Light Blue
    case 'AGENCY':
    case 'EXPERIENCE':
      return { bg: "#FFCC00", icon: Star };     // Apple Yellow
    case 'NOTE':
      return { bg: "#8E8E93", icon: Clipboard }; // Apple Gray
    default:
      return { bg: "#8E8E93", icon: MapPin };
  }
}

interface ExploreMapProps {
  businesses: Business[]
  selectedId: string | null
  onSelectBusiness: (id: string) => void
}

export default function ExploreMap({ businesses, selectedId, onSelectBusiness }: ExploreMapProps) {
  const mapRef = useRef<MapRef>(null)
  const router = useRouter()
  const [popupBusiness, setPopupBusiness] = useState<Business | (Partial<Business> & { title?: string, priceTier?: string, rating?: number, description?: string, menuUrl?: string }) | null>(null)
  const [mapMode, setMapMode] = useState<"satellite" | "planning">("planning")
  const { activeItinerary, panelMode, setStartAnchorLocation, setEndAnchorLocation, currentTrip, activeDayNumber, insertWaypoint } = useItinerary()

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  const mapStyle = mapMode === "satellite" 
    ? "mapbox://styles/mapbox/satellite-streets-v12"
    : "mapbox://styles/mapbox/light-v11"

  // Build route GeoJSON from itinerary waypoints
  const [itineraryRoute, setItineraryRoute] = useState<GeoJSON.Feature<GeoJSON.LineString> | null>(null);
  const [directRoute, setDirectRoute] = useState<GeoJSON.Feature<GeoJSON.LineString> | null>(null);

  // Multi-day routes for Pro Builder
  const [multiDayRoutes, setMultiDayRoutes] = useState<{[dayNumber: number]: GeoJSON.Feature<GeoJSON.LineString>}>({});

  const completedDays = useMemo(() => {
    if (panelMode !== "builder" || !currentTrip) return [];
    const daysToRender = currentTrip.days.filter(d => d.isComplete || d.dayNumber === activeDayNumber);
    return daysToRender.map(d => {
      const pts: [number, number][] = [];
      if (d.startAnchor?.lat && d.startAnchor?.lng) pts.push([d.startAnchor.lng, d.startAnchor.lat]);
      for (const evt of d.events || []) {
        if (evt.type === 'TRANSPORT') {
          if ((evt as any).fromLat && (evt as any).fromLng) pts.push([(evt as any).fromLng, (evt as any).fromLat]);
          if ((evt as any).toLat && (evt as any).toLng) pts.push([(evt as any).toLng, (evt as any).toLat]);
        } else {
           if (evt.lat && evt.lng) pts.push([evt.lng, evt.lat]);
        }
      }
      if (d.endAnchor?.lat && d.endAnchor?.lng) pts.push([d.endAnchor.lng, d.endAnchor.lat]);
      return { dayNumber: d.dayNumber, isComplete: !!d.isComplete, isActive: d.dayNumber === activeDayNumber, waypoints: pts };
    });
  }, [currentTrip, activeDayNumber, panelMode]);

  useEffect(() => {
    if (!mapboxToken || completedDays.length === 0) return;
    
    completedDays.forEach(day => {
      if (day.waypoints.length < 2) return;
      const coordsStr = day.waypoints.map(c => `${c[0]},${c[1]}`).join(';');
      if (day.waypoints.length <= 25) {
        fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordsStr}?geometries=geojson&overview=full&access_token=${mapboxToken}`)
          .then(res => res.json())
          .then(data => {
            if (data.routes && data.routes.length > 0) {
              setMultiDayRoutes(prev => ({
                ...prev,
                [day.dayNumber]: {
                  type: 'Feature',
                  properties: { dayNumber: day.dayNumber, isActive: day.isActive, isComplete: day.isComplete },
                  geometry: data.routes[0].geometry,
                }
              }));
            }
          })
          .catch(console.error);
      }
    });
  }, [completedDays, mapboxToken]);

  const waypoints = useMemo(() => {
    if (panelMode !== "itinerary" && panelMode !== "builder") return [];
    
    const pts: [number, number][] = [];
    
    if (panelMode === "itinerary" && activeItinerary) {
      const start = activeItinerary.startAnchor;
      const end = activeItinerary.endAnchor;
      if (start?.lat && start?.lng) pts.push([start.lng, start.lat]);
      for (const waypoint of activeItinerary.waypoints || []) {
        if (waypoint.lat && waypoint.lng) pts.push([waypoint.lng, waypoint.lat]);
      }
      if (end?.lat && end?.lng) pts.push([end.lng, end.lat]);
    } else if (panelMode === "builder" && currentTrip && activeDayNumber) {
      const activeDay = currentTrip.days.find(d => d.dayNumber === activeDayNumber);
      if (activeDay) {
        const start = activeDay.startAnchor;
        const end = activeDay.endAnchor;
        if (start?.lat && start?.lng) pts.push([start.lng, start.lat]);
        for (const evt of activeDay.events || []) {
          if (evt.type === 'TRANSPORT') {
            if ((evt as any).fromLat && (evt as any).fromLng) pts.push([(evt as any).fromLng, (evt as any).fromLat]);
            if ((evt as any).toLat && (evt as any).toLng) pts.push([(evt as any).toLng, (evt as any).toLat]);
          } else {
             if (evt.lat && evt.lng) pts.push([evt.lng, evt.lat]);
          }
        }
        if (end?.lat && end?.lng) pts.push([end.lng, end.lat]);
      }
    }
    return pts;
  }, [activeItinerary, currentTrip, activeDayNumber, panelMode]);

  const directWaypoints = useMemo(() => {
    if (panelMode !== "itinerary" && panelMode !== "builder") return [];
    const pts: [number, number][] = [];
    
    if (panelMode === "itinerary" && activeItinerary) {
      const start = activeItinerary.startAnchor;
      const end = activeItinerary.endAnchor;
      if (start?.lat && start?.lng) pts.push([start.lng, start.lat]);
      if (end?.lat && end?.lng) pts.push([end.lng, end.lat]);
    } else if (panelMode === "builder" && currentTrip && activeDayNumber) {
      const activeDay = currentTrip.days.find(d => d.dayNumber === activeDayNumber);
      if (activeDay) {
        const start = activeDay.startAnchor;
        const end = activeDay.endAnchor;
        if (start?.lat && start?.lng) pts.push([start.lng, start.lat]);
        if (end?.lat && end?.lng) pts.push([end.lng, end.lat]);
      }
    }
    return pts;
  }, [activeItinerary, currentTrip, activeDayNumber, panelMode]);

  useEffect(() => {
    if (waypoints.length < 2 || !mapboxToken) {
      setItineraryRoute(null);
      setDirectRoute(null);
      return;
    }

    // Set initial straight-line fallback
    setItineraryRoute({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: waypoints },
    } as GeoJSON.Feature<GeoJSON.LineString>);
    
    setDirectRoute({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: directWaypoints },
    } as GeoJSON.Feature<GeoJSON.LineString>);

    // Fetch real route mapped to roads
    const coordsStr = waypoints.map(c => `${c[0]},${c[1]}`).join(';');
    if (waypoints.length <= 25) {
      fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordsStr}?geometries=geojson&overview=full&access_token=${mapboxToken}`)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            setItineraryRoute({
              type: 'Feature',
              properties: {},
              geometry: data.routes[0].geometry,
            } as GeoJSON.Feature<GeoJSON.LineString>);
          }
        })
        .catch(console.error);
    }
    
    const directCoordsStr = directWaypoints.map(c => `${c[0]},${c[1]}`).join(';');
    if (directWaypoints.length === 2) {
      fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${directCoordsStr}?geometries=geojson&overview=full&access_token=${mapboxToken}`)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            setDirectRoute({
              type: 'Feature',
              properties: {},
              geometry: data.routes[0].geometry,
            } as GeoJSON.Feature<GeoJSON.LineString>);
          }
        })
        .catch(console.error);
    }
  }, [waypoints, directWaypoints, mapboxToken]);

  // Itinerary waypoint markers
  const itineraryMarkers = useMemo(() => {
    if (panelMode !== "itinerary" || !activeItinerary) return [];
    return activeItinerary.waypoints
      .filter(w => w.lat && w.lng)
      .map((w, idx) => ({ pick: w, idx }));
  }, [activeItinerary, panelMode]);

  // Fly to selected business or itinerary point
  useEffect(() => {
    if (!selectedId) { setPopupBusiness(null); return; }

    const isItineraryId = selectedId === 'itin-start' || selectedId === 'itin-arrival';
    const pitch = isItineraryId ? 0 : (mapMode === "satellite" ? 60 : 0);
    
    const start = activeItinerary?.startAnchor;
    if (selectedId === 'itin-start' && start?.lat && start?.lng) {
      mapRef.current?.flyTo({ center: [start.lng as number, start.lat as number], zoom: 15, pitch, duration: 1200, essential: true });
      setPopupBusiness(null);
      return;
    }

    const end = activeItinerary?.endAnchor;
    if (selectedId === 'itin-arrival' && end?.lat && end?.lng) {
      mapRef.current?.flyTo({ center: [end.lng as number, end.lat as number], zoom: 15, pitch, duration: 1200, essential: true });
      setPopupBusiness(null);
      return;
    }

    let targetLat: number | null = null;
    let targetLng: number | null = null;
    let targetBusiness: Business | null = null;

    const b = businesses.find(b => b.id === selectedId);
    if (b && b.lat !== null && b.lng !== null) {
      targetLat = b.lat;
      targetLng = b.lng;
      targetBusiness = b;
    } else if (activeItinerary) {
      // Check waypoints and their alternatives
      for (const wp of activeItinerary.waypoints) {
        if (wp.id === selectedId && wp.lat !== undefined && wp.lng !== undefined) {
          targetLat = wp.lat;
          targetLng = wp.lng;
          break;
        }
        if (wp.alternatives) {
          const alt = wp.alternatives.find(a => a.id === selectedId);
          if (alt && alt.lat !== undefined && alt.lng !== undefined) {
            targetLat = alt.lat;
            targetLng = alt.lng;
            break;
          }
        }
      }
    }

    if (targetLat !== null && targetLng !== null) {
      mapRef.current?.flyTo({ center: [targetLng, targetLat], zoom: 15, pitch: (mapMode === "satellite" ? 60 : 0), duration: 1200, essential: true });
      setPopupBusiness(targetBusiness);
    } else {
      setPopupBusiness(null);
    }
  }, [selectedId, businesses, activeItinerary, mapMode]);

  // Fit bounds to route ONLY when itineraryRoute is newly generated
  // Disabled as per MVP Crucible to preserve viewport unless explicitly routed
  useEffect(() => {
    // We keep this empty so we don't automatically recenter the map on tab change or route generation.
  }, []);

  if (!mapboxToken) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#0F172A] text-white/40 p-6 text-center">
        <p className="font-medium">Map token missing.</p>
        <p className="text-sm mt-1">Set NEXT_PUBLIC_MAPBOX_TOKEN in .env</p>
      </div>
    );
  }

  const validBusinesses = businesses.filter(b => b.lat != null && b.lng != null && !isNaN(b.lat) && !isNaN(b.lng)) as (Business & { lat: number, lng: number })[];

  const [firstBusinessId, setFirstBusinessId] = useState<string | null>(null);

  useEffect(() => {
    if (validBusinesses.length === 0 || !mapRef.current) return;
    
    const currentFirstId = validBusinesses[0].id;
    if (currentFirstId !== firstBusinessId) {
      setFirstBusinessId(currentFirstId);
      
      let minLng = validBusinesses[0].lng;
      let maxLng = validBusinesses[0].lng;
      let minLat = validBusinesses[0].lat;
      let maxLat = validBusinesses[0].lat;

      const boundsItems = validBusinesses.slice(0, 20);
      for (const b of boundsItems) {
        if (b.lng < minLng) minLng = b.lng;
        if (b.lng > maxLng) maxLng = b.lng;
        if (b.lat < minLat) minLat = b.lat;
        if (b.lat > maxLat) maxLat = b.lat;
      }

      if (minLng !== maxLng || minLat !== maxLat) {
        mapRef.current.fitBounds(
          [[minLng, minLat], [maxLng, maxLat]],
          { padding: 80, duration: 1200, maxZoom: 15 }
        );
      } else {
        mapRef.current.flyTo({
          center: [minLng, minLat],
          zoom: 14,
          duration: 1200
        });
      }
    }
  }, [validBusinesses, firstBusinessId]);

  const center = validBusinesses.length > 0
    ? [validBusinesses.reduce((s, b) => s + b.lng, 0) / validBusinesses.length, validBusinesses.reduce((s, b) => s + b.lat, 0) / validBusinesses.length]
    : [-72.1167, -13.3047];

  return (
    <div className="relative w-full h-full group">
      <Map
        ref={mapRef}
        initialViewState={{ longitude: center[0], latitude: center[1], zoom: 11, pitch: 0, bearing: 0 }}
        mapStyle={mapStyle}
        mapboxAccessToken={mapboxToken}
        style={{ width: "100%", height: "100%" }}
        terrain={mapMode === "satellite" ? { source: "mapbox-dem", exaggeration: 1.5 } : undefined}
        onClick={() => setPopupBusiness(null)}
      >
        <Source id="mapbox-dem" type="raster-dem" url="mapbox://mapbox.mapbox-terrain-dem-v1" tileSize={512} maxzoom={14} />
        {mapMode === "satellite" && <Layer id="sky" type="sky" paint={{ "sky-type": "atmosphere", "sky-atmosphere-sun": [0.0, 0.0], "sky-atmosphere-sun-intensity": 15 }} />}

        {/* Direct baseline route line (Main Route) */}
        {directRoute && panelMode === "itinerary" && (
          <Source id="direct-route" type="geojson" data={directRoute}>
            <Layer id="direct-route-glow" type="line" layout={{ "line-join": "round", "line-cap": "round" }}
              paint={{ "line-color": "#ffffff", "line-width": 12, "line-opacity": 0.3, "line-blur": 6 }} />
            <Layer id="direct-route-line" type="line" layout={{ "line-join": "round", "line-cap": "round" }}
              paint={{ "line-color": "#007AFF", "line-width": 4, "line-opacity": 0.95 }} />
          </Source>
        )}

        {/* Alternative Detour route line */}
        {itineraryRoute && panelMode === "itinerary" && (
          <Source id="itinerary-route" type="geojson" data={itineraryRoute}>
            <Layer id="route-line" type="line" layout={{ "line-join": "round", "line-cap": "round" }}
              paint={{ "line-color": "#34C759", "line-width": 4, "line-opacity": 0.8,
                "line-dasharray": [2, 2] }} />
          </Source>
        )}

        {/* Multi-day builder routes */}
        {panelMode === "builder" && Object.values(multiDayRoutes).map(route => {
          const isAct = route.properties?.isActive;
          const isComp = route.properties?.isComplete;
          const dayNum = route.properties?.dayNumber as number;
          const colors = ["#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6", "#f43f5e", "#ef4444"];
          const color = isAct ? "#0f172a" : colors[dayNum % colors.length];
          const opacity = isAct ? 0.8 : (isComp ? 0.5 : 0.2);
          
          return (
            <Source key={`route-${dayNum}`} id={`route-${dayNum}`} type="geojson" data={route}>
              <Layer id={`route-line-${dayNum}`} type="line" layout={{ "line-join": "round", "line-cap": "round" }}
                paint={{ "line-color": color, "line-width": isAct ? 4 : 3, "line-opacity": opacity, "line-dasharray": isAct ? [1, 2] : [1] }}
              />
            </Source>
          );
        })}

        {/* Start Marker */}
        {(() => {
          let start;
          if (panelMode === "itinerary" && activeItinerary) {
            start = activeItinerary.startAnchor;
          } else if (panelMode === "builder" && currentTrip && activeDayNumber) {
            const activeDay = currentTrip.days.find(d => d.dayNumber === activeDayNumber);
            start = activeDay?.startAnchor;
          }
          if (!start?.lat || !start?.lng) return null;
          return (
            <Marker 
              longitude={start.lng} 
              latitude={start.lat} 
              anchor="bottom"
              draggable={true}
              onDragEnd={(e) => {
                if (panelMode === "itinerary") {
                  setStartAnchorLocation(e.lngLat.lat, e.lngLat.lng, "Pinned Location");
                }
              }}
            >
              <div 
                className={`cursor-grab active:cursor-grabbing group/start flex flex-col items-center ${panelMode === "builder" ? "pointer-events-none" : ""}`} 
                title="Start location"
                onClick={e => {
                  e.stopPropagation();
                  mapRef.current?.flyTo({ center: [start.lng as number, start.lat as number], zoom: 14, pitch: 0, duration: 1200, essential: true });
                }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/20 blur-[3px] rounded-full" />
                <div className="relative flex flex-col items-center z-10 transition-transform group-hover/start:-translate-y-1">
                  <div className="bg-slate-900 text-white px-3 py-1.5 rounded-full shadow-xl border-[2.5px] border-white flex items-center gap-1.5">
                    {(start as any).type === 'AIRPORT' ? <Plane className="w-3.5 h-3.5" /> : <Navigation className="w-3.5 h-3.5" />}
                    <span className="text-[11px] font-bold tracking-wide">{(start as any).type === 'AIRPORT' ? 'CUZ' : 'START'}</span>
                  </div>
                  <div className="w-2.5 h-2.5 bg-slate-900 rotate-45 -mt-1.5 border-r-[2.5px] border-b-[2.5px] border-white" />
                </div>
              </div>
            </Marker>
          );
        })()}

        {/* Arrival Marker */}
        {(() => {
          let end;
          if (panelMode === "itinerary" && activeItinerary) {
            end = activeItinerary.endAnchor;
          } else if (panelMode === "builder" && currentTrip && activeDayNumber) {
            const activeDay = currentTrip.days.find(d => d.dayNumber === activeDayNumber);
            end = activeDay?.endAnchor;
          }
          if (!end?.lat || !end?.lng) return null;
          return (
            <Marker 
              longitude={end.lng} 
              latitude={end.lat} 
              anchor="bottom"
              draggable={true}
              onDragEnd={(e) => {
                if (panelMode === "itinerary") {
                  setEndAnchorLocation(e.lngLat.lat, e.lngLat.lng, "Pinned Location");
                }
              }}
            >
              <div 
                className={`cursor-grab active:cursor-grabbing group/start flex flex-col items-center ${panelMode === "builder" ? "pointer-events-none" : ""}`} 
                title="End location"
                onClick={e => {
                  e.stopPropagation();
                  mapRef.current?.flyTo({ center: [end.lng as number, end.lat as number], zoom: 14, pitch: 0, duration: 1200, essential: true });
                }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/20 blur-[3px] rounded-full" />
                <div className="relative flex flex-col items-center z-10 transition-transform group-hover/start:-translate-y-1">
                  <div className="bg-rose-600 text-white px-3 py-1.5 rounded-full shadow-xl border-[2.5px] border-white flex items-center gap-1.5">
                    {(end as any).type === 'HOTEL' ? <Bed className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                    <span className="text-[11px] font-bold tracking-wide">{(end as any).type === 'HOTEL' ? 'BED' : 'END'}</span>
                  </div>
                  <div className="w-2.5 h-2.5 bg-rose-600 rotate-45 -mt-1.5 border-r-[2.5px] border-b-[2.5px] border-white" />
                </div>
              </div>
            </Marker>
          );
        })()}

        {/* Itinerary waypoint markers */}
        {itineraryMarkers.map(({ pick, idx }) => {
          const style = getCategoryStyle(pick.category);
          const isSelected = selectedId === pick.id;
          const Icon = style.icon;

          return (
            <Marker key={`itin-${idx}`} longitude={pick.lng as number} latitude={pick.lat as number} anchor="bottom"
              onClick={e => { e.originalEvent.stopPropagation(); setPopupBusiness(pick); onSelectBusiness(pick.id); }}
            >
              <div
                className="cursor-pointer transition-all duration-300 relative flex flex-col items-center"
                style={{ transform: isSelected ? "scale(1.25)" : "scale(1)", zIndex: isSelected ? 50 : 10 }}
              >
                {/* Number Badge */}
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center border-2 border-white z-20 shadow-md">
                  {idx + 1}
                </div>

                {/* Apple-style shadow blob */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 blur-[2px] rounded-full" />

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md border-[2.5px] border-white transition-all ${isSelected ? "ring-[3px] ring-white/50" : ""}`}
                  style={{ backgroundColor: style.bg }}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                {/* Pointer tip */}
                <div className="w-1.5 h-1.5 -mt-1 rotate-45 border-r-[2.5px] border-b-[2.5px] border-white" style={{ backgroundColor: style.bg }} />
              </div>
            </Marker>
          )
        })}
        {/* Regular business markers — hidden in itinerary mode */}
        {panelMode !== "itinerary" && validBusinesses.map((business, index) => {
          const style = getCategoryStyle(business.category);
          const isSelected = selectedId === business.id;
          const Icon = style.icon;

          return (
            <Marker
              key={`${business.id}-${index}`}
              longitude={business.lng}
              latitude={business.lat}
              anchor="bottom"
              onClick={e => { e.originalEvent.stopPropagation(); setPopupBusiness(business); onSelectBusiness(business.id); }}
            >
              <div
                className={cn(
                  "cursor-pointer transition-all duration-300 relative flex flex-col items-center animate-in zoom-in fade-in slide-in-from-bottom-4",
                  isSelected ? "scale-125 z-50" : "scale-100 z-10"
                )}
                style={{ animationDuration: `${300 + (index % 10) * 50}ms` }}
              >
                {/* Apple-style shadow blob */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 blur-[2px] rounded-full" />
                
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md border-[2.5px] border-white transition-all ${isSelected ? "ring-[3px] ring-white/50" : ""}`}
                  style={{ backgroundColor: style.bg }}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                {/* Pointer tip */}
                <div className="w-1.5 h-1.5 -mt-1 rotate-45 border-r-[2.5px] border-b-[2.5px] border-white" style={{ backgroundColor: style.bg }} />
              </div>
            </Marker>
          );
        })}

        {popupBusiness && (popupBusiness as any).lng != null && (popupBusiness as any).lat != null && !isNaN((popupBusiness as any).lng) && !isNaN((popupBusiness as any).lat) && (
          <Popup
            anchor="bottom" longitude={(popupBusiness as any).lng as number} latitude={(popupBusiness as any).lat as number}
            onClose={() => setPopupBusiness(null)} maxWidth="280px"
            closeButton={false} closeOnClick={false} className="z-50" offset={32}
          >
            <div className="w-64 rounded-2xl bg-white/95 overflow-hidden border border-white/20 text-slate-900 shadow-[0_15px_40px_rgba(0,0,0,0.15)] backdrop-blur-md" onClick={e => e.stopPropagation()}>
              {(popupBusiness as any).imageUrl && (
                <div className="w-full h-24 bg-slate-100 relative">
                  <img src={(popupBusiness as any).imageUrl} alt={(popupBusiness as any).name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-3">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <h3 className="font-bold text-[14px] leading-tight tracking-tight truncate">{(popupBusiness as any).name || (popupBusiness as any).title}</h3>
                  {(popupBusiness as any).isClaimed && <Zap className="w-3.5 h-3.5 shrink-0 text-emerald-500 fill-emerald-500" />}
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-2">
                  <span>{(popupBusiness as any).category}</span>
                  <span className="text-slate-400 font-mono">{(popupBusiness as any).priceTier || '$$'}</span>
                </div>
                
                {((popupBusiness as any).rating || (popupBusiness as any).rating) && (
                  <div className="flex flex-col gap-1 mb-3">
                    <div className="flex items-center gap-1 text-slate-900 font-bold text-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {(popupBusiness as any).rating || (popupBusiness as any).rating}
                    </div>
                    {(popupBusiness as any).description && (
                      <p className="text-xs text-slate-600 italic leading-snug">"{(popupBusiness as any).description}"</p>
                    )}
                  </div>
                )}
                
                <div className="mt-2">
                  {(popupBusiness as any).menuUrl ? (
                    <a href={(popupBusiness as any).menuUrl} target="_blank" rel="noreferrer" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                      View Menu ↗
                    </a>
                  ) : (
                    <button onClick={() => {
                      insertWaypoint(popupBusiness as any)
                      setPopupBusiness(null)
                    }} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5">
                      + Add to Day
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Popup>
        )}

        <NavigationControl position="bottom-right" showCompass={false} />
        <GeolocateControl 
          position="bottom-right" 
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
          showUserHeading={true}
        />
      </Map>

      {/* Floating Style Switcher - Apple Style */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => setMapMode(mapMode === "satellite" ? "planning" : "satellite")}
          className="w-10 h-10 bg-white/90 backdrop-blur-md hover:bg-white text-slate-900 rounded-full shadow-lg border border-white/50 flex items-center justify-center transition-all active:scale-95"
          title={mapMode === "satellite" ? "Switch to Map" : "Switch to Satellite"}
        >
          {mapMode === "satellite" ? <Layers className="w-4 h-4" /> : <Navigation className="w-4 h-4 text-rose-600" />}
        </button>
      </div>

      <div className="absolute bottom-1 left-2 z-10 text-[9px] text-slate-400/40 pointer-events-none uppercase tracking-tighter">
        Vallecito OS × Apple Maps Style
      </div>
    </div>
  );
}
