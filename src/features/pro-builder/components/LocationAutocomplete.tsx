"use client"
import { useState, useRef, useEffect } from "react"
import { MapPin } from "lucide-react"

export const MOCK_LOCATIONS = [
  { name: "Hotel Monasterio, Cusco", lat: -13.5152, lng: -71.9774 },
  { name: "Tambo del Inka, Urubamba", lat: -13.3056, lng: -72.1158 },
  { name: "Palacio del Inka, Cusco", lat: -13.5197, lng: -71.9754 },
  { name: "MIL Centro, Moray", lat: -13.3297, lng: -72.1958 },
  { name: "Ollantaytambo Train Station", lat: -13.2625, lng: -72.2662 },
  { name: "Alejandro Velasco Astete Airport, Cusco", lat: -13.5358, lng: -71.9389 },
  { name: "Pisac Market", lat: -13.4225, lng: -71.8517 },
  { name: "Chinchero Main Square", lat: -13.3917, lng: -72.0494 },
  { name: "Maras Salt Mines", lat: -13.3000, lng: -72.1550 },
  { name: "Urubamba Main Square", lat: -13.3039, lng: -72.1164 },
  { name: "Cusco Main Square (Plaza de Armas)", lat: -13.5171, lng: -71.9785 },
  { name: "Belmond Hotel Rio Sagrado, Urubamba", lat: -13.3150, lng: -72.1000 },
  { name: "Sol y Luna, Urubamba", lat: -13.2980, lng: -72.1320 },
  { name: "Explora Sacred Valley", lat: -13.3250, lng: -72.0800 },
  { name: "Pisac Town Center", lat: -13.4222, lng: -71.8503 },
  { name: "Urubamba Town Center", lat: -13.3039, lng: -72.1164 },
  { name: "Cusco City Center", lat: -13.5171, lng: -71.9785 },
  { name: "Ollantaytambo Town Center", lat: -13.2583, lng: -72.2639 },
  { name: "Chinchero Town Center", lat: -13.3917, lng: -72.0494 },
  { name: "Calca Town Center", lat: -13.3314, lng: -71.9525 },
]

interface LocationAutocompleteProps {
  value: string;
  onChange: (val: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  className?: string;
}

export function LocationAutocomplete({ value, onChange, placeholder, className }: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value || "")
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(value || "")
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = MOCK_LOCATIONS.filter(l => l.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input 
        type="text" 
        placeholder={placeholder}
        value={query}
        onChange={e => {
          setQuery(e.target.value)
          onChange(e.target.value) // reset lat/lng on manual type
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        className={className}
      />
      {isOpen && filtered.length > 0 && query !== "" && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto py-1">
          {filtered.map(loc => (
            <button
              key={loc.name}
              onClick={() => {
                setQuery(loc.name)
                onChange(loc.name, loc.lat, loc.lng)
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-700 transition-colors"
            >
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">{loc.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
