"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Search, Loader2, X, ChevronDown, Check } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { BusinessCard } from "@/features/discovery/components/business-card"
import type { Business } from "@prisma/client"
import useSWRInfinite from 'swr/infinite'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface InteractiveListProps {
  locationSlug: string
  category?: string
  initialBusinesses: Business[]
}

const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Highest Rated", value: "rating_desc" },
  { label: "Most Reviews", value: "reviews_desc" },
]

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function InteractiveList({ locationSlug, category, initialBusinesses }: InteractiveListProps) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState("recommended")
  
  // Debounce the query for SWR key
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.hasMore) return null // reached the end

    const params = new URLSearchParams()
    params.set("loc", locationSlug)
    if (category) params.set("cat", category)
    if (debouncedQuery) params.set("q", debouncedQuery)
    if (sort !== "recommended") params.set("sort", sort)
    params.set("limit", "30")
    params.set("page", pageIndex.toString())
    
    return `/api/businesses?${params.toString()}`
  }

  const { data, error, isLoading, isValidating, size, setSize } = useSWRInfinite(getKey, fetcher, {
    fallbackData: debouncedQuery === "" && sort === "recommended" ? [{ businesses: initialBusinesses, hasMore: initialBusinesses.length >= 30 }] : undefined,
    revalidateFirstPage: false,
  })

  const { ref, inView } = useInView({ threshold: 0 })

  const businesses = useMemo(() => {
    if (!data) return []
    const all = data.flatMap(page => page.businesses || [])
    // Deduplicate just in case
    const seen = new Set()
    return all.filter(b => {
      if (seen.has(b.id)) return false
      seen.add(b.id)
      return true
    })
  }, [data])

  const hasMore = data ? data[data.length - 1]?.hasMore : false
  const isSearching = isLoading && (!data || data.length === 0)
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined")

  useEffect(() => {
    if (inView && hasMore && !isLoadingMore) {
      setSize(size + 1)
    }
  }, [inView, hasMore, isLoadingMore, size, setSize])

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${category ? category.toLowerCase() : 'experiences'} in ${locationSlug.charAt(0).toUpperCase() + locationSlug.slice(1)}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
          {query && (
            <button 
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort:</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 bg-slate-50 border border-slate-100 text-sm font-medium text-slate-700 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 hover:bg-slate-100 transition-colors">
              <span>{SORT_OPTIONS.find(o => o.value === sort)?.label || "Recommended"}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSort(option.value)}
                  className={cn(
                    "w-full flex items-center justify-between",
                    sort === option.value && "bg-rose-50/50 text-rose-600 font-bold"
                  )}
                >
                  {option.label}
                  {sort === option.value && <Check className="w-4 h-4 text-rose-600" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results */}
      {isSearching ? (
        <div className="py-24 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      ) : businesses.length === 0 ? (
        <div className="py-24 text-center">
          <h3 className="text-xl font-serif text-slate-900 mb-2">No results found</h3>
          <p className="text-slate-500">Try adjusting your search query or sorting options.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business: Business) => (
            <BusinessCard
              key={business.id}
              business={business}
              orientation="vertical"
              showItineraryAdd={true}
              showItineraryEnd={false}
            />
          ))}
          {/* Infinite Scroll Trigger */}
          {hasMore && (
            <div ref={ref} className="w-full py-8 flex justify-center items-center col-span-full">
              {(isLoadingMore || isValidating) ? <Loader2 className="w-6 h-6 text-rose-600 animate-spin" /> : <div className="h-6" />}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
