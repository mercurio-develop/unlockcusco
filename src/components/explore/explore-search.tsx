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
          <Sparkles className="h-5 w-5 text-[#D4AF37]" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && navigate(value, currentLoc, currentCat)}
          placeholder="Describe your perfect day (e.g. massage and good food)..."
          className="w-full py-5 pl-12 pr-16 rounded-2xl border border-white/20 bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all text-white shadow-[0_0_30px_-5px_rgba(255,255,255,0.05)] text-lg placeholder:text-white/40 font-light backdrop-blur-md"
        />
        
        <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
          <DialogTrigger render={
            <button type="button" className={`absolute inset-y-0 right-4 flex items-center transition-colors ${currentLoc || currentCat ? 'text-[#D4AF37]' : 'text-white/50 hover:text-white'}`}>
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          } />
          <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-[#09090B] border border-white/20 backdrop-blur-xl">
            <DialogHeader className="mb-6 border-b border-white/10 pb-4 relative">
              <DialogTitle className="text-2xl font-serif tracking-tight text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#D4AF37]" /> Filters
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-8">
              {/* Location Filter */}
              <div>
                <h4 className="text-sm font-semibold text-white/80 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                  <MapPin className="w-4 h-4" /> Location
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedLoc("")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedLoc === "" 
                        ? "bg-[#D4AF37] text-black shadow-lg" 
                        : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    Anywhere
                  </button>
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc.value}
                      onClick={() => setSelectedLoc(loc.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedLoc === loc.value 
                          ? "bg-[#D4AF37] text-black shadow-lg" 
                          : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="text-sm font-semibold text-white/80 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                  <Tag className="w-4 h-4" /> Category
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCat("")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedCat === "" 
                        ? "bg-[#D4AF37] text-black shadow-lg" 
                        : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    All Experiences
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCat(cat.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedCat === cat.value 
                          ? "bg-[#D4AF37] text-black shadow-lg" 
                          : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={applyFilters} 
                className="w-full bg-[#D4AF37] hover:bg-[#C5A059] text-black font-bold py-6 rounded-xl text-lg mt-4 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
              >
                Show Results
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide items-center">
        <span className="text-white/40 text-sm font-medium whitespace-nowrap mr-2">Quick Filters:</span>
        {CATEGORIES.map((cat) => {
          const isActive =
            currentCat === cat.value ||
            (initialQuery && initialQuery.toLowerCase().includes(cat.value.toLowerCase()))
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleCategoryQuickFilter(cat.value)}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap cursor-pointer transition-all text-sm font-medium border ${
                isActive
                  ? "bg-[#D4AF37] text-black border-[#D4AF37] hover:bg-[#C5A059] shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:border-white/30"
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
