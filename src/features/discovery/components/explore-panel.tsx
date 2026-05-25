/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from "react"
import { Search, LayoutGrid, List, ChevronDown, Check, Loader2, X, Utensils, Landmark, Ticket, MapPin } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { BusinessCard } from "@/features/discovery/components/business-card"
import { useUiStore } from "@/lib/store/use-ui-store"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import type { Business } from "@prisma/client"
import { cn } from "@/lib/utils"
import { SORT_OPTIONS, CATEGORIES, LOCATIONS } from "@/features/discovery/constants"
import { Footer } from "@/components/layout/footer"

interface DiscoverPanelProps {
  businesses: Business[]
  totalCount: number
  selectedId?: string | null
  setSelectedId: (id: string | null) => void
  onReset: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
   
  dict?: any
}

export function ExplorePanel({ businesses, totalCount, selectedId, setSelectedId, onReset, hasMore, isLoadingMore, onLoadMore, dict }: DiscoverPanelProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const lang = pathname?.split('/')[1] || 'en'
  
  const currentSort = searchParams.get("sort") || "recommended"
  const q = searchParams.get("q") || ""
  const loc = searchParams.get("loc") || ""
  const cats = (searchParams.get("cat") || "").split(",").filter(Boolean)
  const rad = searchParams.get("rad") || ""

  const [isSortOpen, setIsSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  
  const { ref, inView } = useInView({ threshold: 0 })
  const isAddingStop = useUiStore(s => s.isAddingStop);
  const setIsAddingStop = useUiStore(s => s.setIsAddingStop);
  const exchangeTargetId = useUiStore(s => s.exchangeTargetId);
  const setExchangeTargetId = useUiStore(s => s.setExchangeTargetId);
  const isExchangingStart = useUiStore(s => s.isExchangingStart);
  const setIsExchangingStart = useUiStore(s => s.setIsExchangingStart);
  const isExchangingEnd = useUiStore(s => s.isExchangingEnd);
  const setIsExchangingEnd = useUiStore(s => s.setIsExchangingEnd);
  const setPanelMode = useUiStore(s => s.setPanelMode);

  const removeFilter = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (key === "cat" && value) {
      const newCats = cats.filter(c => c !== value)
      if (newCats.length > 0) {
        params.set("cat", newCats.join(","))
      } else {
        params.delete("cat")
      }
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  useEffect(() => {
    if (inView && hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore()
    }
  }, [inView, hasMore, isLoadingMore, onLoadMore])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "recommended") {
      params.delete("sort")
    } else {
      params.set("sort", value)
    }
    router.push(`?${params.toString()}`, { scroll: false })
    setIsSortOpen(false)
  }

  const t = (dict?.discoverPanel || {
    places: "Places",
    sort: "Sort:",
    recommended: "Recommended",
    sortOptions: {
      recommended: "Recommended",
      rating_desc: "Highest Rated",
      price_asc: "Price (Low to High)",
      price_desc: "Price (High to Low)"
    },
    radius: "Radius",
    emptyTitle: "No places in this area",
    emptyDesc: "Try panning or zooming out the map to find more places, or clear your filters to see the whole Valley.",
    resetFilters: "Reset all filters",
    itineraryMode: "Itinerary Mode",
    pickStart: "Pick a new start location",
    pickEnd: "Pick a new end destination",
    swapPlace: "Select a place to swap",
    addStop: "Browse and click 'Add' on a place to add it as a stop"
  })

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 bg-gray-50/50 relative" data-vaul-no-drag>
      {(isAddingStop || exchangeTargetId || isExchangingStart || isExchangingEnd) && (
        <div className="mb-4 bg-slate-900 text-white rounded-xl p-4 shadow-md flex items-center justify-between animate-in slide-in-from-top-2 fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <List className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-emerald-400">{t.itineraryMode}</p>
              <p className="text-sm font-medium text-slate-200">
                {isExchangingStart ? t.pickStart : isExchangingEnd ? t.pickEnd : exchangeTargetId ? t.swapPlace : t.addStop}
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsAddingStop(false)
              setExchangeTargetId(null)
              setIsExchangingStart(false)
              setIsExchangingEnd(false)
              setPanelMode('itinerary')
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {businesses.length > 0 && (
        <div className="flex flex-col gap-3 w-full z-10 mb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-3 md:gap-0">
            <div className="text-sm font-bold text-slate-800 order-2 md:order-1">{totalCount} {t.places}</div>
            <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2 shrink-0 order-1 md:order-2">
              <div ref={sortRef} className="relative z-20">
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg shadow-sm px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-widest"
                >
                  <span>{t.sort} {t.sortOptions[currentSort as keyof typeof t.sortOptions] || t.recommended}</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isSortOpen && "rotate-180")} />
                </button>
                
                {isSortOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-100 shadow-xl rounded-xl py-1 overflow-hidden">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between",
                          currentSort === option.value ? "text-rose-600 bg-rose-50/50" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        {t.sortOptions[option.value as keyof typeof t.sortOptions] || option.label}
                        {currentSort === option.value && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm p-1">
                <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded-md transition-colors", viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600")}>
                  <List className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded-md transition-colors", viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600")}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {(q || loc || cats.length > 0 || rad) && (
            <div className="flex flex-wrap items-center gap-2 w-full">
              {q && (
                <button onClick={() => removeFilter("q")} className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-black uppercase tracking-widest transition-colors bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100">
                  <span>&quot;{q}&quot;</span>
                  <X className="w-3 h-3 ml-0.5 opacity-60 hover:opacity-100" />
                </button>
              )}
              {loc && (
                <button onClick={() => removeFilter("loc")} className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-black uppercase tracking-widest transition-colors bg-indigo-50 text-indigo-700 border-indigo-200/50 hover:bg-indigo-100">
                  <MapPin className="w-2.5 h-2.5" />
                  <span>{LOCATIONS.find(l => l.value === loc)?.label || loc}</span>
                  <X className="w-3 h-3 ml-0.5 opacity-60 hover:opacity-100" />
                </button>
              )}
              {cats.map(c => (
                <button key={c} onClick={() => removeFilter("cat", c)} className={cn(
                  "shrink-0 flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] md:text-xs font-black uppercase tracking-widest transition-colors",
                  c.toUpperCase() === 'DINING' ? "bg-amber-50 text-amber-700 border-amber-200/50 hover:bg-amber-100" :
                  c.toUpperCase() === 'CULTURE' ? "bg-purple-50 text-purple-700 border-purple-200/50 hover:bg-purple-100" :
                  c.toUpperCase() === 'BOLETO' ? "bg-sky-50 text-sky-700 border-sky-200/50 hover:bg-sky-100" :
                  "bg-rose-50 text-rose-600 border-rose-100/50 hover:bg-rose-100"
                )}>
                  {c.toUpperCase() === 'DINING' && <Utensils className="w-2.5 h-2.5" />}
                  {c.toUpperCase() === 'CULTURE' && <Landmark className="w-2.5 h-2.5" />}
                  {c.toUpperCase() === 'BOLETO' && <Ticket className="w-2.5 h-2.5" />}
                  <span>{CATEGORIES.find(cat => cat.value === c)?.label || c}</span>
                  <X className="w-3 h-3 ml-0.5 opacity-60 hover:opacity-100" />
                </button>
              ))}
              {rad && (
                <button onClick={() => removeFilter("rad")} className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-black uppercase tracking-widest transition-colors bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100">
                  <span>{rad}km Radius</span>
                  <X className="w-3 h-3 ml-0.5 opacity-60 hover:opacity-100" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {businesses.length === 0 ? (
        isLoadingMore ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-in fade-in duration-500">
            <Loader2 className="w-8 h-8 text-rose-600 animate-spin mb-4" />
            <p className="text-slate-500 text-sm font-medium tracking-wide">Loading places...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-rose-100 rounded-full blur-2xl opacity-50 scale-150 animate-pulse" />
              <div className="relative bg-white p-6 rounded-full shadow-sm border border-slate-50">
                <Search className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-2xl font-serif tracking-tight text-slate-900 mb-3">{t.emptyTitle}</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
              {t.emptyDesc}
            </p>
            <button 
              onClick={onReset}
              className="bg-slate-900 text-white px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
            >
              {t.resetFilters}
            </button>
          </div>
        )
      ) : (
        <div className={cn("pb-20", viewMode === "grid" ? "grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6" : "flex flex-col gap-4")}>
           {businesses.map(e => (
             <BusinessCard 
               key={e.id} 
               business={e} 
               isHighlighted={selectedId === e.id} 
               onSelect={() => setSelectedId(e.id)} 
               orientation={viewMode === "list" ? "horizontal" : "vertical"}
               showMap={true}
               dict={dict}
               onDoubleClick={() => {
                 setSelectedId(e.id);
                 window.dispatchEvent(new CustomEvent('switch-to-map-view'));
               }}
             />
           ))}
           {hasMore && (
             <div ref={ref} className="w-full py-8 flex justify-center items-center col-span-full">
               {isLoadingMore && <Loader2 className="w-6 h-6 text-rose-600 animate-spin" />}
             </div>
           )}
        </div>
      )}
      <Footer lang={lang} />
    </div>
  )
}
