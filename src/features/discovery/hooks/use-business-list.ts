import useSWRInfinite from 'swr/infinite'
import { useMemo } from 'react'
import type { Business } from '@prisma/client'
import { fetchBusinesses } from '../actions/fetch-businesses'

export interface UseBusinessesProps {
  locationSlug: string
  category?: string
  debouncedQuery: string
  sort: string
  initialBusinesses: Business[]
}

const fetcher = async (key: any[]) => {
  const [_, loc, cat, q, sort, limit, page] = key;
  return fetchBusinesses({ 
    loc, 
    category: cat || undefined, 
    query: q || undefined, 
    sort: sort === 'recommended' ? undefined : sort, 
    limit, 
    page 
  });
}

export function useBusinessList({ locationSlug, category, debouncedQuery, sort, initialBusinesses }: UseBusinessesProps) {
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.hasMore) return null // reached the end
    return ['businesses', locationSlug, category, debouncedQuery, sort, 30, pageIndex];
  }

  const { data, error, isLoading, isValidating, size, setSize } = useSWRInfinite(getKey, fetcher, {
    fallbackData: debouncedQuery === "" && sort === "recommended" 
      ? [{ businesses: initialBusinesses, hasMore: initialBusinesses.length >= 30 }] 
      : undefined,
    revalidateFirstPage: false,
  })

  const businesses = useMemo(() => {
    if (!data) return []
    const all = data.flatMap(page => page.businesses || [])
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

  return { businesses, hasMore, isSearching, isLoadingMore, error, size, setSize }
}
