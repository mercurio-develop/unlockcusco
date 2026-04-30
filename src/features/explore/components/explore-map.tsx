"use client"

import { useEffect, useRef, useMemo, useState } from "react"
import Map, { Marker, Popup, Source, Layer, NavigationControl, GeolocateControl } from "react-map-gl/mapbox"
import type { MapRef } from "react-map-gl/mapbox"
import 'mapbox-gl/dist/mapbox-gl.css'
import { Star, Zap, Layers, Navigation, Utensils, Sprout, Mountain as MountainIcon, Bed, Landmark, Ticket, MapPin } from "lucide-react"
import type { Business } from "@prisma/client"
import { useItinerary } from "@/lib/store/itinerary-context"

const CATEGORY_STYLE: Record<string, { bg: string; icon: any }> = {
  Dining:    { bg: "#FF9500", icon: Utensils }, // Apple Orange
  Wellness:  { bg: "#34C759", icon: Sprout },   // Apple Green
  Adventure: { bg: "#5856D6", icon: MountainIcon }, // Apple Indigo
  Stays:     { bg: "#007AFF", icon: Bed },      // Apple Blue
  Culture:   { bg: "#AF52DE", icon: Landmark }, // Apple Purple
  Boleto:    { bg: "#FF2D55", icon: Ticket },   // Apple Red
}

interface ExploreMapProps {
  businesses: Business[]
  selectedId: string | null
  onSelectBusiness: (id: string) => void
}

