import useSWRInfinite from 'swr/infinite'
import { useMemo } from 'react'
import type { Business } from '@prisma/client'
import { getBusinesses } from '../queries/get-businesses';

export interface UseBusinessesProps {
  locationSlug: string
  category?: string
  debouncedQuery: string
  sort: string
  initialBusinesses: Business[]
}

type BusinessListKey = ['businesses', string, string | undefined, string, string, number, number];

const fetcher = async (key: BusinessListKey) => {
  const [, loc, cat, q, sort, limit, page] = key;
  return getBusinesses({ 
    loc, 
    category: cat || undefined, 
    query: q || undefined, 
    sort: sort === 'recommended' ? undefined : sort, 
    limit, 
    page 
  });
}

export function useBusinessList({ locationSlug, category, debouncedQuery, sort, initialBusinesses }: UseBusinessesProps) {
  const getKey = (pageIndex: number, previousPageData: { businesses: Business[], hasMore: boolean } | null) => {
    if (previousPageData && !previousPageData.hasMore) return null // reached the end
    return ['businesses', locationSlug, category, debouncedQuery, sort, 30, pageIndex] as BusinessListKey;
  }

  const { data, error, isLoading, size, setSize } = useSWRInfinite<{businesses: Business[], hasMore: boolean}>(getKey, fetcher, {
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
