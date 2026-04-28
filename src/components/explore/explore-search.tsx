"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { SlidersHorizontal, Sparkles, MapPin, Tag } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const CATEGORIES = [
  { label: "🥾 Adventure", value: "Adventure" },
  { label: "🧘 Wellness", value: "Wellness" },
  { label: "🍽️ Dining", value: "Dining" },
  { label: "🏺 Culture", value: "Culture" },
  { label: "🛌 Stays", value: "Stays" },
]

const LOCATIONS = [
  { label: "Urubamba", value: "urubamba" },
  { label: "Pisac", value: "pisac" },
  { label: "Maras", value: "maras" },
  { label: "Ollantaytambo", value: "ollantaytambo" },
  { label: "Chinchero", value: "chinchero" },
]

export function ExploreSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialQuery)
  const [filterOpen, setFilterOpen] = useState(false)

  // Local state for the filter dialog
  const currentLoc = searchParams.get("loc") || ""
  const currentCat = searchParams.get("cat") || ""
  const [selectedLoc, setSelectedLoc] = useState(currentLoc)
  const [selectedCat, setSelectedCat] = useState(currentCat)

  const navigate = (q: string, loc?: string, cat?: string) => {
    const params = new URLSearchParams()
    if (q.trim()) params.set("q", q.trim())
    if (loc) params.set("loc", loc)
    if (cat) params.set("cat", cat)
    
    router.push(`/explore?${params.toString()}`)
  }

  const applyFilters = () => {
    setFilterOpen(false)
    navigate(value, selectedLoc, selectedCat)
  }

  const handleCategoryQuickFilter = (catValue: string) => {
    if (
      (initialQuery && initialQuery.toLowerCase().includes(catValue.toLowerCase())) ||
      currentCat === catValue
    ) {
      const newQ = initialQuery.toLowerCase() === catValue.toLowerCase() ? "" : initialQuery
      navigate(newQ, currentLoc, "")
    } else {
      navigate(value, currentLoc, catValue)
    }
  }

  return (
    <>
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Sparkles className="h-5 w-5 text-rose-500" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && navigate(value, currentLoc, currentCat)}
          placeholder="Describe your perfect day (e.g. massage and good food)..."
          className="w-full py-5 pl-12 pr-16 rounded-2xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all text-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.06)] text-lg placeholder:text-gray-400 font-medium"
        />
        
        <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
          <DialogTrigger render={
            <button type="button" className={`absolute inset-y-0 right-4 flex items-center transition-colors ${currentLoc || currentCat ? 'text-rose-600' : 'text-gray-400 hover:text-slate-900'}`}>
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          } />
          <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-white border border-gray-200 shadow-2xl">
            <DialogHeader className="mb-6 border-b border-gray-100 pb-4 relative">
              <DialogTitle className="text-2xl font-serif tracking-tight text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-slate-400" /> Filters
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-8">
              {/* Location Filter */}
              <div>
                <h4 className="text-sm font-bold text-slate-500 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                  <MapPin className="w-4 h-4" /> Location
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedLoc("")}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      selectedLoc === "" 
                        ? "bg-slate-900 text-white shadow-md" 
                        : "bg-white text-slate-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    Anywhere
                  </button>
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc.value}
                      onClick={() => setSelectedLoc(loc.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        selectedLoc === loc.value 
                          ? "bg-slate-900 text-white shadow-md" 
                          : "bg-white text-slate-600 hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="text-sm font-bold text-slate-500 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                  <Tag className="w-4 h-4" /> Category
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCat("")}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      selectedCat === "" 
                        ? "bg-slate-900 text-white shadow-md" 
                        : "bg-white text-slate-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    All Experiences
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCat(cat.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        selectedCat === cat.value 
                          ? "bg-slate-900 text-white shadow-md" 
                          : "bg-white text-slate-600 hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={applyFilters} 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 rounded-xl text-lg mt-4 shadow-lg transition-transform hover:scale-[1.02]"
              >
                Show Results
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide items-center">
        <span className="text-slate-400 text-sm font-bold whitespace-nowrap mr-2">Quick Filters:</span>
        {CATEGORIES.map((cat) => {
          const isActive =
            currentCat === cat.value ||
            (initialQuery && initialQuery.toLowerCase().includes(cat.value.toLowerCase()))
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleCategoryQuickFilter(cat.value)}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap cursor-pointer transition-all text-sm font-semibold border ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-white text-slate-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>
    </>
  )
}
