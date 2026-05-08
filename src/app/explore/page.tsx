"use client"

import { Suspense, useEffect, useState, use } from "react"
import { ExploreView } from "@/features/explore/components/explore-view"
import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import type { Business } from "@prisma/client"

function ExplorePageContent() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<{
    businesses: Business[],
    allBusinesses: Business[],
    categoryCounts: Record<string, number>,
    hasMore: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const q = searchParams.get("q") || ""
  const id = searchParams.get("id")
  const loc = searchParams.get("loc") || ""
  const cat = searchParams.get("cat") || ""
  const rad = searchParams.get("rad") || ""
  const lat = searchParams.get("lat") || ""
  const lng = searchParams.get("lng") || ""
  const sort = searchParams.get("sort") || "recommended"

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (q) params.set("q", q)
        if (id) params.set("id", id)
        if (loc) params.set("loc", loc)
        if (cat) params.set("cat", cat)
        if (rad) params.set("rad", rad)
        if (lat) params.set("lat", lat)
        if (lng) params.set("lng", lng)
        if (sort) params.set("sort", sort)
        params.set("limit", "30")

        const res = await fetch(`/api/businesses?${params.toString()}`)
        const result = await res.json()
        setData(result)
      } catch (error) {
        console.error("Failed to load businesses:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [q, id, loc, cat, rad, lat, lng, sort])

  if (!data && loading) {
    return (
      <div className="h-screen w-full bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">
          Consulting the Valley...
        </p>
      </div>
    )
  }

  if (!data || !Array.isArray(data.businesses)) {
    return null
  }

  return (
    <div className={loading ? "opacity-70 pointer-events-none transition-opacity" : "transition-opacity"}>
      <ExploreView
        initialBusinesses={data.businesses}
        initialMapBusinesses={data.allBusinesses || []}
        initialCategoryCounts={data.categoryCounts || {}}
        initialHasMore={data.hasMore || false}
        initialQuery={q}
        initialSelectedId={id}
      />
    </div>
  )
}

export default function ExplorePage() {
  return (
    <div className="relative">
      <Suspense fallback={
        <div className="h-screen w-full bg-slate-50 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Building the workspace...</p>
        </div>
      }>
        <ExplorePageContent />
      </Suspense>
    </div>
  )
}
