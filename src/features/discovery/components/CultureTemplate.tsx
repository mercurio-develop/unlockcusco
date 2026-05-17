import { getLocalizedField } from "@/lib/utils/localization"
import { Palette, Users, History, Sparkles } from "lucide-react"
import type { Business, BusinessService } from "@prisma/client"

interface CultureTemplateProps {
  business: Business & { services: BusinessService[] }
  dict?: any
  lang: string
}

export function CultureTemplate({ business, dict , lang }: CultureTemplateProps) {
  const workshops = business.services || []

  const t = dict?.cultureTemplate || {
    livingHeritage: "Living Heritage",
    subtitle: "Discover the artisans and ancient processes",
    localArtisans: "Local Artisans",
    localArtisansDesc: "Meet the master weavers and creators preserving ancestral knowledge.",
    ancientTech: "Ancient Techniques",
    ancientTechDesc: "Experience natural dyeing and backstrap loom weaving in person.",
    authenticGoods: "Authentic Goods",
    authenticGoodsDesc: "Support local families by purchasing genuine, handmade textiles.",
    experiences: "Experiences & Workshops",
    defaultDesc: "An immersive cultural experience guided by local experts.",
    walkIn: "Walk-in visits are welcome. Check availability for guided tours."
  }

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
            <Palette className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-3xl font-serif text-white">{t.livingHeritage}</h2>
            <p className="text-white/50 text-sm">{t.subtitle}</p>
          </div>
        </div>

        {/* Heritage Process Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="font-bold text-white">{t.localArtisans}</h4>
            <p className="text-xs text-white/50 leading-relaxed">{t.localArtisansDesc}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
              <History className="w-5 h-5 text-rose-400" />
            </div>
            <h4 className="font-bold text-white">{t.ancientTech}</h4>
            <p className="text-xs text-white/50 leading-relaxed">{t.ancientTechDesc}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="font-bold text-white">{t.authenticGoods}</h4>
            <p className="text-xs text-white/50 leading-relaxed">{t.authenticGoodsDesc}</p>
          </div>
        </div>

        <div className="grid gap-6">
          <h3 className="text-xl font-serif text-white mb-2">{t.experiences}</h3>
          {workshops.length > 0 ? (
            workshops.map((workshop) => (
              <div key={workshop.id} className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 transition-all hover:bg-white/[0.08] hover:border-amber-600/30">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors mb-2">
                      {workshop.title}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed mb-4">
                      {workshop.description || t.defaultDesc}
                    </p>
                  </div>
                  {workshop.priceUsd > 0 && (
                    <div className="text-xl font-serif text-amber-500 font-bold shrink-0">
                      ${workshop.priceUsd}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-3xl">
              <p className="text-white/40">{t.walkIn}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
