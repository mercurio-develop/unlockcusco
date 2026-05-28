/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { Star, MessageCircle, Clock, ShieldCheck, MapPin } from "lucide-react"
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
import { BusinessCard } from "@/features/discovery/components/business-card"
import { VerifyOverlay } from "./verify-overlay"
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

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

interface JsonLdProps {
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
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
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
  const description = bSeoMetaDesc || bTagline || (isEs ? `Lee reseñas, mira fotos y contacta a ${bName} directamente. Calificación: ${business.rating?.toFixed(1) || 'Nuevo'} estrellas.` : `Read reviews, view photos, and contact ${bName} directamente. Average rating: ${business.rating?.toFixed(1) || 'New'} stars.`)

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

export default async function BusinessPage({ params, searchParams }: BusinessPageProps) {
  const { slug, lang } = await params
  const resolvedSearchParams = await searchParams
  const verifyToken = resolvedSearchParams?.verify as string | undefined

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

  // Use longDescription if available, fallback to short Zagat description
  business.description = business.longDescription || business.description

  // Overwrite business fields for templates if Spanish
  if (isEs) {
    business.name = business.nameEs || business.name
    business.category = business.categoryEs || business.category
    business.tagline = business.taglineEs || business.tagline
    // Use Spanish longDescription if available, fallback to existing
    business.description = business.longDescriptionEs || business.descriptionEs || business.description
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

  // Fetch nearby stays and dining for Boleto businesses
  let nearbyStays: Business[] = [];
  let nearbyDining: Business[] = [];
  
  if (business.category?.toUpperCase() === 'BOLETO' && business.lat !== null && business.lng !== null && business.locationSlug) {
    const candidates = await prisma.business.findMany({
      where: {
        locationSlug: business.locationSlug,
        category: {
          in: ['Stays', 'STAYS', 'stay', 'Stay', 'Dining', 'DINING', 'Meal', 'meal']
        },
        id: { not: business.id }
      },
      omit: {
        longDescription: true,
        longDescriptionEs: true,
        seoMetaDescEs: true,
        openingHours: true,
        heroImages: true,
        socialLinks: true,
        featuresJson: true,
        themeConfig: true,
      }
    });

    const candidatesWithDistance = candidates.map(c => {
       const dist = (c.lat !== null && c.lng !== null && business.lat !== null && business.lng !== null) 
         ? getDistanceKm(c.lat, c.lng, business.lat, business.lng)
         : 999;
       return { ...c, dist };
    }).sort((a, b) => a.dist - b.dist);

    nearbyStays = candidatesWithDistance.filter(c => ['Stays', 'STAYS', 'stay', 'Stay'].includes(c.category)).map(({ dist, ...rest }) => rest as Business).slice(0, 8);
    nearbyDining = candidatesWithDistance.filter(c => ['Dining', 'DINING', 'Meal', 'meal'].includes(c.category)).map(({ dist, ...rest }) => rest as Business).slice(0, 8);
  }

  const categoryName = business.category ? business.category.charAt(0).toUpperCase() + business.category.slice(1).toLowerCase() : business.category
  const locationName = business.locationSlug ? business.locationSlug.charAt(0).toUpperCase() + business.locationSlug.slice(1) : (isEs ? "el Valle Sagrado" : "the Sacred Valley")
  const bName = isEs && business.nameEs ? business.nameEs : business.name

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonLd: any = {
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
    <main className="min-h-screen bg-gray-50 pb-24 lg:pb-12 relative selection:bg-rose-100 selection:text-rose-900">
      {verifyToken && business.verificationToken === verifyToken && (
        <VerifyOverlay businessId={business.id} token={verifyToken} lang={lang} />
      )}
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="absolute top-4 left-4 lg:left-auto lg:right-[calc(50%+24rem+1rem)] z-50">
        <BackButton className="bg-white/80 backdrop-blur-md shadow-sm" />
      </div>
      
      {/* 1. Hero Image Carousel */}
      <section className="relative w-full h-[40vh] min-h-[300px] lg:h-[50vh] lg:max-w-6xl lg:mx-auto lg:rounded-b-3xl overflow-hidden bg-slate-200 shadow-sm">
        <ScrollCarousel className="w-full h-full [&>div]:snap-start">
          {images.map((url, i) => (
            <div key={i} className="relative w-screen lg:w-full h-[40vh] min-h-[300px] lg:h-[50vh] flex-shrink-0">
               <SafeImageWrapper 
                  src={url} 
                  alt={bName || ''} 
                  wrapperClassName="w-full h-full"
                  imgClassName="w-full h-full object-cover"
                  priority={i === 0}
                />
            </div>
          ))}
        </ScrollCarousel>
        
        {/* Trust Signal Overlay */}
        <div className="absolute -bottom-4 right-4 z-10 bg-white px-4 py-1.5 rounded-full shadow-md border border-slate-100 flex items-center gap-1 lg:hidden">
           <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
           <span className="font-medium text-sm text-slate-900">{business.rating?.toFixed(1) || 'New'}</span>
           <span className="text-xs text-slate-500 ml-1">({business.reviewsCount || 0})</span>
        </div>
      </section>

      {/* Main Grid Layout */}
      <div className="lg:max-w-6xl lg:mx-auto lg:px-6 lg:py-12 lg:grid lg:grid-cols-3 lg:gap-12">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2">
          {/* 2. Header Section */}
          <section className="px-4 lg:px-0 pt-8 lg:pt-0 pb-6 bg-white lg:bg-transparent -mt-6 lg:mt-0 relative z-20 rounded-t-[2rem] lg:rounded-none">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl lg:text-4xl font-serif text-slate-900 leading-tight">
                {bName}
              </h1>
              {business.isAsociado && <AsociadoBadge className="mt-1 flex-shrink-0" />}
            </div>
            
            {/* Quick Info Strip */}
            <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-slate-600 mb-6">
              <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium text-slate-700">{categoryName}</span>
              <span>•</span>
              <span className="font-medium">{business.priceTier || '$$'}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                 <MapPin className="w-3.5 h-3.5" />
                 <span>{locationName}</span>
              </div>
            </div>

            {/* Business Description */}
            {business.description && (
              <div className="mt-4">
                <ExpandableText text={business.description} maxLength={180} />
              </div>
            )}
          </section>

          {/* 3. Category-Specific Body */}
          <div className="bg-white lg:bg-transparent">
            {(business.category?.toLowerCase() === 'dining') && (
              <GastronomicTemplate business={business as any} dict={dict} />
            )}
            {(business.category?.toLowerCase() === 'agency' || business.category?.toLowerCase() === 'adventure') && (
              <ExpeditionTemplate business={business as any} dict={dict} />
            )}
            {(business.category?.toLowerCase() === 'wellness') && (
              <SanctuaryTemplate business={business as any} dict={dict} />
            )}
            {(business.category?.toLowerCase() === 'stays') && (
              <StaysTemplate business={business as any} dict={dict} />
            )}
            {(business.category?.toLowerCase() === 'culture' || business.category?.toLowerCase() === 'shopping' || business.category?.toLowerCase() === 'boleto') && (
              <CultureTemplate business={business as any} dict={dict} />
            )}
          </div>

          {/* 4. Reviews Section */}
          {business.reviews && business.reviews.length > 0 && (
             <section className="px-4 lg:px-0 py-8 bg-slate-50 lg:bg-transparent">
                <h2 className="text-xl lg:text-2xl font-serif text-slate-900 mb-6">{dict.business.reviews}</h2>
                <ScrollCarousel className="-mx-4 px-4 pb-4 lg:mx-0 lg:px-0">
                  {business.reviews.map((review) => (
                    <div key={review.id} className="w-[280px] lg:w-[320px] flex-shrink-0 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                          {review.author?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{review.author}</p>
                          <div className="flex mt-0.5">
                            {[...Array(review.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <ExpandableText text={review.text || ''} maxLength={180} />
                    </div>
                  ))}
                </ScrollCarousel>
             </section>
          )}
        </div>

        {/* Right Column (Sticky Action Card) - DESKTOP ONLY */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            {/* Trust Signal */}
            <div className="flex flex-col items-center justify-center mb-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                <span className="font-bold text-2xl text-slate-900">{business.rating?.toFixed(1) || 'New'}</span>
              </div>
              <span className="text-sm font-medium text-slate-500 underline decoration-slate-200 cursor-pointer hover:text-slate-900 transition-colors">
                {business.reviewsCount || 0} {dict.business.reviews}
              </span>
            </div>

            {/* Desktop CTA */}
            {business.category?.toUpperCase() !== 'BOLETO' && (
              <>
                {business.whatsapp && business.isAsociado ? (
                  <a
                    href={`https://wa.me/51${business.whatsapp.replace(/\D/g, '')}?text=${whatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-4 px-4 rounded-xl text-white font-bold text-[15px] shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    style={{ 
                      backgroundColor: business.premiumProfile?.primaryColor || '#10b981' 
                    }}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    {isEs ? 'Contactar por WhatsApp' : 'Contact via WhatsApp'}
                  </a>
                ) : (
                  <button 
                    disabled
                    className="flex items-center justify-center w-full py-4 px-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-[15px]"
                  >
                    {isEs ? 'Contacto no disponible' : 'Contact Not Available'}
                  </button>
                )}
                
                <p className="text-center text-xs font-medium text-slate-400 mt-4 uppercase tracking-widest">
                  {dict.business.replyTime || "Usually replies within 1 hour"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Nearby Stays and Dining (Boleto Only) */}
      {business.category?.toUpperCase() === 'BOLETO' && (nearbyStays.length > 0 || nearbyDining.length > 0) && (
        <div className="lg:max-w-6xl lg:mx-auto lg:px-6 pt-4 pb-12">
          {nearbyStays.length > 0 && (
            <section className="px-4 lg:px-0 py-8 border-t border-slate-200/60">
              <h2 className="text-xl lg:text-2xl font-serif text-slate-900 mb-6">{isEs ? 'Alojamientos Cercanos' : 'Nearby Stays'}</h2>
              <ScrollCarousel className="-mx-4 px-4 pb-4 lg:mx-0 lg:px-0">
                {nearbyStays.map((stay) => (
                  <div key={stay.id} className="w-[280px] lg:w-[320px] flex-shrink-0">
                    <BusinessCard
                      business={stay}
                      orientation="vertical"
                      showItineraryAdd={true}
                      dict={dict}
                    />
                  </div>
                ))}
              </ScrollCarousel>
            </section>
          )}

          {nearbyDining.length > 0 && (
            <section className="px-4 lg:px-0 py-8 border-t border-slate-200/60">
              <h2 className="text-xl lg:text-2xl font-serif text-slate-900 mb-6">{isEs ? 'Restaurantes Cercanos' : 'Nearby Dining'}</h2>
              <ScrollCarousel className="-mx-4 px-4 pb-4 lg:mx-0 lg:px-0">
                {nearbyDining.map((dining) => (
                  <div key={dining.id} className="w-[280px] lg:w-[320px] flex-shrink-0">
                    <BusinessCard
                      business={dining}
                      orientation="vertical"
                      showItineraryAdd={true}
                      dict={dict}
                    />
                  </div>
                ))}
              </ScrollCarousel>
            </section>
          )}
        </div>
      )}

      {/* 5. Sticky Action Bar - MOBILE ONLY */}
      {business.category?.toUpperCase() !== 'BOLETO' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 z-40 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {business.whatsapp && business.isAsociado ? (
            <a
              href={`https://wa.me/51${business.whatsapp.replace(/\D/g, '')}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full py-3.5 px-4 rounded-xl text-white font-medium text-[15px] shadow-sm transition-transform active:scale-[0.98]"
              style={{ 
                backgroundColor: business.premiumProfile?.primaryColor || '#10b981' // WhatsApp Green default
              }}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {isEs ? 'Contactar por WhatsApp' : 'Contact via WhatsApp'}
            </a>
          ) : (
            <button 
              disabled
              className="flex items-center justify-center w-full py-3.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-medium text-[15px]"
            >
              {isEs ? 'Contacto no disponible' : 'Contact Not Available'}
            </button>
          )}
        </div>
      )}
    </main>
  )
}
