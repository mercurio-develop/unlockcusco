"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Loader2, X } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { BusinessCard } from "@/features/discovery/components/business-card"
import type { Business } from "@prisma/client"

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

export function InteractiveList({ locationSlug, category, initialBusinesses }: InteractiveListProps) {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses)
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState("recommended")
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(initialBusinesses.length >= 30)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const { ref, inView } = useInView({ threshold: 0 })

  // Reset and search when query or sort changes
  useEffect(() => {
    // If initial load and no query/sort change, do nothing
    if (query === "" && sort === "recommended" && page === 0) return

    const fetchResults = async () => {
      setIsSearching(true)
      try {
        const params = new URLSearchParams()
        params.set("loc", locationSlug)
        if (category) params.set("cat", category)
        if (query) params.set("q", query)
        if (sort !== "recommended") params.set("sort", sort)
        params.set("limit", "30")
        params.set("page", "0")

        const res = await fetch(`/api/businesses?${params.toString()}`)
        const data = await res.json()
        setBusinesses(data.businesses || [])
        setHasMore(data.hasMore || false)
        setPage(0)
      } catch (error) {
        console.error("Failed to search businesses:", error)
      } finally {
        setIsSearching(false)
      }
    }

    const timeoutId = setTimeout(fetchResults, 300)
    return () => clearTimeout(timeoutId)
  }, [query, sort, locationSlug, category])

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isSearching) return
    setIsLoadingMore(true)
    try {
      const nextPage = page + 1
      const params = new URLSearchParams()
      params.set("loc", locationSlug)
      if (category) params.set("cat", category)
      if (query) params.set("q", query)
      if (sort !== "recommended") params.set("sort", sort)
      params.set("limit", "30")
      params.set("page", nextPage.toString())
      
      const res = await fetch(`/api/businesses?${params.toString()}`)
      const data = await res.json()
      
      setBusinesses(prev => {
        const existingIds = new Set(prev.map(b => b.id))
        const newBusinesses = (data.businesses || []).filter((b: Business) => !existingIds.has(b.id))
        return [...prev, ...newBusinesses]
      })
      setPage(nextPage)
      setHasMore(data.hasMore || false)
    } catch (error) {
      console.error("Failed to load more:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [page, hasMore, isLoadingMore, isSearching, locationSlug, category, query, sort])

  useEffect(() => {
    if (inView) {
      loadMore()
    }
  }, [inView, loadMore])

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
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-slate-50 border border-slate-100 text-sm font-medium text-slate-700 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
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
          {businesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              orientation="vertical"
              contactOnly={true}
            />
          ))}
          {/* Infinite Scroll Trigger */}
          {hasMore && (
            <div ref={ref} className="w-full py-8 flex justify-center items-center col-span-full">
              {isLoadingMore ? <Loader2 className="w-6 h-6 text-rose-600 animate-spin" /> : <div className="h-6" />}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
