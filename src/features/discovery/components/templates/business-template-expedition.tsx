import { Map, CheckCircle2, MessageCircle } from "lucide-react"
import type { Business, BusinessService, TourPackage, BusinessPremiumProfile } from "@prisma/client"
import { DICTIONARIES } from "../../constants"
import { ScrollCarousel } from "@/components/ui/scroll-carousel"
import { SafeImageWrapper } from "@/components/ui/safe-image"
import { cn } from "@/lib/utils"

interface ExpeditionTemplateProps {
  business: Business & { services: BusinessService[]; tourPackages?: TourPackage[]; premiumProfile?: BusinessPremiumProfile | null }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict?: Record<string, any>
  locale?: string
}

export function ExpeditionTemplate({ business, dict, locale = 'en' }: ExpeditionTemplateProps) {
  if (!business.isAsociado) return null

  const packages = business.tourPackages || []

  const t = dict?.templates?.expedition || DICTIONARIES.expeditionTemplate
  const isEs = locale === 'es'

  const primaryColor = business.premiumProfile?.primaryColor || '#2563eb'
  const accentColor = business.premiumProfile?.accentColor || '#10b981'

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}1A` }}>
            <Map className="w-6 h-6" style={{ color: primaryColor }} />
          </div>
          <div>
            <h2 className="text-3xl font-serif text-slate-900">{t.title}</h2>
            <p className="text-slate-900/50 text-sm">{t.subtitle}</p>
          </div>
        </div>

        <div className="w-full">
          {packages.length > 0 ? (
            <ScrollCarousel className="mx-0 px-0 items-stretch pb-4 gap-4">
              {packages.map((pkg) => {
                const highlights = JSON.parse(pkg.highlights || "[]") as string[]
                
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
                  <div key={pkg.id} className={cn("w-[300px] md:w-[380px] shrink-0 border rounded-[2rem] overflow-hidden flex flex-col snap-start", business.premiumProfile ? 'premium-card-bg premium-card-border' : 'bg-slate-50 border-slate-200')}>
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
                           <span className={cn("text-xs font-medium px-2 py-1 border rounded-full", business.premiumProfile ? 'premium-card-bg premium-card-border premium-text-main' : 'bg-white text-slate-500 border-slate-200')}>{pkg.durationDays} {t.days}</span>
                        </div>
                        <h3 className={cn("text-xl font-serif mb-1 leading-tight", business.premiumProfile ? 'premium-text-primary premium-font-display' : 'text-slate-900')}>{pkg.title}</h3>
                        <p className={cn("text-sm italic", business.premiumProfile ? 'premium-text-muted' : 'text-slate-500')}>{pkg.tagline}</p>
                      </div>

                      <p className={cn("text-sm leading-relaxed mb-6", business.premiumProfile ? 'premium-text-main' : 'text-slate-600')}>
                        {pkg.description}
                      </p>

                      <div className="space-y-4 mb-8">
                        {highlights.length > 0 && (
                          <div className="space-y-2">
                            <h4 className={cn("text-[10px] font-bold uppercase tracking-widest", business.premiumProfile ? 'premium-text-muted' : 'text-slate-400')}>{t.highlights}</h4>
                            <ul className="space-y-1.5">
                              {highlights.map((h, i) => (
                                <li key={i} className={cn("text-xs flex items-start gap-2", business.premiumProfile ? 'premium-text-main' : 'text-slate-700')}>
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: accentColor }} />
                                  <span className="leading-tight">{h}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className={cn("mt-auto pt-4 border-t flex items-center justify-between", business.premiumProfile ? 'premium-card-border' : 'border-slate-100')}>
                        {business.whatsapp ? (
                          <a 
                            href={whatsappUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full justify-center rounded-xl px-4 py-3 text-xs font-bold transition-transform hover:scale-[1.02] flex items-center gap-1.5 shadow-sm premium-accent-bg premium-accent-text"
                          >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
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
