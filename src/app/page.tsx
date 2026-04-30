import { HeroSection } from "@/features/landing/components/hero-section"
import { FeaturesSection } from "@/features/landing/components/features-section"
import { DesignCta } from "@/features/landing/components/design-cta"

export default async function HomePage() {
  return (
    <div className="bg-white">
      <HeroSection />
      <DesignCta />
      <FeaturesSection />
    </div>
  )
}

