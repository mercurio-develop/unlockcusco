import { HeroSection } from "@/components/landing/hero-section"
import { BusinessGrid } from "@/components/landing/business-grid"
import { fetchBusinesses } from "@/features/business/actions/fetch-businesses"

export default async function HomePage() {
  const { businesses, hasMore } = await fetchBusinesses({ page: 0, limit: 20 })

  return (
    <div className="bg-[#09090B]">
      <HeroSection />
      <BusinessGrid initialBusinesses={businesses} initialHasMore={hasMore} />
    </div>
  )
}

