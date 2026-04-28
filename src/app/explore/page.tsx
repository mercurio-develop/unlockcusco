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
  const query = q?.toLowerCase() || ""

  let targetCategory = ""
  if (query) {
    if (query.includes("massage") || query.includes("spa") || query.includes("wellness") || query.includes("recovery")) targetCategory = "Wellness"
    else if (query.includes("atv") || query.includes("hiking") || query.includes("adventure") || query.includes("tour") || query.includes("trail")) targetCategory = "Adventure"
    else if (query.includes("picantería") || query.includes("restaurant") || query.includes("food") || query.includes("dining") || query.includes("eat")) targetCategory = "Dining"
    else if (query.includes("hotel") || query.includes("stays") || query.includes("sleep")) targetCategory = "Stays"
    else if (query.includes("market") || query.includes("culture") || query.includes("art")) targetCategory = "Culture"
  }

  const whereClause = targetCategory
    ? { category: targetCategory }
    : query
    ? {
        OR: [
          { name: { contains: query } },
          { category: { contains: query } },
        ],
      }
    : {}

  let businesses = await prisma.business.findMany({
    where: whereClause,
    orderBy: [{ rating: "desc" }, { reviewsCount: "desc" }],
    take: 100, // Limit payload to client
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

