"use client"
import { useEffect, useState } from "react"
import { Phone, Mail, ChevronDown, ChevronUp, Compass, Heart, Target, Mountain, Clock, Map as MapIcon, ArrowRight, Star, Leaf, Users, MapPin, Zap } from "lucide-react"
import { AvailabilityForm } from "@/features/agencies/components/AvailabilityForm"

const IconMap: Record<string, React.ElementType> = {
  Compass, Heart, Target, Mountain, Clock, MapIcon, Star, Leaf, Users, MapPin, Zap
}

function PackageCard({ pkg, agencyPhone, agencyName, onSelectPackage }: { pkg: any, agencyPhone: string, agencyName: string, onSelectPackage: (id: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const gallery = JSON.parse(pkg.galleryJson || "[]")
  const mainImage = pkg.heroImage || gallery[0]?.url || "/images/og-default.jpg"

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col hover:shadow-xl transition-shadow border border-slate-100">
      <div className="aspect-[4/3] w-full relative">
        <img 
          src={mainImage} 
          alt={pkg.title} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="p-8 flex flex-col flex-1">
        <h3 className="text-2xl text-[var(--primary)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>{pkg.title}</h3>
        
        <div className="mb-6 flex-1 text-sm text-slate-600 leading-relaxed">
          <p className={isExpanded ? "" : "line-clamp-3"}>
            {pkg.description}
          </p>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-[var(--accent)] font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 hover:text-[var(--accent-hover)] transition-colors"
          >
            {isExpanded ? (
              <>Read Less <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>Read More <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500 mb-8">
          <span className="bg-slate-100 px-3 py-1.5 rounded-full">{pkg.durationStr || `${pkg.durationDays} Days`}</span>
          <span className="bg-slate-100 px-3 py-1.5 rounded-full">{pkg.difficulty}</span>
        </div>
        
        <a 
          href="#book"
          onClick={() => onSelectPackage(pkg.id)}
          className="mt-auto block w-full text-center bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold py-4 rounded-xl shadow-md transition-colors"
        >
          Book Experience
        </a>
      </div>
    </div>
  )
}

export function ExpeditionOnePage({ business }: { business: any }) {
  const [filter, setFilter] = useState<'ALL' | 'MULTI_DAY' | 'SINGLE_DAY'>('ALL')
  const [selectedExperienceId, setSelectedExperienceId] = useState<string>("")

  // Parse Dynamic Features
  let features = []
  try {
    features = JSON.parse(business.featuresJson || "[]")
  } catch (e) {
    features = []
  }

  // Fallback to Jaguar Llaqta hardcoded values if empty (for backward compatibility during migration)
  if (features.length === 0) {
    features = [
      { title: "Alternative Proposals", desc: "We believe in responsible tourism as a tool for change and learning.", iconName: "Compass" },
      { title: "Backed by Experience", desc: "We have a team of trained professionals with years of experience in the field.", iconName: "Heart" },
      { title: "Integrating Experiences", desc: "We offer a format that allows travelers to immerse in the nature they traverse and be nourished by the native communities they interact with.", iconName: "Target" }
    ]
  }

  const visionMission = business.visionMission || "We create transcendental experiences between the traveler and the living culture of Peru. We hold deep respect for ancestral culture and its sacred sites. We seek to generate experiences that change people."

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth"
    return () => {
      document.documentElement.style.scrollBehavior = "auto"
    }
  }, [])

  const packages = business.tourPackages || []
  
  const displayedPackages = packages.filter((p: any) => {
    if (filter === 'ALL') return true
    if (filter === 'MULTI_DAY') return p.packageType === "MULTI_DAY" || p.durationDays > 1
    if (filter === 'SINGLE_DAY') return p.packageType === "SINGLE_DAY" || p.durationDays <= 1
    return true
  })

  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Sticky Nav - Hidden as per user request */}
      <nav className="hidden fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-xl text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>{business.name}</span>
          <ul className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600 uppercase tracking-widest">
            <li><a href="#about" className="hover:text-[var(--accent)] transition-colors">Why Us</a></li>
            <li><a href="#expeditions" className="hover:text-[var(--accent)] transition-colors">Expeditions</a></li>
            <li><a href="#book" className="hover:text-[var(--accent)] transition-colors">Book</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--primary)]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 overflow-hidden blur-[2px]">
            <img 
              src={business.imageUrl || "/images/og-default.jpg"} 
              alt={business.name} 
              className="w-full h-full object-cover object-[center_20%]" 
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/20 via-[var(--primary)]/75 to-[var(--primary)]" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--accent)]" />
            <div className="w-3 h-3 rotate-45 border-2 border-[var(--accent)]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--accent)]" />
          </div>

          <h2 
            className="text-6xl md:text-7xl lg:text-8xl text-white uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {business.name}
          </h2>

          {business.tagline && (
            <h1 
              className="text-2xl md:text-3xl text-[var(--accent)] uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {business.tagline}
            </h1>
          )}

          {business.description && (
            <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
              {business.description.substring(0, 150)}{business.description.length > 150 ? "..." : ""}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <a
              href="#expeditions"
              className="bg-[var(--accent)] text-[var(--primary)] font-bold text-lg px-8 py-4 rounded transition-all duration-300 hover:bg-[var(--accent-hover)]"
            >
              Our Expeditions
            </a>
            <a
              href="#book"
              className="border border-[var(--accent)] text-[var(--accent)] font-bold text-lg px-8 py-4 rounded transition-all duration-300 hover:bg-[var(--accent)] hover:text-[var(--primary)]"
            >
              Book Now
            </a>
          </div>

          <div className="flex items-center justify-center gap-4 pt-12">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-[var(--accent)]/50" />
            <div className="w-2 h-2 rotate-45 bg-[var(--accent)]/50" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-[var(--accent)]/50" />
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-[var(--accent)]/60" />
        </div>
      </section>

      {/* About & Why Us */}
      <section id="about" className="py-24 px-6 md:px-12 bg-[var(--primary)] relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-20 bg-[var(--accent)]/30" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-20 bg-[var(--accent)]/20" />
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="text-center">
            <h2 
              className="text-4xl md:text-5xl font-bold text-white uppercase tracking-wide mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Why Choose Us?
            </h2>

            <div className="mt-8 space-y-6 max-w-4xl mx-auto">
              <p className="text-[#d1d5db] text-lg leading-[1.8]">
                {visionMission}
              </p>
            </div>

            <div className="mt-20 max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature: any, idx: number) => {
                  const Icon = IconMap[feature.iconName] || Star
                  return (
                    <div key={idx} className="flex flex-row items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-2">
                        <Icon className="w-6 h-6 text-[var(--accent)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 
                          className="text-left text-lg font-bold text-white mb-1"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {feature.title}
                        </h4>
                        <p className="text-[#d1d5db] text-sm text-left leading-[1.7]">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Expeditions */}
      {packages.length > 0 && (
        <section id="expeditions" className="bg-slate-50 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12">
              <p className="text-[var(--accent)] text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Explore</p>
              <h2 className="text-4xl text-[var(--primary)] tracking-tight mb-8" style={{ fontFamily: 'var(--font-display)' }}>Our Experiences</h2>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setFilter('ALL')}
                  className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${filter === 'ALL' ? 'bg-[var(--primary)] text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-[var(--primary)] hover:text-[var(--primary)]'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilter('MULTI_DAY')}
                  className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${filter === 'MULTI_DAY' ? 'bg-[var(--primary)] text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-[var(--primary)] hover:text-[var(--primary)]'}`}
                >
                  Multi-Day Expeditions
                </button>
                <button 
                  onClick={() => setFilter('SINGLE_DAY')}
                  className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${filter === 'SINGLE_DAY' ? 'bg-[var(--primary)] text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-[var(--primary)] hover:text-[var(--primary)]'}`}
                >
                  Single Day
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedPackages.map((pkg: any) => (
                <PackageCard 
                  key={pkg.id} 
                  pkg={pkg} 
                  agencyPhone={business.contactPhone || ""} 
                  agencyName={business.name} 
                  onSelectPackage={(id) => setSelectedExperienceId(id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Form */}
      <AvailabilityForm 
        businessId={business.id}
        agencyName={business.name} 
        whatsapp={business.contactPhone}
        packages={business.tourPackages}
        selectedExperienceId={selectedExperienceId}
      />

      {/* Mobile Sticky Bar */}
      <div className="fixed bottom-0 left-0 w-full z-50 p-4 bg-white/90 backdrop-blur border-t border-slate-200 md:hidden">
        <a 
          href="#book"
          className="block w-full text-center bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold py-4 rounded-xl shadow-lg"
        >
          Book Experience
        </a>
      </div>
    </div>
  )
}
