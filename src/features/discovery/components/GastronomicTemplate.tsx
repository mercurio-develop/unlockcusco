import { Utensils, Clock, Flame } from "lucide-react"
import type { Business, BusinessService } from "@prisma/client"

interface GastronomicTemplateProps {
  business: Business & { services: BusinessService[] }
}

export function GastronomicTemplate({ business }: GastronomicTemplateProps) {
  const menuItems = business.services || []

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
            <Utensils className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h2 className="text-3xl font-serif text-white">Menu Highlights</h2>
            <p className="text-white/50 text-sm">Flavors of the Sacred Valley</p>
          </div>
        </div>

        <div className="grid gap-6">
          {menuItems.length > 0 ? (
            menuItems.map((item) => (
              <div key={item.id} className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 transition-all hover:bg-white/[0.08] hover:border-rose-600/30">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition-colors mb-2">
                      {item.title}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed mb-4">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-white/40">
                      <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5" /> {item.durationMins} min
                      </span>
                      {item.priceUsd > 30 && (
                        <span className="flex items-center gap-1.5 bg-rose-600/20 text-rose-400 px-2.5 py-1 rounded-lg border border-rose-600/30">
                          <Flame className="w-3.5 h-3.5" /> Signature Dish
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-2xl font-serif text-rose-500 font-bold shrink-0">
                    ${item.priceUsd}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-3xl">
              <p className="text-white/40">The digital menu is being updated. Stay tuned!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
