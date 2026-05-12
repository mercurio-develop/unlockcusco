"use client"

import { useState, useEffect, useRef } from "react"
import { Search, LayoutGrid, List, ChevronDown, Check, Loader2, X } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { BusinessCard } from "@/features/discovery/components/business-card"
import { useTrip } from "@/lib/store/trip-context"
import { useRouter, useSearchParams } from "next/navigation"
import type { Business } from "@prisma/client"
import { cn } from "@/lib/utils"
import { SORT_OPTIONS, CATEGORIES, LOCATIONS } from "@/features/discovery/constants"

interface DiscoverPanelProps {
  businesses: Business[]
  selectedId?: string | null
  setSelectedId: (id: string) => void
  onReset: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
}

export function DiscoverPanel({ businesses, selectedId, setSelectedId, onReset, hasMore, isLoadingMore, onLoadMore }: DiscoverPanelProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const currentSort = searchParams.get("sort") || "recommended"
  const q = searchParams.get("q") || ""
  const loc = searchParams.get("loc") || ""
  const cats = (searchParams.get("cat") || "").split(",").filter(Boolean)
  const rad = searchParams.get("rad") || ""

  const [isSortOpen, setIsSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  
  const { ref, inView } = useInView({ threshold: 0 })

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

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 relative">
      {businesses.length > 0 && (
        <div className="flex items-start justify-between gap-4 z-10 mb-4">
          <div className="flex items-center gap-2 flex-1 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {q && (
              <button onClick={() => removeFilter("q")} className="shrink-0 flex items-center gap-1.5 bg-white border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 rounded-full px-3 py-1 shadow-sm hover:border-slate-300 hover:text-slate-900 transition-colors">
                <span>"{q}"</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {loc && (
              <button onClick={() => removeFilter("loc")} className="shrink-0 flex items-center gap-1.5 bg-white border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 rounded-full px-3 py-1 shadow-sm hover:border-slate-300 hover:text-slate-900 transition-colors">
                <span>{LOCATIONS.find(l => l.value === loc)?.label || loc}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {cats.map(c => (
              <button key={c} onClick={() => removeFilter("cat", c)} className="shrink-0 flex items-center gap-1.5 bg-white border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 rounded-full px-3 py-1 shadow-sm hover:border-slate-300 hover:text-slate-900 transition-colors">
                <span>{CATEGORIES.find(cat => cat.value === c)?.label || c}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            ))}
            {rad && (
              <button onClick={() => removeFilter("rad")} className="shrink-0 flex items-center gap-1.5 bg-white border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 rounded-full px-3 py-1 shadow-sm hover:border-slate-300 hover:text-slate-900 transition-colors">
                <span>{rad}km Radius</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div ref={sortRef} className="relative">
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg shadow-sm px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-widest"
              >
                <span>Sort: {SORT_OPTIONS.find(o => o.value === currentSort)?.label || "Recommended"}</span>
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
                      {option.label}
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
      )}
      {businesses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-rose-100 rounded-full blur-2xl opacity-50 scale-150 animate-pulse" />
            <div className="relative bg-white p-6 rounded-full shadow-sm border border-slate-50">
              <Search className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-2xl font-serif tracking-tight text-slate-900 mb-3">No experiences found</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
            The Valley is vast, but we couldn't find matches for these specific filters. Try expanding your search or resetting your preferences.
          </p>
          <button 
            onClick={onReset}
            className="bg-slate-900 text-white px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className={cn("pb-20", viewMode === "grid" ? "grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6" : "flex flex-col gap-4")}>
           {businesses.map(e => (
             <BusinessCard 
               key={e.id} 
               business={e} 
               isHighlighted={selectedId === e.id} 
               onSelect={() => setSelectedId(e.id)} 
               orientation={viewMode === "list" ? "horizontal" : "vertical"}
             />
           ))}
           {hasMore && (
             <div ref={ref} className="w-full py-8 flex justify-center items-center col-span-full">
               {isLoadingMore && <Loader2 className="w-6 h-6 text-rose-600 animate-spin" />}
             </div>
           )}
        </div>
      )}
    </div>
  )
}
