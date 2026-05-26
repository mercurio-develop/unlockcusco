import { Suspense } from "react"
import { ExploreView, getBusinesses } from "@/features/discovery"
import { searchParamsCache } from "@/features/discovery/search-params"
import { getDictionary, Locale } from "@/lib/dictionaries"
import { getItinerary } from "@/features/itinerary/queries/get-itinerary"
import { Loader2 } from "lucide-react"
import { StoreInitializer } from "@/lib/store/store-initializer"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import type { OptimizedPlan } from "@/lib/ai/schemas/planner-schema"



export default async function ExplorePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ lang: string }>, 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)
  const parsedParams = await searchParamsCache.parse(searchParams)

  const [data, initialItineraryData] = await Promise.all([
    getBusinesses({
      query: parsedParams.q,
      category: parsedParams.cat,
      loc: parsedParams.loc,
      radiusKm: parsedParams.rad ?? undefined,
      userLat: parsedParams.lat ?? undefined,
      userLng: parsedParams.lng ?? undefined,
      sort: parsedParams.sort,
      limit: 30
    }),
    parsedParams.trip ? getItinerary(parsedParams.trip) : Promise.resolve(null)
  ])

  const initialItinerary = initialItineraryData?.success && initialItineraryData?.state 
    ? { ...(initialItineraryData.state as unknown as OptimizedPlan), shortId: parsedParams.trip ?? undefined } 
    : null

  return (
    <div className="relative">
      <StoreInitializer initialItinerary={initialItinerary} />
      <Suspense fallback={
        <div className="h-screen w-full bg-slate-50 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">{dict.explore?.building}</p>
        </div>
      }>
        <NuqsAdapter>
          <ExploreView
            initialBusinesses={data.businesses || []}
            initialMapBusinesses={data.allBusinesses || []}
            initialCategoryCounts={data.categoryCounts || {}}
            initialHasMore={data.hasMore || false}
            initialQuery={parsedParams.q}
            initialSelectedId={parsedParams.id}
            initialItinerary={initialItinerary}
            dict={dict}
          />
        </NuqsAdapter>
      </Suspense>

    </div>
  )
}
