"use client"

import { useEffect, useRef, useState } from "react"
import Map, { Marker, Popup, Source, Layer } from "react-map-gl/mapbox"
import type { MapRef } from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"
import { Star, Zap, ArrowUpRight, MapPin } from "lucide-react"
import type { Business } from "@/components/explore/explore-view"

const CATEGORY_STYLE: Record<string, { bg: string; emoji: string }> = {
  Dining: { bg: "#EA580C", emoji: "🍽️" },
  Wellness:   { bg: "#9333EA", emoji: "🧘" },
  Adventure:    { bg: "#16A34A", emoji: "🥾" },
  Stays:    { bg: "#2563EB", emoji: "🛌" },
  Culture:     { bg: "#D97706", emoji: "🏺" },
}

interface ExploreMapProps {
  businesses: Business[]
  selectedId: string | null
  onSelectBusiness: (id: string) => void
}

export default function ExploreMap({ businesses, selectedId, onSelectBusiness }: ExploreMapProps) {
  const mapRef = useRef<MapRef>(null)
  const [popupBusiness, setPopupBusiness] = useState<Business | null>(null)

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  // Fly to selected business
  useEffect(() => {
    if (!selectedId) return
    const b = businesses.find((b) => b.id === selectedId)
    if (!b) return
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

  // Fit bounds when businesses change
  useEffect(() => {
    if (businesses.length > 0 && mapRef.current) {
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

      // If they are all the same point, add a tiny offset so fitBounds doesn't crash
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
  }, [businesses])

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

      {businesses.map((business, index) => {
        const style = CATEGORY_STYLE[business.category] ?? { bg: "#6366F1", emoji: "📍" }
        const isSelected = selectedId === business.id
        const isTopResult = businesses.length <= 5

        return (
          <Marker
            key={business.id}
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
            className="overflow-hidden rounded-2xl bg-[#09090B] border border-white/20 text-white shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={popupBusiness.imageUrl}
                alt={popupBusiness.name}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] to-transparent opacity-60" />
              {popupBusiness.isClaimed && (
                <div className="absolute top-2 right-2 bg-[#D4AF37] text-black text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Zap className="w-3 h-3 fill-current" /> Verified
                </div>
              )}
            </div>

            <div className="p-4 relative -mt-4">
              <h3 className="font-extrabold text-base leading-tight line-clamp-1 text-white">
                {popupBusiness.name}
              </h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-white/60 font-medium px-2 py-0.5 bg-white/5 rounded-full border border-white/10">
                  {CATEGORY_STYLE[popupBusiness.category]?.emoji}{" "}
                  {popupBusiness.category}
                </span>
                {popupBusiness.rating !== null && (
                  <span className="flex items-center gap-1 text-[12px] text-[#D4AF37] font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {popupBusiness.rating}
                  </span>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => onSelectBusiness(popupBusiness.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#D4AF37] hover:bg-[#C5A059] text-black text-xs font-bold py-2.5 rounded-xl transition-colors"
                >
                  View Details <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${popupBusiness.lat},${popupBusiness.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-xl transition-colors border border-white/10"
                >
                  <MapPin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </Popup>
      )}
    </Map>
  )
}

