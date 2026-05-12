import { Map, Calendar, Gauge, CheckCircle2 } from "lucide-react"
import type { Business } from "@prisma/client"

interface ExpeditionTemplateProps {
  business: Business & { tourPackages?: any[] }
}

export function ExpeditionTemplate({ business }: ExpeditionTemplateProps) {
  const packages = business.tourPackages || []

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Map className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-serif text-white">Circuitos & Trekking</h2>
            <p className="text-white/50 text-sm">Próximas expediciones disponibles</p>
          </div>
        </div>

        <div className="space-y-8">
          {packages.length > 0 ? (
            packages.map((pkg) => {
              const highlights = JSON.parse(pkg.highlights || "[]") as string[]
              const included = JSON.parse(pkg.included || "[]") as string[]

              return (
                <div key={pkg.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md overflow-hidden relative">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="bg-blue-600/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-600/30 uppercase tracking-wider">
                             {pkg.difficulty}
                           </span>
                           <span className="text-white/40 text-xs uppercase tracking-widest">• {pkg.durationDays} Days</span>
                        </div>
                        <h3 className="text-2xl font-serif text-white mb-2">{pkg.title}</h3>
                        <p className="text-white/60 text-sm italic">{pkg.tagline}</p>
                      </div>

                      <p className="text-white/70 text-sm leading-relaxed">
                        {pkg.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Highlights</h4>
                          <ul className="space-y-2">
                            {highlights.map((h, i) => (
                              <li key={i} className="text-xs text-white/80 flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                {h}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Included</h4>
                          <ul className="space-y-2">
                            {included.map((inc, i) => (
                              <li key={i} className="text-xs text-white/60 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-white/20" />
                                {inc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-64 flex flex-col justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/5">
                      <div className="text-center">
                        <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Price from</p>
                        <p className="text-4xl font-serif text-white font-bold">${pkg.basePriceUsd}</p>
                        <p className="text-white/40 text-[10px] mt-1">per person</p>
                      </div>
                      
                      <div className="w-full space-y-3 mt-8">
                        <div className="flex items-center justify-between text-[10px] font-bold text-white/40 uppercase px-1">
                          <span>Intensity</span>
                          <span className="text-white/80">{pkg.pace}</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 rounded-full" style={{ width: pkg.difficulty === 'EASY' ? '30%' : pkg.difficulty === 'MODERATE' ? '60%' : '90%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-3xl">
              <p className="text-white/40">Searching for new trails. Expedition dates coming soon!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