export default function ExploreMap({ businesses, selectedId, onSelectBusiness }: ExploreMapProps) {
  const mapRef = useRef<MapRef>(null)
  const [popupBusiness, setPopupBusiness] = useState<Business | null>(null)
  const [mapMode, setMapMode] = useState<"satellite" | "planning">("planning")
  const { activeItinerary, panelMode } = useItinerary()

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  const mapStyle = mapMode === "satellite" 
    ? "mapbox://styles/mapbox/satellite-streets-v12"
    : "mapbox://styles/mapbox/light-v11"

  // Build route GeoJSON from itinerary waypoints
  const [itineraryRoute, setItineraryRoute] = useState<GeoJSON.Feature<GeoJSON.LineString> | null>(null);
  const [directRoute, setDirectRoute] = useState<GeoJSON.Feature<GeoJSON.LineString> | null>(null);

  const waypoints = useMemo(() => {
    if (panelMode !== "itinerary" || !activeItinerary) return [];
    const pts: [number, number][] = [];
    if (activeItinerary.startAnchor?.lat && activeItinerary.startAnchor?.lng) pts.push([activeItinerary.startAnchor.lng, activeItinerary.startAnchor.lat]);
    for (const waypoint of activeItinerary.waypoints || []) {
      if (waypoint.lat && waypoint.lng) pts.push([waypoint.lng, waypoint.lat]);
    }
    if (activeItinerary.endAnchor?.lat && activeItinerary.endAnchor?.lng) pts.push([activeItinerary.endAnchor.lng, activeItinerary.endAnchor.lat]);
    return pts;
  }, [activeItinerary, panelMode]);

  const directWaypoints = useMemo(() => {
    if (panelMode !== "itinerary" || !activeItinerary) return [];
    const pts: [number, number][] = [];
    if (activeItinerary.startAnchor?.lat && activeItinerary.startAnchor?.lng) pts.push([activeItinerary.startAnchor.lng, activeItinerary.startAnchor.lat]);
    if (activeItinerary.endAnchor?.lat && activeItinerary.endAnchor?.lng) pts.push([activeItinerary.endAnchor.lng, activeItinerary.endAnchor.lat]);
    return pts;
  }, [activeItinerary, panelMode]);

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
    
    if (selectedId === 'itin-start' && activeItinerary?.startAnchor?.lat && activeItinerary?.startAnchor?.lng) {
      mapRef.current?.flyTo({ center: [activeItinerary.startAnchor.lng as number, activeItinerary.startAnchor.lat as number], zoom: 15, pitch, duration: 1200, essential: true });
      setPopupBusiness(null);
      return;
    }

    if (selectedId === 'itin-arrival' && activeItinerary?.endAnchor?.lat && activeItinerary?.endAnchor?.lng) {
      mapRef.current?.flyTo({ center: [activeItinerary.endAnchor.lng as number, activeItinerary.endAnchor.lat as number], zoom: 15, pitch, duration: 1200, essential: true });
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

  // Fit bounds to route or businesses
  useEffect(() => {
    if (!mapRef.current) return;

    if (itineraryRoute) {
      const coords = itineraryRoute.geometry.coordinates;
      let [minLng, minLat] = coords[0];
      let [maxLng, maxLat] = coords[0];
      for (const [lng, lat] of coords) {
        if (lng < minLng) minLng = lng; if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
      }
      if (minLng === maxLng) { minLng -= 0.01; maxLng += 0.01; }
      if (minLat === maxLat) { minLat -= 0.01; maxLat += 0.01; }
      mapRef.current.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 100, duration: 1500, pitch: 0 });
      return;
    }

    const validBusinesses = businesses.filter(b => b.lat !== null && b.lng !== null) as (Business & { lat: number, lng: number })[];

    if (validBusinesses.length > 0) {
      let minLng = validBusinesses[0].lng, maxLng = validBusinesses[0].lng;
      let minLat = validBusinesses[0].lat, maxLat = validBusinesses[0].lat;
      for (const b of validBusinesses) {
        if (b.lng < minLng) minLng = b.lng; if (b.lng > maxLng) maxLng = b.lng;
        if (b.lat < minLat) minLat = b.lat; if (b.lat > maxLat) maxLat = b.lat;
      }
      if (minLng === maxLng) { minLng -= 0.01; maxLng += 0.01; }
      if (minLat === maxLat) { minLat -= 0.01; maxLat += 0.01; }
      mapRef.current.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 80, duration: 1000, pitch: 0 });
    }
  }, [businesses, itineraryRoute]);

  if (!mapboxToken) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#0F172A] text-white/40 p-6 text-center">
        <p className="font-medium">Map token missing.</p>
        <p className="text-sm mt-1">Set NEXT_PUBLIC_MAPBOX_TOKEN in .env</p>
      </div>
    );
  }

  const validBusinesses = businesses.filter(b => b.lat !== null && b.lng !== null) as (Business & { lat: number, lng: number })[];

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
        {directRoute && (
          <Source id="direct-route" type="geojson" data={directRoute}>
            <Layer id="direct-route-glow" type="line" layout={{ "line-join": "round", "line-cap": "round" }}
              paint={{ "line-color": "#ffffff", "line-width": 12, "line-opacity": 0.3, "line-blur": 6 }} />
            <Layer id="direct-route-line" type="line" layout={{ "line-join": "round", "line-cap": "round" }}
              paint={{ "line-color": "#007AFF", "line-width": 4, "line-opacity": 0.95 }} />
          </Source>
        )}

        {/* Alternative Detour route line */}
        {itineraryRoute && (
          <Source id="itinerary-route" type="geojson" data={itineraryRoute}>
            <Layer id="route-line" type="line" layout={{ "line-join": "round", "line-cap": "round" }}
              paint={{ "line-color": "#34C759", "line-width": 4, "line-opacity": 0.8,
                "line-dasharray": [2, 2] }} />
          </Source>
        )}

        {/* Start Marker */}
        {(() => {
          const start = (activeItinerary as any)?.startAnchor || (activeItinerary as any)?.origin;
          if (!start?.lat || !start?.lng) return null;
          return (
            <Marker longitude={start.lng} latitude={start.lat} anchor="bottom">
              <div className="cursor-pointer group/start flex flex-col items-center" onClick={e => {
                e.stopPropagation();
                mapRef.current?.flyTo({ center: [start.lng as number, start.lat as number], zoom: 14, pitch: 0, duration: 1200, essential: true });
              }}>
                <div className="relative flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-white shadow-xl flex items-center justify-center text-[10px] font-bold text-white z-10 transition-transform group-hover/start:scale-110">
                    {start.type === 'AIRPORT' ? 'CUZ' : 'START'}
                  </div>
                  <div className="w-1.5 h-3 bg-slate-900 -mt-0.5 z-0 rounded-full" />
                </div>
              </div>
            </Marker>
          );
        })()}

        {/* Arrival Marker */}
        {(() => {
          const end = (activeItinerary as any)?.endAnchor || (activeItinerary as any)?.destination;
          if (!end?.lat || !end?.lng) return null;
          return (
            <Marker longitude={end.lng} latitude={end.lat} anchor="bottom">
              <div className="cursor-pointer group/start flex flex-col items-center" onClick={e => {
                e.stopPropagation();
                mapRef.current?.flyTo({ center: [end.lng as number, end.lat as number], zoom: 14, pitch: 0, duration: 1200, essential: true });
              }}>
                <div className="relative flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-[10px] font-bold text-white z-10 transition-transform group-hover/end:scale-110">
                    {end.type === 'HOTEL' ? 'BED' : 'END'}
                  </div>
                  <div className="w-1.5 h-3 bg-rose-600 -mt-0.5 z-0 rounded-full" />
                </div>
              </div>
            </Marker>
          );
        })()}

        {/* Itinerary waypoint markers */}
        {itineraryMarkers.map(({ pick, idx }) => {
          const style = CATEGORY_STYLE[pick.category] ?? { bg: "#8E8E93", icon: MapPin };
          const isSelected = selectedId === pick.id;
          const Icon = style.icon;

          return (
            <Marker key={`itin-${idx}`} longitude={pick.lng as number} latitude={pick.lat as number} anchor="bottom"
              onClick={e => { e.originalEvent.stopPropagation(); setPopupBusiness(pick as any); onSelectBusiness(pick.id); }}
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
          const style = CATEGORY_STYLE[business.category] ?? { bg: "#8E8E93", icon: MapPin };
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
                className="cursor-pointer transition-all duration-300 relative flex flex-col items-center"
                style={{ transform: isSelected ? "scale(1.25)" : "scale(1)", zIndex: isSelected ? 50 : 1 }}
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

        {popupBusiness && popupBusiness.lng !== null && popupBusiness.lat !== null && (
          <Popup
            anchor="bottom" longitude={popupBusiness.lng} latitude={popupBusiness.lat}
            onClose={() => setPopupBusiness(null)} maxWidth="260px"
            closeButton={false} closeOnClick={false} className="z-50" offset={32}
          >
            <div className="px-4 py-3 rounded-2xl bg-white/95 border border-white/20 text-slate-900 shadow-[0_15px_40px_rgba(0,0,0,0.15)] backdrop-blur-md" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-[13px] tracking-tight truncate">{popupBusiness.name || (popupBusiness as any).title}</h3>
                  {popupBusiness.isClaimed && <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />}
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                  <span>{popupBusiness.category}</span>
                  {popupBusiness.rating !== null && popupBusiness.rating !== undefined && (
                    <span className="flex items-center gap-0.5 text-slate-900">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {popupBusiness.rating}
                    </span>
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
