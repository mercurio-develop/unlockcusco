"use client"
import { useEffect } from "react"
import { Phone, Mail, Compass, Heart, Target, Star, Leaf, Users, MapPin, Zap } from "lucide-react"

const IconMap: Record<string, React.ElementType> = {
  Compass, Heart, Target, Star, Leaf, Users, MapPin, Zap
}

export function SanctuaryOnePage({ agency }: { agency: any }) {
  // Parse Dynamic Features
  let features = []
  try {
    features = JSON.parse(agency.featuresJson || "[]")
  } catch (e) {
    features = []
  }

  const visionMission = agency.visionMission || agency.description || ""
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth"
    return () => {
      document.documentElement.style.scrollBehavior = "auto"
    }
  }, [])

  const treatments = agency.tourPackages?.filter((p: any) => p.packageType === "TREATMENT" || p.packageType === "SINGLE_DAY" || p.durationDays <= 1) || []
  const retreats = agency.tourPackages?.filter((p: any) => p.packageType === "MULTI_DAY" || p.durationDays > 1) || []

  return (
    <div className="bg-[#FAFAF9] min-h-screen text-slate-800" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Minimal Sticky Nav - Hidden as per user request */}
      <nav className="hidden fixed top-0 w-full z-50 bg-[#FAFAF9]/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-medium text-lg text-slate-700 tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>{agency.name}</span>
          <ul className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            <li><a href="#lineage" className="hover:text-amber-700 transition-colors">Lineage</a></li>
            <li><a href="#menu" className="hover:text-amber-700 transition-colors">Menu</a></li>
            <li><a href="#retreats" className="hover:text-amber-700 transition-colors">Retreats</a></li>
            <li><a href="#contact" className="hover:text-amber-700 transition-colors">Contact</a></li>
          </ul>
        </div>
      </nav>

      {/* Serene Hero */}
      <section id="hero" className="relative h-[70vh] flex items-center justify-center pt-16 bg-slate-100">
        <div className="absolute inset-0 z-0">
          <img 
            src={agency.imageUrl || "/images/og-default.jpg"} 
            alt={agency.name} 
            className="w-full h-full object-cover opacity-80 mix-blend-multiply" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAF9] via-transparent to-transparent" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-3xl">
          {agency.logoUrl && <img src={agency.logoUrl} alt="Logo" className="w-20 h-20 mx-auto mb-8 rounded-full shadow-sm" />}
          <h1 className="text-5xl md:text-7xl font-light mb-6 text-slate-800 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{agency.name}</h1>
          <p className="text-lg md:text-xl font-light text-slate-600 max-w-2xl mx-auto">{agency.tagline}</p>
        </div>
      </section>

      {/* Lineage */}
      <section id="lineage" className="py-24 px-6 max-w-4xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-8 shadow-md border-4 border-white">
            <img src={agency.imageUrl || "/images/og-default.jpg"} alt="Guide" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xs font-bold text-amber-700 uppercase tracking-[0.3em] mb-4">The Lineage</h2>
          <div className="prose prose-lg text-slate-600 font-light leading-relaxed text-center" dangerouslySetInnerHTML={{ __html: agency.aboutHtml || agency.description }} />
        </div>
      </section>

      {/* Menu (Airy Vertical List) */}
      <section id="menu" className="py-24 px-6 max-w-3xl mx-auto border-t border-slate-200/50">
        <h2 className="text-3xl text-center mb-16 text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>Therapies & Ceremonies</h2>
        <div className="space-y-8">
          {treatments.map((pkg: any) => (
            <div key={pkg.id} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 group">
              <div className="flex-1">
                <h3 className="text-xl text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>{pkg.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{pkg.description}</p>
              </div>
              <div className="hidden sm:block flex-1 border-b border-dotted border-slate-300 mx-4 mb-2 opacity-30 group-hover:opacity-100 transition-opacity" />
              <div className="shrink-0 text-right">
                <div className="font-medium text-slate-800">${pkg.basePriceUsd}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">{pkg.durationStr || `${pkg.durationDays} Days`}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Retreats */}
      {retreats.length > 0 && (
        <section id="retreats" className="py-24 px-6 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl text-center mb-16 text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>Immersive Retreats</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {retreats.map((pkg: any) => (
                <div key={pkg.id} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-2xl text-slate-800 mb-4" style={{ fontFamily: 'var(--font-display)' }}>{pkg.title}</h3>
                  <p className="text-slate-600 mb-6 font-light">{pkg.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 font-medium">{pkg.durationStr || `${pkg.durationDays} Days`}</span>
                    <span className="text-lg font-medium text-amber-700">${pkg.basePriceUsd}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="py-32 px-6 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl mb-6 text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>Sacred Space, Anywhere</h2>
        <p className="text-lg text-slate-600 font-light mb-12">
          Whether you prefer the tranquil environment of our studio or the comfort of your own basecamp, we bring the sanctuary to you. 
          Reach out to coordinate logistics.
        </p>
        <a 
          href={`https://wa.me/${(agency.contactPhone || "").replace(/\D/g, '')}`} 
          target="_blank" rel="noreferrer" 
          className="inline-flex items-center gap-3 bg-amber-700 hover:bg-amber-800 text-white px-10 py-4 rounded-full font-medium transition-colors"
        >
          <Phone className="w-5 h-5" /> Contact via WhatsApp
        </a>
      </section>

      {/* Mobile Sticky Bar */}
      <div className="fixed bottom-0 left-0 w-full z-50 p-4 bg-white/95 backdrop-blur border-t border-slate-100 md:hidden">
        <a 
          href={`https://wa.me/${(agency.contactPhone || "").replace(/\D/g, '')}`}
          target="_blank" rel="noreferrer"
          className="block w-full text-center bg-amber-700 hover:bg-amber-800 text-white font-medium py-4 rounded-full shadow-lg"
        >
          ✨ Book a Session
        </a>
      </div>
    </div>
  )
}
