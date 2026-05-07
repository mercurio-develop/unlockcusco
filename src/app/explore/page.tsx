import type { Metadata } from "next"
import { Suspense } from "react"
import { ExploreView } from "@/features/explore/components/explore-view"
import { fetchBusinesses } from "@/features/business/actions/fetch-businesses"

interface ExplorePageProps {
  searchParams: Promise<{ q?: string; id?: string; loc?: string; cat?: string; rad?: string; lat?: string; lng?: string; sort?: string }>
}

import { Loader2 } from "lucide-react"

export async function generateMetadata({ searchParams }: ExplorePageProps): Promise<Metadata> {
  const { q, loc, cat } = await searchParams
  
  let title = "Explore"
  let description = "Find the best places and services in the Sacred Valley."
  
  if (q) {
    title = `Search results for "${q}"`
    description = `Discover businesses and services matching "${q}" in the Sacred Valley.`
  } else if (loc || cat) {
    const locName = loc ? loc.charAt(0).toUpperCase() + loc.slice(1) : "the Sacred Valley"
    const catName = cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : "Places"
    title = `${catName} in ${locName}`
    description = `Explore the best ${catName.toLowerCase()} in ${locName}, curated by Vallecito.`
  }

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Vallecito`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Vallecito`,
      description,
    },
  }
}

import { prisma } from "@/lib/prisma"

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { q, id, loc, cat, rad, lat, lng, sort } = await searchParams
  const query = q?.toLowerCase() || ""

  const { businesses, allBusinesses, categoryCounts, hasMore } = await fetchBusinesses({
    query,
    category: cat,
    loc,
    radiusKm: rad ? parseFloat(rad) : undefined,
    userLat: lat ? parseFloat(lat) : undefined,
    userLng: lng ? parseFloat(lng) : undefined,
    sort,
    page: 0,
    limit: 500 // Increased limit to fetch all in the valley
  })

  // Ensure selected business is exactly at the top
  if (id) {
    const selectedIndex = businesses.findIndex(b => b.id === id)
    if (selectedIndex > 0) {
      const [selectedBusiness] = businesses.splice(selectedIndex, 1)
      businesses.unshift(selectedBusiness)
    } else if (selectedIndex === -1) {
      // Fetch the business dynamically if it's not in the current search results
      const missingBusiness = await prisma.business.findUnique({
        where: { id }
      })
      if (missingBusiness) {
        businesses.unshift(missingBusiness)
      }
    }
  }

  return (
    <div className="relative">
      <Suspense fallback={
        <div className="h-screen w-full bg-slate-50 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Building the workspace...</p>
        </div>
      }>
        <ExploreView
          initialBusinesses={businesses}
          initialMapBusinesses={allBusinesses}
          initialCategoryCounts={categoryCounts}
          initialHasMore={hasMore}
          initialQuery={q ?? ""}
          initialSelectedId={id ?? null}
        />
      </Suspense>
    </div>
  )
}

