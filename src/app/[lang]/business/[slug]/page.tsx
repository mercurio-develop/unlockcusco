/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { Star, MessageCircle, Clock, ShieldCheck } from "lucide-react"
import { 
  AsociadoBadge, 
  GastronomicTemplate, 
  ExpeditionTemplate, 
  SanctuaryTemplate,
  StaysTemplate,
  CultureTemplate,
} from "@/features/discovery"
import { siteConfig } from "@/lib/config/site"
import { SafeImageWrapper } from "@/components/ui/safe-image"
import { ScrollCarousel } from "@/components/ui/scroll-carousel"
import { ExpandableText } from "@/components/ui/expandable-text"
import { BackButton } from "@/components/ui/back-button"
import { getDictionary, Locale } from "@/lib/dictionaries"
import { Business, Review, BusinessService, TourPackage, BusinessPremiumProfile, BusinessPillar } from "@prisma/client"

interface SocialLink {
  platform?: string
  url: string
}

interface BusinessWithRelations extends Business {
  reviews: Review[]
  services: BusinessService[]
  premiumProfile: (BusinessPremiumProfile & {
    pillars: BusinessPillar[]
  }) | null
  tourPackages: TourPackage[]
}

interface JsonLdReview {
  "@type": "Review"
  reviewRating: {
    "@type": "Rating"
    ratingValue: number
  }
  author: {
    "@type": "Person"
    name: string
  }
  reviewBody: string
  datePublished: string
}

interface JsonLd {
  "@context": "https://schema.org"
  "@type": string
  name: string
  image?: string[]
  description: string
  url: string
  telephone?: string
  priceRange: string
  sameAs?: string[]
  address: {
    "@type": "PostalAddress"
    addressLocality: string
    addressRegion: string
    addressCountry: string
  }
  geo?: {
    "@type": "GeoCoordinates"
    latitude: number
    longitude: number
  }
  aggregateRating?: {
    "@type": "AggregateRating"
    ratingValue: number
    reviewCount: number
  }
  review?: JsonLdReview[]
}

interface BusinessPageProps {
  params: Promise<{ slug: string, lang: string }>
}

