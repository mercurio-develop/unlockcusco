import { prisma } from "@/lib/prisma"
import { TopListClient } from "./top-list-client"
import { EssentialGuides } from "./essential-guides"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function TopListsSection({ dict, locale = "en" }: { dict?: Record<string, any>, locale?: string }) {
  // Use translations if available, fallback to hardcoded
  const t = {
    hostelsTitle: dict?.hostelsTitle || "Top 5 Stays",
    hostelsDesc: dict?.hostelsDesc || "The highest rated hostels and hotels across the valley.",
    diningTitle: dict?.diningTitle || "Top 5 Restaurants",
    diningDesc: dict?.diningDesc || "Highly recommended culinary experiences.",
    adventuresTitle: dict?.adventuresTitle || "Top 5 Adventures",
    adventuresDesc: dict?.adventuresDesc || "The most thrilling experiences and tours.",
  }

  const [topStays, topDining, topAdventures] = await Promise.all([
    prisma.business.findMany({
      where: { category: { in: ['stays', 'STAYS'] }, imageUrl: { contains: 'http' } },
      orderBy: { reviewsCount: 'desc' },
      select: { id: true, slug: true, name: true, imageUrl: true, priceTier: true, specialties: true, category: true, categoryEs: true, description: true, descriptionEs: true, locationSlug: true }
    }),
    prisma.business.findMany({
      where: { category: { in: ['dining', 'DINING'] }, imageUrl: { contains: 'http' } },
      orderBy: { reviewsCount: 'desc' },
      select: { id: true, slug: true, name: true, imageUrl: true, priceTier: true, specialties: true, category: true, categoryEs: true, description: true, descriptionEs: true, locationSlug: true }
    }),
    prisma.business.findMany({
      where: { category: { in: ['adventure', 'ADVENTURE', 'agency', 'AGENCY'] }, imageUrl: { contains: 'http' } },
      orderBy: { reviewsCount: 'desc' },
      select: { id: true, slug: true, name: true, imageUrl: true, priceTier: true, specialties: true, category: true, categoryEs: true, description: true, descriptionEs: true, locationSlug: true }
    })
  ]);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <TopListClient 
          title={t.hostelsTitle} 
          subtitle={t.hostelsDesc}
          items={topStays} 
          locale={locale}
        />
        <TopListClient 
          title={t.diningTitle} 
          subtitle={t.diningDesc}
          items={topDining} 
          locale={locale}
        />
        <TopListClient 
          title={t.adventuresTitle} 
          subtitle={t.adventuresDesc}
          items={topAdventures} 
          locale={locale}
        />
        <EssentialGuides locale={locale} />
      </div>
    </section>
  )
}
