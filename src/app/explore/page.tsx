import type { Metadata } from "next"
import { Suspense } from "react"
import { ExploreView } from "@/features/explore/components/explore-view"
import { fetchBusinesses } from "@/features/business/actions/fetch-businesses"

interface ExplorePageProps {
  searchParams: Promise<{ q?: string; id?: string; loc?: string; cat?: string; rad?: string; lat?: string; lng?: string }>
}

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

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { q, id, loc, cat, rad, lat, lng } = await searchParams
  const query = q?.toLowerCase() || ""

  const { businesses, hasMore } = await fetchBusinesses({
    query,
    category: cat,
    loc,
    radiusKm: rad ? parseFloat(rad) : 0.5,
    userLat: lat ? parseFloat(lat) : undefined,
    userLng: lng ? parseFloat(lng) : undefined,
    page: 0,
    limit: 200
  })

  // Ensure selected business is exactly at the top
  if (id) {
    const selectedIndex = businesses.findIndex(b => b.id === id)
    if (selectedIndex > 0) {
      const [selectedBusiness] = businesses.splice(selectedIndex, 1)
      businesses.unshift(selectedBusiness)
    } else if (selectedIndex === -1) {
      // It's not in the first 20 items, so we'll need to fetch it dynamically
      // or we can let the client handle it.
      // For MVP, we'll let the client handle the initialSelectedId finding 
      // but ideally we would fetch this record and prepend it here.
    }
  }

  return (
    <div className="relative">
      <Suspense fallback={<div className="h-screen w-full bg-slate-50 animate-pulse flex items-center justify-center">Loading Explore...</div>}>
        <ExploreView
          initialBusinesses={businesses}
          initialHasMore={hasMore}
          initialQuery={q ?? ""}
          initialSelectedId={id ?? null}
        />
      </Suspense>
    </div>
  )
}

