import { HeroSection } from "@/features/landing/components/hero-section"
import { FeaturesSection } from "@/features/landing/components/features-section"
import { ArchitectCta } from "@/features/landing/components/architect-cta"
// import { BusinessGrid } from "@/features/landing/components/business-grid"
// import { fetchBusinesses } from "@/features/business/actions/fetch-businesses"

export default async function HomePage() {
  // const { businesses, hasMore } = await fetchBusinesses({ page: 0, limit: 20 })

  return (
    <div className="bg-white">
      <HeroSection />
      <ArchitectCta />
      <FeaturesSection />
      {/* 
      <BusinessGrid initialBusinesses={businesses} initialHasMore={hasMore} />
      */}
    </div>
  )
}

