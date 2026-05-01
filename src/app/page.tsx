import { HeroSection } from "@/features/landing/components/hero-section"
import { FeaturesSection } from "@/features/landing/components/features-section"

export default async function HomePage() {
  return (
    <div className="bg-white">
      <HeroSection />
      <FeaturesSection />
    </div>
  )
}

