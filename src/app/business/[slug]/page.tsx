import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { Star, MapPin, Zap, ArrowLeft, MessageCircle, Clock, ShieldCheck, Heart } from "lucide-react"
import { AsociadoBadge, GastronomicTemplate, ExpeditionTemplate, SanctuaryTemplate } from "@/features/discovery"
import { siteConfig } from "@/lib/config/site"
import { SafeImageWrapper } from "@/components/ui/safe-image"
import { ScrollCarousel } from "@/components/ui/scroll-carousel"
import { ExpandableText } from "@/components/ui/expandable-text"
import { BackButton } from "@/components/ui/back-button"

interface BusinessPageProps {
  params: Promise<{ slug: string }>
}

export const revalidate = 86400; // Cache for 1 day

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const { slug } = await params
  const business = await prisma.business.findUnique({
    where: { slug: slug },
    include: { premiumProfile: true }
  })

  if (!business) {
    return { title: 'Not Found | Vallecito' }
  }

  const categoryName = business.category ? business.category.charAt(0).toUpperCase() + business.category.slice(1).toLowerCase() : business.category
  const locationName = business.locationSlug ? business.locationSlug.charAt(0).toUpperCase() + business.locationSlug.slice(1) : "the Sacred Valley"
  const title = business.seoMetaTitle || `${business.name} — ${categoryName} in ${locationName}`
  const description = business.seoMetaDesc || business.tagline || `Read reviews, view photos, and contact ${business.name} directly. Average rating: ${business.rating?.toFixed(1) || 'New'} stars.`

  const ogImage = business.premiumProfile?.coverPhotoUrl || business.premiumProfile?.logoUrl || `/api/og?title=${encodeURIComponent(business.name)}&description=${encodeURIComponent(categoryName + ' in ' + locationName)}&image=${encodeURIComponent(business.imageUrl || '')}${business.rating ? '&rating=' + business.rating : ''}`

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/business/${business.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/business/${business.slug}`,
      siteName: "Vallecito",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${business.name} - ${categoryName}`,
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
  const { slug } = await params

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
  })

  if (!business) return notFound()

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
    select: { id: true, name: true, slug: true, category: true, rating: true, tagline: true, imageUrl: true, locationSlug: true }
  })

  // Other experiences in same location but DIFFERENT category
  const otherExperiences = await prisma.business.findMany({
    where: {
      locationSlug: business.locationSlug,
      category: { not: business.category },
      rating: { not: null },
    },
    orderBy: [{ isAsociado: 'desc' }, { rating: 'desc' }],
    take: 10,
    select: { id: true, name: true, slug: true, category: true, rating: true, tagline: true, imageUrl: true, locationSlug: true }
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
  const locationName = business.locationSlug ? business.locationSlug.charAt(0).toUpperCase() + business.locationSlug.slice(1) : "the Sacred Valley"

  // Format WhatsApp message
  const whatsappMsg = encodeURIComponent(
    `Hello ${business.name}! 👋 I saw your profile on Vallecito and I'd like to make a reservation. When do you have availability?`
  )

  const isAsociado = business.isAsociado || false
  const isVerified = business.isClaimed || isAsociado

  const schemaTypeMap: Record<string, string> = {
    'DINING': 'Restaurant',
    'AGENCY': 'TravelAgency',
    'WELLNESS': 'HealthAndBeautyBusiness',
    'STAYS': 'LodgingBusiness',
    'CULTURE': 'TouristAttraction',
  }
  const businessType = schemaTypeMap[business.category] || 'LocalBusiness'

  let socialLinks: any[] = []
  try {
    const parsed = business.socialLinks ? JSON.parse(business.socialLinks) : []
    socialLinks = Array.isArray(parsed) ? parsed : []
  } catch(e) {}
  
  const sameAsLinks = socialLinks.map((s: any) => s.url).filter(Boolean)
  if (business.instagramHandle) {
    sameAsLinks.push(`https://instagram.com/${business.instagramHandle.replace('@', '')}`)
  }

  let images = [business.imageUrl].filter(Boolean)
  if (business.premiumProfile?.coverPhotoUrl) images.push(business.premiumProfile.coverPhotoUrl)
  try {
    const heroImages = business.heroImages ? JSON.parse(business.heroImages) : []
    if (Array.isArray(heroImages)) {
      images = [...images, ...heroImages]
    }
  } catch(e) {}

  // JSON-LD Structured Data
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": businessType,
    "name": business.name,
    "image": images.length > 0 ? images : undefined,
    "description": business.description || business.tagline,
    "url": `${siteConfig.url}/business/${business.slug}`,
    "telephone": business.whatsapp ? `+51${business.whatsapp.replace(/\D/g, '')}` : undefined,
    "priceRange": business.priceTier || "$$",
    "sameAs": sameAsLinks.length > 0 ? sameAsLinks : undefined,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": locationName,
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
    jsonLd.review = business.reviews.slice(0, 5).map((review: any) => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating || 5
      },
      "author": {
        "@type": "Person",
        "name": review.author || "Vallecito User"
      },
      "reviewBody": review.text,
      "datePublished": new Date().toISOString().split('T')[0]
    }));
  }

  if (business.tourPackages && business.tourPackages.length > 0) {
    jsonLd.offers = business.tourPackages.map((pkg: any) => ({
      "@type": "Offer",
      "name": pkg.title,
      "description": pkg.description,
      "price": pkg.basePriceUsd,
      "priceCurrency": "USD"
    }));
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteConfig.url
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Explore",
        "item": `${siteConfig.url}/explore`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": locationName,
        "item": `${siteConfig.url}/explore/${business.locationSlug || 'sacred-valley'}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": categoryName,
        "item": `${siteConfig.url}/explore/${business.locationSlug || 'sacred-valley'}/${business.category.toLowerCase()}`
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": business.name,
        "item": `${siteConfig.url}/business/${business.slug}`
      }
    ]
  }

  const primaryColor = business.premiumProfile?.primaryColor || "#09090B";
  const accentColor = business.premiumProfile?.accentColor || "#D4AF37";

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
        <BackButton />
        
        <div className="flex gap-2">
          {isAsociado && <AsociadoBadge className="bg-white text-slate-900 shadow-sm border border-slate-200" />}
        </div>
      </div>

      {/* Mobile Floating Back Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <BackButton 
          label="Back" 
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
              <span className="text-slate-500 font-normal underline decoration-slate-300 hover:decoration-slate-900 cursor-pointer">({business.reviewsCount} reviews)</span>
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
          alt={business.name}
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
             {business.category === 'DINING' && <GastronomicTemplate business={business as any} />}
             {business.category === 'AGENCY' && <ExpeditionTemplate business={business as any} />}
             {business.category === 'WELLNESS' && <SanctuaryTemplate business={business as any} />}
          </section>

          {/* About Section */}
          <section>
            <h2 className="text-2xl font-serif text-slate-900 mb-6">About {business.name}</h2>
            {business.premiumProfile?.visionStatement && (
              <p className="text-xl italic text-slate-700 mb-8 border-l-2 border-rose-300 pl-4">&quot;{business.premiumProfile.visionStatement}&quot;</p>
            )}
            <p className="text-slate-600 leading-relaxed text-lg font-light">
               {business.description || "Discover an authentic experience in the heart of the Sacred Valley. Every detail is designed to offer you the best of our local culture and hospitality."}
            </p>
            {business.premiumProfile?.pillars && business.premiumProfile.pillars.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {business.premiumProfile.pillars.map((pillar: any) => (
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
                <MessageCircle className="w-5 h-5 text-amber-500" /> Traveler Reviews
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {business.reviews.map((review: any) => (
                  <div key={review.id} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col h-full transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-serif text-lg">
                          {review.author.charAt(0)}
                        </div>
                        <div>
                          <p className="text-slate-900 font-medium text-sm">{review.author}</p>
                          <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-0.5">Verified Review</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-100'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <ExpandableText text={review.text} maxLength={180} />
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
              
              <h3 className="font-serif text-2xl text-slate-900 mb-2">Connect Directly</h3>
              <p className="text-slate-500 text-sm mb-8 font-light leading-relaxed">
                Send a message directly to {business.name} to check their current availability and book your visit.
              </p>

              <div className="space-y-6">
                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <Clock className="w-4 h-4 text-amber-500" /> Usually replies within 1 hour
                   </div>
                   <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Local Business
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
                    Check Availability
                  </a>
                ) : (
                  <div className="space-y-4">
                    <a
                      href={`https://wa.me/51940989011?text=${encodeURIComponent(`Hello Vallecito Concierge, I'd like to check availability for ${business.name}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#20b858] text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_-5px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(37,211,102,0.6)] group"
                    >
                      <MessageCircle className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                      Check Availability
                    </a>
                    <p className="text-center text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mt-2">
                      Operated by Vallecito Concierge
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Price Tier Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
               <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                  <span>Price Range</span>
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
              More {categoryName} in {locationName}
            </h2>
            <Link href={`/explore/${business.locationSlug || 'sacred-valley'}/${business.category.toLowerCase()}`} className="text-sm font-medium text-rose-600 hover:text-rose-700 underline decoration-rose-300 hover:decoration-rose-600 transition-colors">
              Browse all {categoryName} &rarr;
            </Link>
          </div>
          <ScrollCarousel>
            {nearby.map(b => (
              <Link
                key={b.id}
                href={`/business/${b.slug}`}
                draggable={false}
                className="snap-start shrink-0 w-64 group bg-white hover:bg-slate-50 shadow-sm hover:shadow-md border border-slate-200 rounded-2xl p-4 transition-all"
              >
                {b.imageUrl && (
                  <SafeImageWrapper
                    src={b.imageUrl}
                    alt={b.name}
                    wrapperClassName="relative w-full aspect-video rounded-xl overflow-hidden mb-3 pointer-events-none"
                    imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1 pointer-events-none">{b.category}</p>
                <p className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2 pointer-events-none">{b.name}</p>
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
        <div className="max-w-5xl mx-auto px-4 pb-16">
          <h2 className="text-lg font-bold text-slate-500 uppercase tracking-widest mb-5">
            Other Experiences in {locationName}
          </h2>
          <ScrollCarousel>
            {otherExperiences.map(b => (
              <Link
                key={b.id}
                href={`/business/${b.slug}`}
                draggable={false}
                className="snap-start shrink-0 w-64 group bg-white hover:bg-slate-50 shadow-sm hover:shadow-md border border-slate-200 rounded-2xl p-4 transition-all"
              >
                {b.imageUrl && (
                  <SafeImageWrapper
                    src={b.imageUrl}
                    alt={b.name}
                    wrapperClassName="relative w-full aspect-video rounded-xl overflow-hidden mb-3 pointer-events-none"
                    imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1 pointer-events-none">{b.category}</p>
                <p className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2 pointer-events-none">{b.name}</p>
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
          Explore Nearby Towns
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {TOWNS.map(town => (
            <Link 
              key={town.slug}
              href={`/explore/${town.slug}/${business.category.toLowerCase()}`}
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
