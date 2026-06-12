import { Map, CheckCircle2, MessageCircle } from "lucide-react"
import type { Business, BusinessService, TourPackage } from "@prisma/client"
import { DICTIONARIES } from "../../constants"
import { ScrollCarousel } from "@/components/ui/scroll-carousel"
import { SafeImageWrapper } from "@/components/ui/safe-image"

interface ExpeditionTemplateProps {
  business: Business & { services: BusinessService[]; tourPackages?: TourPackage[] }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict?: Record<string, any>
  locale?: string
}

export function ExpeditionTemplate({ business, dict, locale = 'en' }: ExpeditionTemplateProps) {
  if (!business.isAsociado) return null

  const packages = business.tourPackages || []

  const t = dict?.templates?.expedition || DICTIONARIES.expeditionTemplate
  const isEs = locale === 'es'

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
            <Map className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-serif text-slate-900">{t.title}</h2>
            <p className="text-slate-900/50 text-sm">{t.subtitle}</p>
          </div>
        </div>

        <div className="-mx-4 sm:mx-0">
          {packages.length > 0 ? (
            <ScrollCarousel className="w-full gap-4 pb-4 px-4 sm:px-0 items-stretch">
              {packages.map((pkg) => {
                const highlights = JSON.parse(pkg.highlights || "[]") as string[]
                const included = JSON.parse(pkg.included || "[]") as string[]
                
                let gallery: string[] = []
                try {
                  gallery = JSON.parse(pkg.gallery || "[]")
                } catch {
                  gallery = []
                }
                const heroImage = gallery.length > 0 ? gallery[0] : null

                const whatsappMsg = encodeURIComponent(
                  isEs 
                    ? `¡Hola ${business.name}! 👋 Vi su perfil en UnlockCusco y me interesa obtener más información sobre el paquete: "${pkg.title}".`
                    : `Hello ${business.name}! 👋 I saw your profile on UnlockCusco and I'm interested in getting more information about the package: "${pkg.title}".`
                )
                
                const whatsappUrl = business.whatsapp 
                  ? `https://wa.me/51${business.whatsapp.replace(/\D/g, '')}?text=${whatsappMsg}`
                  : "#"

                return (
                  <div key={pkg.id} className="w-[300px] md:w-[380px] shrink-0 bg-slate-50 border border-slate-200 rounded-[2rem] overflow-hidden flex flex-col snap-start">
                    {heroImage && (
                      <div className="w-full h-48 relative shrink-0">
                        <SafeImageWrapper
                          src={heroImage}
                          alt={pkg.title}
                          wrapperClassName="w-full h-full"
                          imgClassName="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                           <span className="bg-blue-600/10 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-600/20 uppercase tracking-wider">
                             {pkg.difficulty}
                           </span>
                           <span className="text-slate-500 text-xs font-medium bg-white px-2 py-1 border border-slate-200 rounded-full">{pkg.durationDays} {t.days}</span>
                        </div>
                        <h3 className="text-xl font-serif text-slate-900 mb-1 leading-tight">{pkg.title}</h3>
                        <p className="text-slate-500 text-sm italic">{pkg.tagline}</p>
                      </div>

                      <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        {pkg.description}
                      </p>

                      <div className="space-y-4 mb-8">
                        {highlights.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.highlights}</h4>
                            <ul className="space-y-1.5">
                              {highlights.map((h, i) => (
                                <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <span className="leading-tight">{h}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {included.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.included}</h4>
                            <ul className="space-y-1.5">
                              {included.slice(0, 4).map((inc, i) => (
                                <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                                  <div className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                                  <span className="leading-tight truncate">{inc}</span>
                                </li>
                              ))}
                              {included.length > 4 && (
                                <li className="text-[10px] text-slate-400 italic">
                                  + {included.length - 4} {isEs ? 'más' : 'more'}
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="w-1/2 pr-4 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                            <span>{t.intensity}</span>
                            <span className="text-slate-600">{pkg.pace}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500 rounded-full" style={{ width: pkg.difficulty === 'EASY' ? '30%' : pkg.difficulty === 'MODERATE' ? '60%' : '90%' }} />
                          </div>
                        </div>
                        {business.whatsapp ? (
                          <a 
                            href={whatsappUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-4 py-2 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            {isEs ? 'Consultar' : 'Inquire'}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </ScrollCarousel>
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
