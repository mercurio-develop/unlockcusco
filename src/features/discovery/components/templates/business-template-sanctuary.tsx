import { HeartPulse, Sparkles, Wind } from "lucide-react"
import type { Business, BusinessService } from "@prisma/client"

interface SanctuaryTemplateProps {
  business: Business & { services: BusinessService[] }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict?: Record<string, any>
}
import { DICTIONARIES } from "../../constants"

export function SanctuaryTemplate({ business, dict }: SanctuaryTemplateProps) {
  if (!business.isAsociado) return null

  const treatments = business.services || []

  const t = dict?.templates?.sanctuary || DICTIONARIES.sanctuaryTemplate

  return (
    <div className="space-y-16">
      <section>
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
            <HeartPulse className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-4xl font-serif text-slate-900 mb-4">{t.title}</h2>
          <p className="text-slate-900/60 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {treatments.length > 0 ? (
            treatments.map((item) => (
              <div key={item.id} className="group bg-slate-50 border border-slate-200 rounded-[2rem] p-8 hover:bg-white/[0.08] hover:border-emerald-500/30 transition-all duration-500">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-serif text-slate-900 font-bold">${item.priceUsd}</div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-900/60 text-sm leading-relaxed mb-8">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-900/40 uppercase tracking-widest">
                     <Wind className="w-4 h-4" /> {item.durationMins} {t.minutes}
                   </div>
                   <button className="text-emerald-400 text-xs font-bold uppercase tracking-widest hover:underline">
                     {t.details}
                   </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
               <p className="text-slate-900/40">{t.emptyState}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
