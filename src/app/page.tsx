import { prisma } from "@/lib/prisma"
import { HeroSection } from "@/components/landing/hero-section"
import { BusinessGrid } from "@/components/landing/business-grid"
import { Business } from "@prisma/client"

// Helper to interleave categories
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

export default async function HomePage() {
  let businesses = await prisma.business.findMany({
    // Fetch a good amount to sort and interleave
    take: 100,
  })

  // Sort by a weighted score (rating * log10(reviewsCount + 10)) to favor highly rated places with many reviews
  // Also slightly bump claimed businesses
  businesses.sort((a, b) => {
    const scoreA = (a.rating || 0) * Math.log10(a.reviewsCount + 10) + (a.isClaimed ? 2 : 0)
    const scoreB = (b.rating || 0) * Math.log10(b.reviewsCount + 10) + (b.isClaimed ? 2 : 0)
    return scoreB - scoreA
  })

  // Interleave by category so the landing page isn't just one category
  businesses = interleaveCategories(businesses)

  // Take top 20 for the landing page grid
  businesses = businesses.slice(0, 20)

  return (
    <div className="bg-[#09090B]">
      <HeroSection />
      <BusinessGrid businesses={businesses} />
    </div>
  )
}

