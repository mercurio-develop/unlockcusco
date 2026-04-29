"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import Map, { Marker, Popup, Source, Layer, NavigationControl } from "react-map-gl/mapbox"
import type { MapRef } from "react-map-gl/mapbox"
import 'mapbox-gl/dist/mapbox-gl.css'
import { Star, Zap } from "lucide-react"
import type { Business } from "@/components/explore/explore-view"
import { useItinerary } from "@/lib/store/itinerary-context"

const CATEGORY_STYLE: Record<string, { bg: string; emoji: string }> = {
  Dining: { bg: "#EA580C", emoji: "🍽️" },
  Wellness:   { bg: "#9333EA", emoji: "🧘" },
  Adventure:    { bg: "#16A34A", emoji: "🥾" },
  Stays:    { bg: "#2563EB", emoji: "🛌" },
  Culture:     { bg: "#D97706", emoji: "🏺" },
  Boleto: { bg: "#be185d", emoji: "🎫" } // Special style for Boleto Turistico
}

interface ExploreMapProps {
  businesses: Business[]
  selectedId: string | null
  onSelectBusiness: (id: string) => void
}

export default function ExploreMap({ businesses, selectedId, onSelectBusiness }: ExploreMapProps) {
  const mapRef = useRef<MapRef>(null)
  const [popupBusiness, setPopupBusiness] = useState<Business | null>(null)
  const { activeRelay, setActiveRelay, panelMode, swapModeCategory, setSwapModeCategory, setPanelMode } = useItinerary()

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  const handleReplace = (e: React.MouseEvent, business: Business) => {
    e.stopPropagation();
    if (!activeRelay || !swapModeCategory) return;

    const newRelay = { ...activeRelay };

    if (swapModeCategory === "food") {
      newRelay.food = {
        id: business.id,
        name: business.name,
        rating: business.rating || 4.5,
        whatsapp: business.whatsapp || undefined,
        lat: business.lat,
        lng: business.lng,
      };
      newRelay.foodCost = 25;
    } else if (swapModeCategory === "transit") {
      newRelay.transit = {
        id: business.id,
        name: business.name,
        driver: "Assigned Driver",
        rating: business.rating || 4.5,
        whatsapp: business.whatsapp || undefined,
        lat: business.lat,
        lng: business.lng,
      };
    } else if (swapModeCategory === "stay") {
      newRelay.stay = {
        id: business.id,
        name: business.name,
        rating: business.rating || 4.5,
        lat: business.lat,
        lng: business.lng,
      };
    }

    newRelay.totalCost = newRelay.foodCost + newRelay.transitCost;
    setActiveRelay(newRelay);
    setSwapModeCategory(null);
    setPanelMode("itinerary");
    setPopupBusiness(null);
  };

  const activeRouteGeoJSON = useMemo(() => {
    if (panelMode !== "itinerary" || !activeRelay) return null;
    
    // We try to use the coordinates of the chosen origin/food/stay from the relay payload.
    // If exact coordinates aren't returned, we skip drawing the line.
    const getCoords = (node: any) => {
        if (node?.lng && node?.lat) return [node.lng, node.lat];
        // fallback to businesses array lookup if available
        const b = businesses.find(b => b.name === node?.name);
        return b ? [b.lng, b.lat] : null;
    }

    // Default coords mapped similarly to chrono-relay for origin lookup
    const coordsMap: Record<string, { lat: number, lng: number }> = {
      "urubamba": { lat: -13.3047, lng: -72.1167 },
      "cusco": { lat: -13.5226, lng: -71.9673 },
      "pisac": { lat: -13.2995, lng: -71.8491 },
      "ollantaytambo": { lat: -13.2588, lng: -72.2633 }
    };
    
    let originCoords = null;
    const originLower = (activeRelay.origin || "").toLowerCase();
    for (const [key, coords] of Object.entries(coordsMap)) {
        if (originLower.includes(key)) {
            originCoords = [coords.lng, coords.lat];
            break;
        }
    }

    const foodCoords = getCoords(activeRelay.food);
    const stayCoords = getCoords(activeRelay.stay);

    const validCoords = [originCoords, foodCoords, stayCoords].filter(Boolean) as number[][];

    if (validCoords.length >= 2) {
      return {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: validCoords
        }
      } as GeoJSON.Feature<GeoJSON.LineString>;
    }
    return null;
  }, [activeRelay, panelMode, businesses])

  // Fly to selected business
  useEffect(() => {
    if (!selectedId) {
      setPopupBusiness(null)
      return
    }
    const b = businesses.find((b) => b.id === selectedId)
    if (!b) {
      setPopupBusiness(null)
      return
    }
    mapRef.current?.flyTo({
      center: [b.lng, b.lat],
      zoom: 14,
      pitch: 60,
      duration: 1200,
      essential: true,
    })
    // eslint-disable-next-line
    setPopupBusiness(b)
  }, [selectedId, businesses])

  // Fit bounds when businesses or route change
  useEffect(() => {
    if (mapRef.current) {
        if (activeRouteGeoJSON) {
            const coords = activeRouteGeoJSON.geometry.coordinates;
            let minLng = Math.min(...coords.map(c => c[0]));
            let maxLng = Math.max(...coords.map(c => c[0]));
            let minLat = Math.min(...coords.map(c => c[1]));
            let maxLat = Math.max(...coords.map(c => c[1]));

            if (minLng === maxLng) { minLng -= 0.01; maxLng += 0.01 }
            if (minLat === maxLat) { minLat -= 0.01; maxLat += 0.01 }

            mapRef.current.fitBounds(
              [
                [minLng, minLat],
                [maxLng, maxLat],
              ],
              { padding: 80, duration: 1500, pitch: 45 }
            );
        } else if (businesses.length > 0) {
          let minLng = businesses[0].lng
          let maxLng = businesses[0].lng
          let minLat = businesses[0].lat
          let maxLat = businesses[0].lat

          for (const b of businesses) {
            if (b.lng < minLng) minLng = b.lng
            if (b.lng > maxLng) maxLng = b.lng
            if (b.lat < minLat) minLat = b.lat
            if (b.lat > maxLat) maxLat = b.lat
          }

          if (minLng === maxLng) { minLng -= 0.01; maxLng += 0.01 }
          if (minLat === maxLat) { minLat -= 0.01; maxLat += 0.01 }

          mapRef.current.fitBounds(
            [
              [minLng, minLat],
              [maxLng, maxLat],
            ],
            { padding: 80, duration: 1000, pitch: 45 }
          )
        }
    }
  }, [businesses, activeRouteGeoJSON])

  if (!mapboxToken) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#09090B] text-white/40 p-6 text-center">
        <p className="font-medium">Map token missing.</p>
        <p className="text-sm mt-1">Set NEXT_PUBLIC_MAPBOX_TOKEN in .env</p>
      </div>
    )
  }

  const center = businesses.length > 0
    ? [
        businesses.reduce((s, b) => s + b.lng, 0) / businesses.length,
        businesses.reduce((s, b) => s + b.lat, 0) / businesses.length,
      ]
    : [-72.1167, -13.3047]

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
      <Source
        id="mapbox-dem"
        type="raster-dem"
        url="mapbox://mapbox.mapbox-terrain-dem-v1"
        tileSize={512}
        maxzoom={14}
      />
      <Layer
        id="sky"
        type="sky"
        paint={{
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [0.0, 0.0],
          "sky-atmosphere-sun-intensity": 15,
        }}
      />

      {activeRouteGeoJSON && (
        <Source id="active-route" type="geojson" data={activeRouteGeoJSON}>
          {/* Glowing outline/shadow for visibility */}
          <Layer
            id="active-route-line-glow"
            type="line"
            layout={{
              "line-join": "round",
              "line-cap": "round"
            }}
            paint={{
              "line-color": "#ffffff",
              "line-width": 10,
              "line-opacity": 0.4,
              "line-blur": 4
            }}
          />
          {/* Solid main line */}
          <Layer
            id="active-route-line"
            type="line"
            layout={{
              "line-join": "round",
              "line-cap": "round"
            }}
            paint={{
              "line-color": "#D4AF37",
              "line-width": 6,
              "line-opacity": 0.9,
            }}
          />
        </Source>
      )}

      {businesses.map((business, index) => {
        const style = CATEGORY_STYLE[business.category] ?? { bg: "#6366F1", emoji: "📍" }
        const isSelected = selectedId === business.id
        const isTopResult = businesses.length <= 5

        return (
          <Marker
            key={`${business.id}-${index}`}
            longitude={business.lng}
            latitude={business.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              setPopupBusiness(business)
              onSelectBusiness(business.id)
            }}
          >
            <div
              className="cursor-pointer transition-all duration-500 relative flex flex-col items-center justify-center group"
              style={{
                transform: isSelected ? "scale(1.2) translateY(-10px)" : "scale(1)",
                zIndex: isSelected ? 50 : 1,
              }}
            >
              {/* Outer pulsing ring for selected or top result */}
              {(isSelected || isTopResult) && (
                <div 
                  className="absolute inset-0 rounded-full animate-ping opacity-40 scale-150" 
                  style={{ backgroundColor: style.bg, animationDuration: "2s" }} 
                />
              )}
              
              {/* Pin body (Glassmorphic) */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/30 backdrop-blur-md relative z-10 transition-colors"
                style={{
                  background: isSelected ? `linear-gradient(135deg, ${style.bg}, ${style.bg}aa)` : `linear-gradient(135deg, ${style.bg}dd, ${style.bg}88)`,
                  color: "white",
                  boxShadow: isSelected ? `0 0 20px ${style.bg}` : undefined,
                }}
              >
                {style.emoji}
                
                {/* Number badge for top results */}
                {isTopResult && (
                  <div className="absolute -top-2 -right-2 bg-[#D4AF37] text-black text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#09090B] shadow-sm z-20">
                    {index + 1}
                  </div>
                )}
              </div>

              {/* Pin tail */}
              <div
                className="w-3 h-3 rotate-45 -mt-1.5 z-0"
                style={{ 
                  background: isSelected ? `linear-gradient(135deg, ${style.bg}, ${style.bg}cc)` : `linear-gradient(135deg, ${style.bg}cc, ${style.bg}88)`,
                  boxShadow: "2px 2px 4px rgba(0,0,0,0.3)" 
                }}
              />
            </div>
          </Marker>
        )
      })}

      {popupBusiness && (
        <Popup
          anchor="bottom"
          longitude={popupBusiness.lng}
          latitude={popupBusiness.lat}
          onClose={() => setPopupBusiness(null)}
          maxWidth="260px"
          closeButton={false}
          closeOnClick={false}
          className="z-50"
          offset={40}
        >
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#09090B]/90 border border-white/20 text-white shadow-2xl backdrop-blur-xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm leading-tight text-white whitespace-nowrap">
                  {popupBusiness.name}
                </h3>
                {popupBusiness.isClaimed && (
                  <div className="bg-[#D4AF37] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 shadow-sm">
                    <Zap className="w-2.5 h-2.5 fill-current" /> 100% Confiable
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <span className="text-[11px] font-medium flex items-center gap-1">
                  {CATEGORY_STYLE[popupBusiness.category]?.emoji}{" "}
                  {popupBusiness.category}
                </span>
                {popupBusiness.rating !== null && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span className="flex items-center gap-0.5 text-[11px] font-bold">
                      <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                      {popupBusiness.rating}
                    </span>
                  </>
                )}
              </div>
              {swapModeCategory && (
                <div className="mt-2 pt-2 border-t border-white/20 w-full flex justify-center">
                  <button 
                    onClick={(e) => handleReplace(e, popupBusiness)}
                    className="bg-[#D4AF37] hover:bg-[#C5A059] text-black text-[11px] font-bold px-3 py-1.5 rounded-md shadow-sm w-full transition-colors"
                  >
                    Replace in Itinerary
                  </button>
                </div>
              )}
            </div>
          </div>
        </Popup>
      )}

      <NavigationControl position="bottom-right" showCompass={false} />
    </Map>
  )
}

