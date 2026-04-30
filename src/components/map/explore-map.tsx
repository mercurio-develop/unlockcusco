"use client"

import { useEffect, useRef, useMemo } from "react"
import Map, { Marker, Popup, Source, Layer, NavigationControl } from "react-map-gl/mapbox"
import type { MapRef } from "react-map-gl/mapbox"
import 'mapbox-gl/dist/mapbox-gl.css'
import { useState } from "react"
import { Star, Zap } from "lucide-react"
import type { Business } from "@prisma/client"
import { useItinerary } from "@/lib/store/itinerary-context"

const CATEGORY_STYLE: Record<string, { bg: string; emoji: string }> = {
  Dining:    { bg: "#EA580C", emoji: "🍽️" },
  Wellness:  { bg: "#9333EA", emoji: "🧘" },
  Adventure: { bg: "#16A34A", emoji: "🥾" },
  Stays:     { bg: "#2563EB", emoji: "🛌" },
  Culture:   { bg: "#D97706", emoji: "🏺" },
  Boleto:    { bg: "#be185d", emoji: "🎫" },
}

interface ExploreMapProps {
  businesses: Business[]
  selectedId: string | null
  onSelectBusiness: (id: string) => void
}

export default function ExploreMap({ businesses, selectedId, onSelectBusiness }: ExploreMapProps) {
  const mapRef = useRef<MapRef>(null)
  const [popupBusiness, setPopupBusiness] = useState<Business | null>(null)
  const { activeItinerary, panelMode } = useItinerary()

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  // Build route GeoJSON from itinerary waypoints
  const [itineraryRoute, setItineraryRoute] = useState<GeoJSON.Feature<GeoJSON.LineString> | null>(null);
  const [directRoute, setDirectRoute] = useState<GeoJSON.Feature<GeoJSON.LineString> | null>(null);

  const waypoints = useMemo(() => {
    if (panelMode !== "itinerary" || !activeItinerary) return [];
    const pts: [number, number][] = [];
    if (activeItinerary.origin.lat && activeItinerary.origin.lng) pts.push([activeItinerary.origin.lng, activeItinerary.origin.lat]);
    for (const waypoint of activeItinerary.waypoints) {
      if (waypoint.lat && waypoint.lng) pts.push([waypoint.lng, waypoint.lat]);
    }
    if (activeItinerary.destination.lat && activeItinerary.destination.lng) pts.push([activeItinerary.destination.lng, activeItinerary.destination.lat]);
    return pts;
  }, [activeItinerary, panelMode]);

  const directWaypoints = useMemo(() => {
    if (panelMode !== "itinerary" || !activeItinerary) return [];
    const pts: [number, number][] = [];
    if (activeItinerary.origin.lat && activeItinerary.origin.lng) pts.push([activeItinerary.origin.lng, activeItinerary.origin.lat]);
    if (activeItinerary.destination.lat && activeItinerary.destination.lng) pts.push([activeItinerary.destination.lng, activeItinerary.destination.lat]);
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
      fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordsStr}?geometries=geojson&access_token=${mapboxToken}`)
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
      fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${directCoordsStr}?geometries=geojson&access_token=${mapboxToken}`)
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
      .map((w, idx) => ({ pick: w, idx, icon: "📍" }));
  }, [activeItinerary, panelMode]);

  // Fly to selected business or itinerary point
  useEffect(() => {
    if (!selectedId) { setPopupBusiness(null); return; }

    if (selectedId === 'itin-start' && activeItinerary?.origin.lat && activeItinerary?.origin.lng) {
      mapRef.current?.flyTo({ center: [activeItinerary.origin.lng as number, activeItinerary.origin.lat as number], zoom: 15, pitch: 60, duration: 1200, essential: true });
      setPopupBusiness(null);
      return;
    }

    if (selectedId === 'itin-arrival' && activeItinerary?.destination.lat && activeItinerary?.destination.lng) {
      mapRef.current?.flyTo({ center: [activeItinerary.destination.lng as number, activeItinerary.destination.lat as number], zoom: 15, pitch: 60, duration: 1200, essential: true });
      setPopupBusiness(null);
      return;
    }

    const b = businesses.find(b => b.id === selectedId);
    if (!b || b.lat === null || b.lng === null) { setPopupBusiness(null); return; }
    mapRef.current?.flyTo({ center: [b.lng, b.lat], zoom: 15, pitch: 60, duration: 1200, essential: true });
    setPopupBusiness(b);
  }, [selectedId, businesses, activeItinerary]);

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
      mapRef.current.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 100, duration: 1500, pitch: 45 });
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
      mapRef.current.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 80, duration: 1000, pitch: 45 });
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
    <Map
      ref={mapRef}
      initialViewState={{ longitude: center[0], latitude: center[1], zoom: 11, pitch: 60, bearing: -20 }}
      mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
      mapboxAccessToken={mapboxToken}
      style={{ width: "100%", height: "100%" }}
      terrain={{ source: "mapbox-dem", exaggeration: 1.5 }}
      onClick={() => setPopupBusiness(null)}
    >
      <Source id="mapbox-dem" type="raster-dem" url="mapbox://mapbox.mapbox-terrain-dem-v1" tileSize={512} maxzoom={14} />
      <Layer id="sky" type="sky" paint={{ "sky-type": "atmosphere", "sky-atmosphere-sun": [0.0, 0.0], "sky-atmosphere-sun-intensity": 15 }} />

      {/* Direct baseline route line (Main Route) */}
      {directRoute && (
        <Source id="direct-route" type="geojson" data={directRoute}>
          <Layer id="direct-route-glow" type="line" layout={{ "line-join": "round", "line-cap": "round" }}
            paint={{ "line-color": "#ffffff", "line-width": 12, "line-opacity": 0.3, "line-blur": 6 }} />
          <Layer id="direct-route-line" type="line" layout={{ "line-join": "round", "line-cap": "round" }}
            paint={{ "line-color": "#E11D48", "line-width": 4, "line-opacity": 0.95,
              "line-dasharray": [1, 0] }} />
        </Source>
      )}

      {/* Alternative Detour route line */}
      {itineraryRoute && (
        <Source id="itinerary-route" type="geojson" data={itineraryRoute}>
          <Layer id="route-line" type="line" layout={{ "line-join": "round", "line-cap": "round" }}
            paint={{ "line-color": "#10B981", "line-width": 4, "line-opacity": 0.8,
              "line-dasharray": [2, 2] }} />
        </Source>
      )}

      {/* Start Marker */}
      {activeItinerary && activeItinerary.origin.lat && activeItinerary.origin.lng && (
        <Marker longitude={activeItinerary.origin.lng} latitude={activeItinerary.origin.lat} anchor="bottom" onClick={e => {
          e.originalEvent.stopPropagation();
          mapRef.current?.flyTo({ center: [activeItinerary.origin.lng as number, activeItinerary.origin.lat as number], zoom: 14, pitch: 60, duration: 1200, essential: true });
        }}>
          <div className="cursor-pointer flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#0F172A] border-4 border-white shadow-xl flex items-center justify-center text-xl relative z-10 hover:scale-110 transition-transform">
              📍
              <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-white text-slate-900 text-[11px] font-extrabold flex items-center justify-center border-2 border-[#0F172A] shadow-md">
                0
              </div>
            </div>
            <div className="w-3 h-3 rotate-45 bg-[#0F172A] -mt-1.5 shadow-md z-0" />
          </div>
        </Marker>
      )}

      {/* Arrival Marker */}
      {activeItinerary && activeItinerary.destination.lat && activeItinerary.destination.lng && (
        <Marker longitude={activeItinerary.destination.lng} latitude={activeItinerary.destination.lat} anchor="bottom" onClick={e => {
          e.originalEvent.stopPropagation();
          mapRef.current?.flyTo({ center: [activeItinerary.destination.lng as number, activeItinerary.destination.lat as number], zoom: 14, pitch: 60, duration: 1200, essential: true });
        }}>
          <div className="cursor-pointer flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#10B981] border-4 border-white shadow-xl flex items-center justify-center text-xl relative z-10 hover:scale-110 transition-transform">
              🏁
              <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-white text-slate-900 text-[11px] font-extrabold flex items-center justify-center border-2 border-[#10B981] shadow-md">
                {activeItinerary.waypoints.length + 1}
              </div>
            </div>
            <div className="w-3 h-3 rotate-45 bg-[#10B981] -mt-1.5 shadow-md z-0" />
          </div>
        </Marker>
      )}

      {/* Itinerary waypoint markers */}
      {itineraryMarkers.map(({ pick, idx, icon }) => (
        <Marker key={`itin-${idx}`} longitude={pick.lng as number} latitude={pick.lat as number} anchor="bottom">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#0F172A] border-2 border-[#10B981] shadow-[0_0_16px_#10B981aa] flex items-center justify-center text-lg relative hover:scale-110 transition-transform cursor-pointer">
              {icon}
              <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#10B981] text-black text-[10px] font-extrabold flex items-center justify-center border border-black/20">
                {idx + 1}
              </div>
            </div>
            <div className="w-2 h-2 rotate-45 bg-[#10B981] -mt-1 shadow-md" />
          </div>
        </Marker>
      ))}

      {/* Regular business markers — hidden in itinerary mode */}
      {panelMode !== "itinerary" && validBusinesses.map((business, index) => {
        const style = CATEGORY_STYLE[business.category] ?? { bg: "#6366F1", emoji: "📍" };
        const isSelected = selectedId === business.id;
        const isTop = validBusinesses.length <= 5;

        return (
          <Marker
            key={`${business.id}-${index}`}
            longitude={business.lng}
            latitude={business.lat}
            anchor="bottom"
            onClick={e => { e.originalEvent.stopPropagation(); setPopupBusiness(business); onSelectBusiness(business.id); }}
          >
            <div
              className="cursor-pointer transition-all duration-500 relative flex flex-col items-center"
              style={{ transform: isSelected ? "scale(1.2) translateY(-10px)" : "scale(1)", zIndex: isSelected ? 50 : 1 }}
            >
              {(isSelected || isTop) && (
                <div className="absolute inset-0 rounded-full animate-ping opacity-40 scale-150" style={{ backgroundColor: style.bg, animationDuration: "2s" }} />
              )}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/30 backdrop-blur-md relative z-10"
                style={{
                  background: isSelected ? `linear-gradient(135deg, ${style.bg}, ${style.bg}aa)` : `linear-gradient(135deg, ${style.bg}dd, ${style.bg}88)`,
                  boxShadow: isSelected ? `0 0 20px ${style.bg}` : undefined,
                }}
              >
                {style.emoji}
              </div>
              <div className="w-2.5 h-2.5 rotate-45 -mt-1.5 z-0" style={{ background: `linear-gradient(135deg, ${style.bg}cc, ${style.bg}88)` }} />
            </div>
          </Marker>
        );
      })}

      {popupBusiness && popupBusiness.lng !== null && popupBusiness.lat !== null && (
        <Popup
          anchor="bottom" longitude={popupBusiness.lng} latitude={popupBusiness.lat}
          onClose={() => setPopupBusiness(null)} maxWidth="260px"
          closeButton={false} closeOnClick={false} className="z-50" offset={44}
        >
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#0F172A]/90 border border-white/20 text-white shadow-2xl backdrop-blur-xl" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white whitespace-nowrap">{popupBusiness.name}</h3>
                {popupBusiness.isClaimed && (
                  <div className="bg-[#10B981] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                    <Zap className="w-2.5 h-2.5 fill-current" /> Confiable
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <span className="text-[11px]">{CATEGORY_STYLE[popupBusiness.category]?.emoji} {popupBusiness.category}</span>
                {popupBusiness.rating !== null && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="flex items-center gap-0.5 text-[11px] font-bold">
                      <Star className="w-3 h-3 fill-[#10B981] text-[#10B981]" /> {popupBusiness.rating}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Popup>
      )}

      <NavigationControl position="bottom-right" showCompass={false} />
    </Map>
  );
}
