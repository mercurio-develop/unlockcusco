import { useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import type { Business } from "@prisma/client"
import { getBusinesses } from "../queries/get-businesses"

export interface UseExploreViewStateProps {
  initialBusinesses: Business[]
  initialMapBusinesses: Business[]
  initialCategoryCounts: Record<string, number>
  initialHasMore: boolean
}

export function useExploreViewState({
  initialBusinesses,
  initialMapBusinesses,
  initialCategoryCounts,
  initialHasMore
}: UseExploreViewStateProps) {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses || [])
  const [mapBusinesses, setMapBusinesses] = useState<Business[]>(initialMapBusinesses || [])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(initialCategoryCounts || {})
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [mapBounds, setMapBounds] = useState<[number, number, number, number] | null>(null)
  
  const searchParams = useSearchParams()

  const [prevInitialBusinesses, setPrevInitialBusinesses] = useState(initialBusinesses)
  if (initialBusinesses !== prevInitialBusinesses) {
    setPrevInitialBusinesses(initialBusinesses)
    setBusinesses(initialBusinesses)
    setMapBusinesses(initialMapBusinesses)
    setCategoryCounts(initialCategoryCounts)
    setPage(0)
    setHasMore(initialHasMore)
  }

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    try {
      const q = searchParams.get("q") || undefined
      const cat = searchParams.get("cat") || undefined
      const loc = searchParams.get("loc") || undefined
      const sort = searchParams.get("sort") || undefined
      const rad = searchParams.get("rad") ? Number(searchParams.get("rad")) : undefined

      const result = await getBusinesses({
        query: q,
        category: cat,
        loc: loc,
        radiusKm: rad,
        sort: sort,
        page: page + 1,
        limit: 30
      })
      
      setBusinesses(prev => {
        const existingIds = new Set(prev.map(b => b.id))
        const newBusinesses = (result.businesses || []).filter((b: Business) => !existingIds.has(b.id))
        return [...prev, ...newBusinesses]
      })
      setPage(p => p + 1)
      setHasMore(result.hasMore)
    } catch (error) {
      console.error("Failed to load more businesses:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [page, hasMore, isLoadingMore, searchParams])

  return {
    businesses, setBusinesses,
    mapBusinesses, setMapBusinesses,
    categoryCounts, setCategoryCounts,
    hasMore,
    isLoadingMore,
    mapBounds, setMapBounds,
    loadMore
  }
}
