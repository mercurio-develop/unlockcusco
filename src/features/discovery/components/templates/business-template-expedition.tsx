import { Map, CheckCircle2 } from "lucide-react"
import type { Business, BusinessService, TourPackage } from "@prisma/client"
import { DICTIONARIES } from "../../constants"

interface ExpeditionTemplateProps {
  business: Business & { services: BusinessService[]; tourPackages?: TourPackage[] }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict?: Record<string, any>
}

export function ExpeditionTemplate({ business, dict }: ExpeditionTemplateProps) {
  if (!business.isAsociado) return null

  const packages = business.tourPackages || []

  const t = dict?.templates?.expedition || DICTIONARIES.expeditionTemplate

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Map className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-serif text-slate-900">{t.title}</h2>
            <p className="text-slate-900/50 text-sm">{t.subtitle}</p>
          </div>
        </div>

        <div className="space-y-8">
          {packages.length > 0 ? (
            packages.map((pkg) => {
              const highlights = JSON.parse(pkg.highlights || "[]") as string[]
              const included = JSON.parse(pkg.included || "[]") as string[]

              return (
                <div key={pkg.id} className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 backdrop-blur-md overflow-hidden relative">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="bg-blue-600/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-600/30 uppercase tracking-wider">
                             {pkg.difficulty}
                           </span>
                           <span className="text-slate-900/40 text-xs uppercase tracking-widest">• {pkg.durationDays} {t.days}</span>
                        </div>
                        <h3 className="text-2xl font-serif text-slate-900 mb-2">{pkg.title}</h3>
                        <p className="text-slate-900/60 text-sm italic">{pkg.tagline}</p>
                      </div>

                      <p className="text-slate-900/70 text-sm leading-relaxed">
                        {pkg.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold text-slate-900/40 uppercase tracking-[0.2em]">{t.highlights}</h4>
                          <ul className="space-y-2">
                            {highlights.map((h, i) => (
                              <li key={i} className="text-xs text-slate-900/80 flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                {h}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold text-slate-900/40 uppercase tracking-[0.2em]">{t.included}</h4>
                          <ul className="space-y-2">
                            {included.map((inc, i) => (
                              <li key={i} className="text-xs text-slate-900/60 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                {inc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-64 flex flex-col justify-between items-center p-6 bg-slate-50 rounded-3xl border border-white/5">
                      <div className="text-center">
                        <p className="text-slate-900/40 text-xs uppercase tracking-widest mb-1">{t.priceFrom}</p>
                        <p className="text-4xl font-serif text-slate-900 font-bold">${pkg.basePriceUsd}</p>
                        <p className="text-slate-900/40 text-[10px] mt-1">{t.perPerson}</p>
                      </div>
                      
                      <div className="w-full space-y-3 mt-8">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-900/40 uppercase px-1">
                          <span>{t.intensity}</span>
                          <span className="text-slate-900/80">{pkg.pace}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 rounded-full" style={{ width: pkg.difficulty === 'EASY' ? '30%' : pkg.difficulty === 'MODERATE' ? '60%' : '90%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl">
              <p className="text-slate-900/40">{t.emptyState}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
