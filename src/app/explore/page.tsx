import { prisma } from "@/lib/prisma"
import { ExploreView } from "@/components/explore/explore-view"
import { AiConcierge } from "@/components/chat/ai-concierge"
import { Business } from "@prisma/client"

interface ExplorePageProps {
  searchParams: Promise<{ q?: string }>
}

// Helper to interleave categories while maintaining relative rating sort
function interleaveCategories(sortedBusinesses: Business[]) {
  const byCategory: Record<string, Business[]> = {}
  sortedBusinesses.forEach((b) => {
    if (!byCategory[b.category]) byCategory[b.category] = []
    byCategory[b.category].push(b)
  })

  const interleaved = []
  const categories = Object.keys(byCategory)
  let hasMore = true

  while (hasMore) {
    hasMore = false
    for (const cat of categories) {
      if (byCategory[cat].length > 0) {
        const item = byCategory[cat].shift()
        if (item) interleaved.push(item)
        hasMore = true
      }
    }
  }
  return interleaved
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { q } = await searchParams
  let businesses = await prisma.business.findMany({
    orderBy: [{ rating: "desc" }, { reviewsCount: "desc" }],
    take: 100, // Limit payload to client
  })

  if (q) {
    const query = q.toLowerCase()
    let targetCategory = ""
    if (query.includes("massage") || query.includes("spa") || query.includes("wellness") || query.includes("recovery")) targetCategory = "Wellness"
    else if (query.includes("atv") || query.includes("hiking") || query.includes("adventure") || query.includes("tour") || query.includes("trail")) targetCategory = "Adventure"
    else if (query.includes("picantería") || query.includes("restaurant") || query.includes("food") || query.includes("dining") || query.includes("eat")) targetCategory = "Dining"
    else if (query.includes("hotel") || query.includes("stays") || query.includes("sleep")) targetCategory = "Stays"
    else if (query.includes("market") || query.includes("culture") || query.includes("art")) targetCategory = "Culture"

    businesses = targetCategory
      ? businesses.filter((b) => b.category === targetCategory)
      : businesses.filter((b) =>
          b.name.toLowerCase().includes(query) || b.category.toLowerCase().includes(query)
        )
  }

  // Sort by rating (desc) and reviewsCount (desc)
  businesses.sort((a, b) => {
    if (a.rating !== b.rating) {
      return (b.rating || 0) - (a.rating || 0)
    }
    return (b.reviewsCount || 0) - (a.reviewsCount || 0)
  })

  // Interleave categories
  businesses = interleaveCategories(businesses)

  // Take top 5 if there's a search
  if (q) {
    businesses = businesses.slice(0, 5)
  }

  return (
    <div className="relative">
      <ExploreView businesses={businesses} initialQuery={q ?? ""} />
      <AiConcierge />
    </div>
  )
}

