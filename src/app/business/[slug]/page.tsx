import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { Star, MapPin, Zap, ArrowLeft, MessageCircle, Clock, ShieldCheck, Heart } from "lucide-react"
import { AsociadoBadge } from "@/features/business/components/asociado-badge"
import { GastronomicTemplate } from "@/features/business/components/templates/GastronomicTemplate"
import { ExpeditionTemplate } from "@/features/business/components/templates/ExpeditionTemplate"
import { SanctuaryTemplate } from "@/features/business/components/templates/SanctuaryTemplate"
import { siteConfig } from "@/lib/config/site"

interface BusinessPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const { slug } = await params
  const business = await prisma.business.findUnique({
    where: { slug: slug },
  })

  if (!business) {
    return { title: 'Not Found | Vallecito' }
  }

  const categoryName = business.category ? business.category.charAt(0).toUpperCase() + business.category.slice(1).toLowerCase() : business.category
  const locationName = business.locationSlug ? business.locationSlug.charAt(0).toUpperCase() + business.locationSlug.slice(1) : "the Sacred Valley"
  const title = `${business.name} — ${categoryName} in ${locationName}`
  const description = business.tagline || `Read reviews, view photos, and contact ${business.name} directly. Average rating: ${business.rating?.toFixed(1) || 'New'} stars.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/business/${business.id}`,
      siteName: "Vallecito",
      images: [
        {
          url: business.imageUrl || "/images/og-default.jpg",
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
      images: [business.imageUrl || "/images/og-default.jpg"],
    },
  }
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params

  const business = await prisma.business.findUnique({
    where: { slug: slug },
    include: {
      reviews: true,
      services: true
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
    take: 4,
    select: { id: true, name: true, slug: true, category: true, rating: true, tagline: true, imageUrl: true, locationSlug: true }
  })

  // Format WhatsApp message
  const whatsappMsg = encodeURIComponent(
    `Hello ${business.name}! 👋 I saw your profile on Vallecito and I'd like to make a reservation. When do you have availability?`
  )

  const isAsociado = business.isAsociado || false
  const isVerified = business.isClaimed || isAsociado

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.name,
    "image": business.imageUrl,
    "description": business.tagline || business.description,
    "url": `${siteConfig.url}/business/${business.slug}`,
    "telephone": business.whatsapp ? `+51${business.whatsapp.replace(/\D/g, '')}` : undefined,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": business.locationSlug,
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
  }

  return (
    <div className="min-h-screen bg-[#09090B] font-sans pb-24">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Image Header */}
      <div className="relative h-[50vh] md:h-[60vh] w-full border-b border-white/10">
        <Image
          src={business.imageUrl}
          alt={business.name}
          fill
          priority
          unoptimized
          className="object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/40 to-transparent" />
        
        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 p-6 z-20 max-w-6xl mx-auto flex justify-between items-center">
          <Link 
            href="/explore" 
            className="flex items-center gap-2 text-white/70 hover:text-white bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Explore
          </Link>
          
          <div className="flex gap-2">
            {isAsociado && <AsociadoBadge className="bg-white text-slate-900" />}
            <button className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-colors">
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-20 max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 max-w-3xl">
            <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-bold bg-black/40 px-3 py-1 rounded-full border border-[#D4AF37]/30 backdrop-blur-md self-start">
              {business.category}
            </span>
            <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight drop-shadow-2xl leading-tight">
              {business.name}
            </h1>
            <p className="text-lg md:text-xl text-white/80 font-medium italic drop-shadow-lg max-w-2xl">
              &quot;{business.tagline || business.description.slice(0, 100) + '...'}&quot;
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-2">
              {business.rating !== null && (
                <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  <Star className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
                  <span className="font-bold text-white text-base">{business.rating}</span>
                  <span className="text-sm text-white/50">({business.reviewsCount} reviews)</span>
                </div>
              )}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${business.lat},${business.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white/70 hover:text-white transition-colors text-sm"
              >
                <MapPin className="w-4 h-4" /> {business.locationSlug || "Sacred Valley"}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        
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
            <h2 className="text-2xl font-serif text-white mb-6">About {business.name}</h2>
            <p className="text-white/70 leading-relaxed text-lg font-light">
               {business.description || "Discover an authentic experience in the heart of the Sacred Valley. Every detail is designed to offer you the best of our local culture and hospitality."}
            </p>
          </section>
          
          {/* Reviews Section */}
          <section>
            <h2 className="text-2xl font-serif text-white mb-8 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#D4AF37]" /> Traveler Reviews
            </h2>
            
            {business.reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {business.reviews.map((review) => (
                  <div key={review.id} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm flex flex-col h-full transition-all hover:bg-white/[0.08]">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37]/40 to-transparent border border-white/10 flex items-center justify-center text-white font-serif text-lg">
                          {review.author.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{review.author}</p>
                          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-0.5">Verified Review</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < review.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'fill-white/10 text-white/10'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed italic flex-1">
                      &quot;{review.text}&quot;
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-sm">
                <p className="text-white/50 font-light">No reviews collected for this location yet.</p>
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
              {/* Subtle light effect for Premium businesses */}
              {isAsociado && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 blur-[60px] pointer-events-none" />
              )}
              
              <h3 className="font-serif text-2xl text-white mb-2">Connect Directly</h3>
              <p className="text-white/50 text-sm mb-8 font-light leading-relaxed">
                Connect with {business.name} and avoid platform fees. 100% of your payment goes to the local community.
              </p>

              <div className="space-y-6">
                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-white/70 text-sm">
                      <Clock className="w-4 h-4 text-[#D4AF37]" /> Usually replies within 1 hour
                   </div>
                   <div className="flex items-center gap-3 text-white/70 text-sm">
                      <ShieldCheck className="w-4 h-4 text-[#D4AF37]" /> Verified Local Business
                   </div>
                </div>

                {isVerified && business.whatsapp ? (
                  <a
                    href={`https://wa.me/51${business.whatsapp}?text=${whatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20b858] text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_-5px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(37,211,102,0.6)] group"
                  >
                    <Zap className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                    {isAsociado ? 'Book via WhatsApp' : 'Contact via WhatsApp'}
                  </a>
                ) : (
                  <div className="space-y-4">
                    <Link
                      href={`/claim/${business.id}`}
                      className="w-full bg-white text-black font-bold py-5 rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-zinc-200 shadow-[0_10px_30px_-5px_rgba(255,255,255,0.1)]"
                    >
                      Check Availability
                    </Link>
                    <p className="text-center text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mt-2">
                      Operated by Vallecito Concierge
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Price Tier Info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
               <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-white/40">
                  <span>Price Range</span>
                  <span className="text-emerald-400 font-bold">{business.priceTier || "$$"}</span>
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* Nearby section */}
      {nearby.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pb-16 mt-12">
          <h2 className="text-lg font-bold text-white/70 uppercase tracking-widest mb-5">
            More in {business.locationSlug ? business.locationSlug.charAt(0).toUpperCase() + business.locationSlug.slice(1) : 'the Area'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {nearby.map(b => (
              <Link
                key={b.id}
                href={`/business/${b.slug}`}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all"
              >
                {b.imageUrl && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3">
                    <Image src={b.imageUrl} alt={b.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-1">{b.category}</p>
                <p className="text-sm font-semibold text-white leading-tight line-clamp-2">{b.name}</p>
                {b.rating && (
                  <p className="text-xs text-white/40 mt-1">★ {b.rating.toFixed(1)}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}