export const revalidate = 86400; // Cache for 1 day

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const { slug, lang } = await params
  const business = await prisma.business.findUnique({
    where: { slug: slug },
    include: { premiumProfile: true }
  })

  if (!business) {
    return { title: 'Not Found | UnlockCusco' }
  }

  const isEs = lang === 'es'
  const bName = isEs && business.nameEs ? business.nameEs : business.name
  const bCategory = isEs && business.categoryEs ? business.categoryEs : business.category
  const bTagline = isEs && business.taglineEs ? business.taglineEs : business.tagline
  const bSeoMetaTitle = isEs && business.seoMetaTitleEs ? business.seoMetaTitleEs : business.seoMetaTitle
  const bSeoMetaDesc = isEs && business.seoMetaDescEs ? business.seoMetaDescEs : business.seoMetaDesc

  const categoryName = bCategory ? bCategory.charAt(0).toUpperCase() + bCategory.slice(1).toLowerCase() : bCategory
  const locationName = business.locationSlug ? business.locationSlug.charAt(0).toUpperCase() + business.locationSlug.slice(1) : (isEs ? "el Valle Sagrado" : "the Sacred Valley")
  const title = bSeoMetaTitle || `${bName} — ${categoryName} ${isEs ? 'en' : 'in'} ${locationName}`
  const description = bSeoMetaDesc || bTagline || (isEs ? `Lee reseñas, mira fotos y contacta a ${bName} directamente. Calificación: ${business.rating?.toFixed(1) || 'Nuevo'} estrellas.` : `Read reviews, view photos, and contact ${bName} directly. Average rating: ${business.rating?.toFixed(1) || 'New'} stars.`)

  const ogImage = business.premiumProfile?.coverPhotoUrl || business.premiumProfile?.logoUrl || `/api/og?title=${encodeURIComponent(bName || 'UnlockCusco')}&description=${encodeURIComponent((categoryName || '') + (isEs ? ' en ' : ' in ') + locationName)}&image=${encodeURIComponent(business.imageUrl || '')}${business.rating ? '&rating=' + business.rating : ''}`

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/${lang}/business/${business.slug}`,
      languages: {
        en: `${siteConfig.url}/en/business/${business.slug}`,
        es: `${siteConfig.url}/es/business/${business.slug}`,
        'x-default': `${siteConfig.url}/en/business/${business.slug}`,
      }
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/${lang}/business/${business.slug}`,
      siteName: "UnlockCusco",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${bName} - ${categoryName}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug, lang } = await params
  const dict = await getDictionary(lang as Locale)
  const isEs = lang === 'es'

  const business = await prisma.business.findUnique({
    where: { slug: slug },
    include: {
      reviews: true,
      services: true,
      premiumProfile: {
        include: {
          pillars: true
        }
      },
      tourPackages: true
    },
  }) as BusinessWithRelations | null

  if (!business) return notFound()

  // Overwrite business fields for templates if Spanish
  if (isEs) {
    business.name = business.nameEs || business.name
    business.category = business.categoryEs || business.category
    business.tagline = business.taglineEs || business.tagline
    business.description = business.descriptionEs || business.description
    business.specialties = business.specialtiesEs || business.specialties
    
    if (business.services) {
      business.services = business.services.map(s => ({
        ...s,
        title: s.titleEs || s.title,
        description: s.descriptionEs || s.description
      }))
    }
    
    if (business.tourPackages) {
      business.tourPackages = business.tourPackages.map(t => ({
        ...t,
        title: t.titleEs || t.title,
        tagline: t.taglineEs || t.tagline,
        description: t.descriptionEs || t.description,
        included: t.includedEs || t.included,
        highlights: t.highlightsEs || t.highlights,
        itinerary: t.itineraryEs || t.itinerary
      }))
    }

    if (business.premiumProfile) {
      business.premiumProfile.pillars = business.premiumProfile.pillars.map(p => ({
        ...p,
        title: p.titleEs || p.title,
        description: p.descriptionEs || p.description
      }))
    }
  }

  // Nearby businesses in same location + category (for SEO + UX)
  const nearby = await prisma.business.findMany({
    where: {
      locationSlug: business.locationSlug,
      category: business.category,
      slug: { not: slug },
      rating: { not: null },
    },
    orderBy: [{ isAsociado: 'desc' }, { rating: 'desc' }],
    take: 10,
    select: { id: true, name: true, nameEs: true, slug: true, category: true, categoryEs: true, rating: true, tagline: true, taglineEs: true, imageUrl: true, locationSlug: true }
  })

  // Other experiences in same location but DIFFERENT category
  const otherExperiences = await prisma.business.findMany({
    where: {
      locationSlug: business.locationSlug,
      category: { not: business.category || '' },
      rating: { not: null },
    },
    orderBy: [{ isAsociado: 'desc' }, { rating: 'desc' }],
    take: 10,
    select: { id: true, name: true, nameEs: true, slug: true, category: true, categoryEs: true, rating: true, tagline: true, taglineEs: true, imageUrl: true, locationSlug: true }
  })

  const TOWNS = [
    { slug: 'urubamba', name: 'Urubamba' },
    { slug: 'pisac', name: 'Pisac' },
    { slug: 'ollantaytambo', name: 'Ollantaytambo' },
    { slug: 'chinchero', name: 'Chinchero' },
    { slug: 'maras', name: 'Maras' },
    { slug: 'yucay', name: 'Yucay' },
    { slug: 'calca', name: 'Calca' },
    { slug: 'cusco', name: 'Cusco' },
  ].filter(t => t.slug !== business.locationSlug)

  const categoryName = business.category ? business.category.charAt(0).toUpperCase() + business.category.slice(1).toLowerCase() : business.category
  const locationName = business.locationSlug ? business.locationSlug.charAt(0).toUpperCase() + business.locationSlug.slice(1) : (isEs ? "el Valle Sagrado" : "the Sacred Valley")

  // Format WhatsApp message
  const whatsappMsg = encodeURIComponent(
    isEs 
      ? `¡Hola ${business.name}! 👋 Vi su perfil en UnlockCusco y me gustaría hacer una reserva. ¿Cuándo tienen disponibilidad?`
      : `Hello ${business.name}! 👋 I saw your profile on UnlockCusco and I'd like to make a reservation. When do you have availability?`
  )

  const isAsociado = business.isAsociado || false
   
   
  const schemaTypeMap: Record<string, string> = {
    'DINING': 'Restaurant',
    'AGENCY': 'TravelAgency',
    'WELLNESS': 'HealthAndBeautyBusiness',
    'STAYS': 'LodgingBusiness',
    'CULTURE': 'TouristAttraction',
  }
  const businessType = schemaTypeMap[business.category || ''] || 'LocalBusiness'

  let socialLinks: SocialLink[] = []
  try {
    const parsed = business.socialLinks ? JSON.parse(business.socialLinks) : []
    socialLinks = Array.isArray(parsed) ? parsed : []
  } catch(e) {
      console.warn("Failed to parse social links", e)
  }
  
  const sameAsLinks = socialLinks.map((s) => s.url).filter(Boolean)
  if (business.instagramHandle) {
    sameAsLinks.push(`https://instagram.com/${business.instagramHandle.replace('@', '')}`)
  }

  let images = [business.imageUrl].filter(Boolean) as string[]
  if (business.premiumProfile?.coverPhotoUrl) images.push(business.premiumProfile.coverPhotoUrl)
  try {
    const heroImages = business.heroImages ? JSON.parse(business.heroImages) : []
    if (Array.isArray(heroImages)) {
      images = [...images, ...heroImages]
    }
  } catch(e) {
      console.warn("Failed to parse hero images", e)
  }

  // JSON-LD Structured Data
  const jsonLd: JsonLd = {
    "@context": "https://schema.org",
    "@type": businessType,
    "name": business.name || 'Business',
    "image": images.length > 0 ? images : undefined,
    "description": business.description || business.tagline || '',
    "url": `${siteConfig.url}/${lang}/business/${business.slug}`,
    "telephone": business.whatsapp ? `+51${business.whatsapp.replace(/\D/g, '')}` : undefined,
    "priceRange": business.priceTier || "$$",
    "sameAs": sameAsLinks.length > 0 ? sameAsLinks : undefined,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": locationName || '',
      "addressRegion": "Cusco",
      "addressCountry": "PE"
    },
    "geo": (business.lat && business.lng) ? {
      "@type": "GeoCoordinates",
      "latitude": business.lat,
      "longitude": business.lng
    } : undefined,
    "aggregateRating": (business.rating && business.reviewsCount) ? {
      "@type": "AggregateRating",
      "ratingValue": business.rating,
      "reviewCount": business.reviewsCount
    } : undefined
  };

  if (business.reviews && business.reviews.length > 0) {
    jsonLd.review = business.reviews.slice(0, 5).map((review) => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating || 5
      },
      "author": {
        "@type": "Person",
        "name": review.author || "UnlockCusco User"
      },
      "reviewBody": review.text || '',
      "datePublished": new Date().toISOString().split('T')[0]
    }));
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": isEs ? "Inicio" : "Home",
        "item": siteConfig.url
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": dict.nav.explore,
        "item": `${siteConfig.url}/${lang}/explore`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": locationName,
        "item": `${siteConfig.url}/${lang}/explore/${business.locationSlug || 'sacred-valley'}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": categoryName,
        "item": `${siteConfig.url}/${lang}/explore/${business.locationSlug || 'sacred-valley'}/${business.category?.toLowerCase() || 'general'}`
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": business.name,
        "item": `${siteConfig.url}/${lang}/business/${business.slug}`
      }
    ]
  }

  return (
    <div className="min-h-screen font-sans pb-24 bg-white">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      {/* Top Navigation */}
      <div className="p-6 max-w-6xl mx-auto flex justify-between items-center">
        <BackButton label={dict.common.back} />
        
        <div className="flex gap-2">
          {isAsociado && <AsociadoBadge className="bg-white text-slate-900 shadow-sm border border-slate-200" />}
        </div>
      </div>

      {/* Mobile Floating Back Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <BackButton 
          label={dict.common.back} 
          className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-slate-900 px-3 py-2 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.15)] font-bold text-[11px] uppercase tracking-widest border border-slate-200 active:scale-95 transition-transform" 
        />
      </div>

      {/* Header Info */}
      <div className="max-w-6xl mx-auto px-6 pt-4 pb-8">
        <h1 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight leading-tight mb-4">
          {business.name}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {business.rating !== null && (
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Star className="h-4 w-4 fill-slate-900 text-slate-900" />
              <span>{business.rating}</span>
              <span className="text-slate-500 font-normal underline decoration-slate-300 hover:decoration-slate-900 cursor-pointer">({business.reviewsCount} {dict.business.reviews.split(' ')[0].toLowerCase()})</span>
            </div>
          )}
          <span className="text-slate-300">•</span>
          <span className="text-rose-600 font-bold uppercase tracking-widest text-[10px]">{categoryName}</span>
          <span className="text-slate-300">•</span>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${business.lat},${business.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 underline decoration-slate-300 hover:decoration-slate-900 transition-colors font-medium"
          >
            {locationName}
          </a>
        </div>
      </div>

      {/* Hero Image Gallery */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <SafeImageWrapper
          src={business.premiumProfile?.coverPhotoUrl || business.imageUrl || ""}
          alt={business.name || 'Hero'}
          priority={true}
          wrapperClassName="relative h-[40vh] md:h-[60vh] w-full rounded-[2rem] overflow-hidden bg-slate-100"
          imgClassName="w-full h-full object-cover"
        />
      </div>

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* Left Column: Experience Details & Reviews */}
        <div className="lg:col-span-2 space-y-20">
          
          {/* Dynamic Template Content */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             {business.category === 'DINING' && <GastronomicTemplate business={business} dict={dict} />}
             {business.category === 'AGENCY' && <ExpeditionTemplate business={business} dict={dict} />}
             {business.category === 'WELLNESS' && <SanctuaryTemplate business={business} dict={dict} />}
             {business.category === 'STAYS' && <StaysTemplate business={business} dict={dict} />}
             {business.category === 'CULTURE' && <CultureTemplate business={business} dict={dict} />}
          </section>

          {/* About Section */}
          <section>
            <h2 className="text-2xl font-serif text-slate-900 mb-6">{dict.business.about} {business.name}</h2>
            {business.premiumProfile?.visionStatement && (
              <p className="text-xl italic text-slate-700 mb-8 border-l-2 border-rose-300 pl-4">&quot;{business.premiumProfile.visionStatement}&quot;</p>
            )}
            <p className="text-slate-600 leading-relaxed text-lg font-light whitespace-pre-wrap">
               {business.description || (isEs ? "Descubre una experiencia auténtica en el corazón del Valle Sagrado. Cada detalle está diseñado para ofrecerte lo mejor de nuestra cultura local y hospitalidad." : "Discover an authentic experience in the heart of the Sacred Valley. Every detail is designed to offer you the best of our local culture and hospitality.")}
            </p>
            {business.premiumProfile?.pillars && business.premiumProfile.pillars.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {business.premiumProfile.pillars.map((pillar) => (
                  <div key={pillar.id} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                    <h3 className="font-bold mb-2 text-slate-900">{pillar.title}</h3>
                    <p className="text-slate-500 text-sm">{pillar.description}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
          
          {/* Reviews Section */}
          {business.reviews.length > 0 && (
            <section>
              <h2 className="text-2xl font-serif text-slate-900 mb-8 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-amber-500" /> {dict.business.reviews}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {business.reviews.map((review) => (
                  <div key={review.id} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col h-full transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-serif text-lg">
                          {review.author?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-slate-900 font-medium text-sm">{review.author}</p>
                          <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-0.5">{dict.business.verifiedReview}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${(review.rating || 0) > i ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-100'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <ExpandableText text={review.text || ''} maxLength={180} />
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl overflow-hidden relative">
              {/* Subtle light effect for Premium businesses */}
              {isAsociado && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/5 blur-[60px] pointer-events-none" />
              )}
              
              <h3 className="font-serif text-2xl text-slate-900 mb-2">{dict.business.connectDirectly}</h3>
              <p className="text-slate-500 text-sm mb-8 font-light leading-relaxed">
                {isEs 
                  ? `Envía un mensaje directamente a ${business.name} para consultar disponibilidad y reservar tu visita.`
                  : `Send a message directly to ${business.name} to check their current availability and book your visit.`
                }
              </p>

              <div className="space-y-6">
                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <Clock className="w-4 h-4 text-amber-500" /> {dict.business.replyTime}
                   </div>
                   <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> {dict.business.verifiedLocal}
                   </div>
                </div>

                {business.whatsapp ? (
                  <a
                    href={`https://wa.me/51${business.whatsapp}?text=${whatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20b858] text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_-5px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(37,211,102,0.6)] group"
                  >
                    <MessageCircle className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                    {dict.business.checkAvailability}
                  </a>
                ) : (
                  <div className="space-y-4">
                    <a
                      href={`https://wa.me/51940989011?text=${encodeURIComponent(isEs ? `Hola UnlockCusco Concierge, me gustaría consultar la disponibilidad de ${business.name}.` : `Hello UnlockCusco Concierge, I'd like to check availability for ${business.name}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#20b858] text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_-5px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(37,211,102,0.6)] group"
                    >
                      <MessageCircle className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                      {dict.business.checkAvailability}
                    </a>
                    <p className="text-center text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mt-2">
                      {dict.business.operatedBy}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Price Tier Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
               <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                  <span>{dict.business.priceRange}</span>
                  <span className="text-emerald-600 font-bold">{business.priceTier || "$$"}</span>
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* Nearby section */}
      {nearby.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pb-8 mt-12 border-t border-slate-100 pt-12">
          <div className="flex justify-between items-end mb-5">
            <h2 className="text-lg font-bold text-slate-500 uppercase tracking-widest">
              {dict.business.moreIn} {categoryName} {isEs ? 'en' : 'in'} {locationName}
            </h2>
            <Link href={`/${lang}/explore/${business.locationSlug || 'sacred-valley'}/${business.category?.toLowerCase() || 'general'}`} className="text-sm font-medium text-rose-600 hover:text-rose-700 underline decoration-rose-300 hover:decoration-rose-600 transition-colors">
              {isEs ? `Ver todos ${categoryName} →` : `Browse all ${categoryName} →`}
            </Link>
          </div>
          <ScrollCarousel>
            {nearby.map(b => (
              <Link
                key={b.id}
                href={`/${lang}/business/${b.slug}`}
                draggable={false}
                className="snap-start shrink-0 w-64 group bg-white hover:bg-slate-50 shadow-sm hover:shadow-md border border-slate-200 rounded-2xl p-4 transition-all"
              >
                {b.imageUrl && (
                  <SafeImageWrapper
                    src={b.imageUrl}
                    alt={(isEs && b.nameEs ? b.nameEs : b.name) || 'Business'}
                    wrapperClassName="relative w-full aspect-video rounded-xl overflow-hidden mb-3 pointer-events-none"
                    imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1 pointer-events-none">{isEs && b.categoryEs ? b.categoryEs : b.category}</p>
                <p className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2 pointer-events-none">{isEs && b.nameEs ? b.nameEs : b.name}</p>
                {b.rating && (
                  <p className="text-xs text-slate-500 mt-1 pointer-events-none">★ {b.rating.toFixed(1)}</p>
                )}
              </Link>
            ))}
          </ScrollCarousel>
        </div>
      )}

      {/* Other Experiences */}
      {otherExperiences.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pb-16 mt-10">
          <h2 className="text-lg font-bold text-slate-500 uppercase tracking-widest mb-5">
            {dict.business.otherExperiences} {locationName}
          </h2>
          <ScrollCarousel>
            {otherExperiences.map(b => (
              <Link
                key={b.id}
                href={`/${lang}/business/${b.slug}`}
                draggable={false}
                className="snap-start shrink-0 w-64 group bg-white hover:bg-slate-50 shadow-sm hover:shadow-md border border-slate-200 rounded-2xl p-4 transition-all"
              >
                {b.imageUrl && (
                  <SafeImageWrapper
                    src={b.imageUrl}
                    alt={(isEs && b.nameEs ? b.nameEs : b.name) || 'Business'}
                    wrapperClassName="relative w-full aspect-video rounded-xl overflow-hidden mb-3 pointer-events-none"
                    imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1 pointer-events-none">{isEs && b.categoryEs ? b.categoryEs : b.category}</p>
                <p className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2 pointer-events-none">{isEs && b.nameEs ? b.nameEs : b.name}</p>
                {b.rating && (
                  <p className="text-xs text-slate-500 mt-1 pointer-events-none">★ {b.rating.toFixed(1)}</p>
                )}
              </Link>
            ))}
          </ScrollCarousel>
        </div>
      )}

      {/* Explore Nearby Towns */}
      <div className="max-w-5xl mx-auto px-4 pb-24 border-t border-slate-100 pt-16">
        <h2 className="text-xl font-serif text-slate-900 mb-6 text-center">
          {dict.business.exploreNearby}
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {TOWNS.map(town => (
            <Link 
              key={town.slug}
              href={`/${lang}/explore/${town.slug}/${business.category?.toLowerCase() || 'general'}`}
              className="px-6 py-3 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-full text-slate-700 hover:text-rose-700 transition-colors font-medium text-sm shadow-sm hover:shadow-md"
            >
              {town.name}
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
