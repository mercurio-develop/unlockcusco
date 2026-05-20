"use client"

import { Suspense, useEffect, useState, use } from "react"
import { ExploreView, getBusinesses } from "@/features/discovery"
import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import type { Business } from "@prisma/client"
import { cn } from "@/lib/utils"
import { useTrip } from "@/lib/store/trip-context"
import { getDictionary, Locale } from "@/lib/dictionaries"
import { getItinerary } from "@/features/itinerary/queries/get-itinerary"

function ExplorePageContent({ dict }: { dict: any }) {
  const searchParams = useSearchParams()
  const { activeItinerary, setActiveItinerary, setPanelMode } = useTrip()
  const [data, setData] = useState<{
    businesses: Business[],
    allBusinesses: Business[],
    categoryCounts: Record<string, number>,
    hasMore: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const tripId = searchParams.get("trip")
  const q = searchParams.get("q") || ""
  const id = searchParams.get("id")
  const loc = searchParams.get("loc") || ""
  const cat = searchParams.get("cat") || ""
  const rad = searchParams.get("rad") || ""
  const lat = searchParams.get("lat") || ""
  const lng = searchParams.get("lng") || ""
  const sort = searchParams.get("sort") || "recommended"

  // Load itinerary from URL parameter
  useEffect(() => {
    if (tripId && (!activeItinerary || (activeItinerary as any).shortId !== tripId)) {
      console.log(`[ExplorePage] Fetching itinerary for tripId: ${tripId}`);
      getItinerary(tripId)
        .then((data: any) => {
          console.log(`[ExplorePage] Itinerary API response:`, data);
          if (data.success && data.state) {
            console.log(`[ExplorePage] Setting active itinerary and panel mode to 'itinerary'`);
            setActiveItinerary({ ...data.state as any, shortId: tripId });
            setPanelMode("itinerary");
          } else {
            console.error("[ExplorePage] API returned success=false or missing state", data);
          }
        })
        .catch((err: any) => console.error("[ExplorePage] Failed to load itinerary via fetch", err));
    } else if (tripId && activeItinerary && (activeItinerary as any).shortId === tripId) {
      console.log(`[ExplorePage] Itinerary ${tripId} already active. Setting panel mode to 'itinerary'.`);
      setPanelMode("itinerary");
    }
  }, [tripId, setActiveItinerary, setPanelMode, activeItinerary]);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await getBusinesses({
          query: q,
          category: cat,
          loc,
          radiusKm: rad ? parseFloat(rad) : undefined,
          userLat: lat ? parseFloat(lat) : undefined,
          userLng: lng ? parseFloat(lng) : undefined,
          sort,
          limit: 30
        });

        if (!ignore) {
          setData(result)
        }
      } catch (err: any) {
        if (ignore) return;
        console.error("Failed to load businesses:", err)
        if (err.name === 'AbortError') {
          setError("Request timed out after 10 seconds. Check network or ad-blockers.")
        } else {
          setError(err.message || "Failed to load")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
        clearTimeout(timeoutId);
      }
    }
    load()

    return () => {
      ignore = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [q, id, loc, cat, rad, lat, lng, sort])

  if (error) {
    return (
      <div className="h-screen w-full bg-slate-50 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-rose-600 font-medium">{dict.explore?.errorLoading}</p>
        <p className="text-slate-500">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-md">{dict.explore?.retry}</button>
      </div>
    )
  }

  if (!data && loading) {
    return (
      <div className="h-screen w-full bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">
          {dict.explore?.consulting}
        </p>
      </div>
    )
  }

  if (!data || !Array.isArray(data.businesses)) {
    return null
  }

  return (
    <div className="relative">
      <div className={cn("transition-all duration-300", loading ? "opacity-50 blur-[2px] pointer-events-none" : "")}>
        <ExploreView
          initialBusinesses={data.businesses}
          initialMapBusinesses={data.allBusinesses || []}
          initialCategoryCounts={data.categoryCounts || {}}
          initialHasMore={data.hasMore || false}
          initialQuery={q}
          initialSelectedId={id}
          dict={dict}
        />
      </div>
      {loading && data && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl border border-slate-200 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
            <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">{dict.explore?.updating}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ExplorePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  const [dict, setDict] = useState<any>(null)

  useEffect(() => {
    getDictionary(lang as Locale).then(d => setDict(d))
  }, [lang])

  if (!dict) return null

  return (
    <div className="relative">
      <Suspense fallback={
        <div className="h-screen w-full bg-slate-50 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">{dict.explore?.building}</p>
        </div>
      }>
        <ExplorePageContent dict={dict} />
      </Suspense>
    </div>
  )
}
