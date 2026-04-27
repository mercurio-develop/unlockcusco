import { prisma } from "@/lib/prisma"
import { HeroSection } from "@/components/landing/hero-section"
import { BusinessGrid } from "@/components/landing/business-grid"

export default async function HomePage() {
  const businesses = await prisma.business.findMany({
    orderBy: [{ isClaimed: "desc" }, { rating: "desc" }],
  })

  return (
    <div className="bg-[#09090B]">
      <HeroSection />
      <BusinessGrid businesses={businesses} />
    </div>
  )
}
