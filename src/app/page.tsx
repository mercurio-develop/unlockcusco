import { HeroSection, FeaturesSection } from "@/features/landing"

export default async function HomePage() {
  return (
    <div className="bg-white">
      <HeroSection />
      <FeaturesSection />
    </div>
  )
}

