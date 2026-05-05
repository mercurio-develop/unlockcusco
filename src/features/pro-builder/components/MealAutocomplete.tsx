"use client"
import { useState, useRef, useEffect } from "react"
import { Utensils, Check } from "lucide-react"

type MinimizedPackage = {
  id: string
  title: string
  sector: string
  tags: string
}

interface MealAutocompleteProps {
  title: string;
  businessId?: string;
  onChange: (title: string, businessId?: string) => void;
}

export function MealAutocomplete({ title, businessId, onChange }: MealAutocompleteProps) {
  const [query, setQuery] = useState(title || "")
  const [isOpen, setIsOpen] = useState(false)
  const [restaurants, setRestaurants] = useState<MinimizedPackage[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(title || "")
  }, [title])

  useEffect(() => {
    fetch('/api/experiences')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const foodItems = data.filter(pkg => pkg.tags.includes('food') || pkg.tags.includes('restaurant') || pkg.tags.includes('dining'))
          setRestaurants(foodItems)
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = restaurants.filter(r => r.title.toLowerCase().includes(query.toLowerCase()) && query.length > 2)

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input 
        type="text" 
        value={query} 
        onChange={(e) => {
          setQuery(e.target.value)
          onChange(e.target.value, undefined)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full font-bold text-slate-900 font-serif text-xl outline-none focus:text-amber-600 transition-colors placeholder:text-slate-300 bg-transparent" 
        placeholder="Restaurant Name or 'Close to...'" 
      />
      
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-amber-100 rounded-xl shadow-xl max-h-64 overflow-y-auto py-2 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-2 bg-amber-50/50 border-b border-amber-100/50 mb-1">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Suggested Restaurants</span>
          </div>
          {filtered.map(r => (
            <button
              key={r.id}
              onClick={() => {
                setQuery(r.title)
                onChange(r.title, r.id)
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-3 hover:bg-amber-50 flex items-start gap-3 transition-colors border-l-2 border-transparent hover:border-amber-400"
            >
              <div className="bg-amber-100 p-2 rounded-lg shrink-0 mt-0.5">
                <Utensils className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900 text-[15px]">{r.title}</span>
                <span className="text-xs text-slate-500 uppercase tracking-wide font-medium mt-0.5">{r.sector.replace('_', ' ')}</span>
              </div>
              {businessId === r.id && (
                <Check className="w-4 h-4 text-emerald-500 ml-auto mt-2" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}