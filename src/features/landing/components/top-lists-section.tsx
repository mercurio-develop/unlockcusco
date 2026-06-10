import { ScrollCarousel } from "@/components/ui/scroll-carousel"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { getCategoryData } from "@/features/discovery/constants"
import { cn } from "@/lib/utils"

interface TopListItem {
  id: string
  slug: string | null
  name: string
  imageUrl: string | null
  priceTier: string | null
  specialties: string | null
  category: string | null
  categoryEs: string | null
  description: string | null
  descriptionEs: string | null
  open?: boolean
}

function TopList({ title, items, subtitle, locale = "en" }: { title: string, items: TopListItem[], subtitle?: string, locale?: string }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="mb-4">
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>
      <ScrollCarousel className="mx-0 px-0 items-stretch">
        {items.map((item, index) => {
          let tags: string[] = [];
          try {
            tags = JSON.parse(item.specialties || '[]');
          } catch {
            tags = [];
          }
          // Only take first 2-3 tags to not clutter the UI
          tags = tags.slice(0, 3);
          
          return (
            <Link 
              href={`/business/${item.slug || item.id}`} 
              key={item.id}
              className="shrink-0 w-[280px] sm:w-[320px] group flex flex-col justify-between snap-start h-full"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-slate-100 shrink-0">
                {item.imageUrl ? (
                  <Image 
                    src={item.imageUrl} 
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                    No image
                  </div>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                  <span className="text-[10px] font-bold text-slate-700">TOP {index + 1}</span>
                </div>
                {item.open && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-emerald-500/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">Open</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                    <span className="text-xs font-medium text-slate-500 shrink-0">{item.priceTier || '$$'}</span>
                  </div>
                  {(() => {
                    const catData = getCategoryData(item.category);
                    const CatIcon = catData.icon;
                    const displayCategory = (locale === 'es' && item.categoryEs) ? item.categoryEs : catData.label;
                    return (
                      <div className="pt-0.5">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border inline-flex items-center gap-1 w-fit",
                          catData.theme
                        )}>
                          <CatIcon className="w-2.5 h-2.5" />
                          {displayCategory}
                        </span>
                      </div>
                    );
                  })()}
                </div>
                {(() => {
                  const bDesc = (locale === 'es' && item.descriptionEs) ? item.descriptionEs : item.description;
                  if (!bDesc) return null;
                  return (
                    <p className="text-slate-500 text-xs italic leading-relaxed mt-1">
                      {bDesc}
                    </p>
                  );
                })()}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none font-medium text-[10px] px-2 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </ScrollCarousel>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function TopListsSection({ dict, locale = "en" }: { dict?: Record<string, any>, locale?: string }) {
  // Use translations if available, fallback to hardcoded
  const t = {
    hostelsTitle: dict?.hostelsTitle || "Top 5 Stays",
    hostelsDesc: dict?.hostelsDesc || "The highest rated hostels and hotels across the valley.",
    diningTitle: dict?.diningTitle || "Top 5 Restaurants",
    diningDesc: dict?.diningDesc || "Highly recommended culinary experiences.",
  }

  const [topStays, topDining] = await Promise.all([
    prisma.business.findMany({
      where: { category: { in: ['stays', 'STAYS'] }, imageUrl: { not: '' } },
      orderBy: { reviewsCount: 'desc' },
      take: 5,
      select: { id: true, slug: true, name: true, imageUrl: true, priceTier: true, specialties: true, category: true, categoryEs: true, description: true, descriptionEs: true }
    }),
    prisma.business.findMany({
      where: { category: { in: ['dining', 'DINING'] }, imageUrl: { not: '' } },
      orderBy: { reviewsCount: 'desc' },
      take: 5,
      select: { id: true, slug: true, name: true, imageUrl: true, priceTier: true, specialties: true, category: true, categoryEs: true, description: true, descriptionEs: true }
    })
  ]);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <TopList 
          title={t.hostelsTitle} 
          subtitle={t.hostelsDesc}
          items={topStays} 
          locale={locale}
        />
        <TopList 
          title={t.diningTitle} 
          subtitle={t.diningDesc}
          items={topDining} 
          locale={locale}
        />
      </div>
    </section>
  )
}
