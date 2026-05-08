import { NextRequest, NextResponse } from "next/server"
import { fetchBusinesses } from "@/features/business/actions/fetch-businesses"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  
  const q = searchParams.get("q") || undefined
  const cat = searchParams.get("cat") || undefined
  const loc = searchParams.get("loc") || undefined
  const rad = searchParams.get("rad") || undefined
  const lat = searchParams.get("lat") || undefined
  const lng = searchParams.get("lng") || undefined
  const sort = searchParams.get("sort") || undefined
  const page = searchParams.get("page") || "0"
  const limit = searchParams.get("limit") || "30"

  try {
    const result = await fetchBusinesses({
      query: q,
      category: cat,
      loc,
      radiusKm: rad ? parseFloat(rad) : undefined,
      userLat: lat ? parseFloat(lat) : undefined,
      userLng: lng ? parseFloat(lng) : undefined,
      sort,
      page: parseInt(page),
      limit: parseInt(limit)
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching businesses via API:", error)
    return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 })
  }
}
