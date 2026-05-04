import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { Star, MapPin, Zap, ArrowLeft, MessageCircle, Clock, ShieldCheck } from "lucide-react"

interface BusinessPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const { slug } = await params
  const business = await prisma.business.findUnique({
    where: { id: slug },
  })

  if (!business) {
    return { title: 'Not Found | Vallecito' }
  }

  const categoryName = business.categorySlug ? business.categorySlug.charAt(0).toUpperCase() + business.categorySlug.slice(1) : business.category
  const locationName = business.locationSlug ? business.locationSlug.charAt(0).toUpperCase() + business.locationSlug.slice(1) : "the Sacred Valley"
  const title = `${business.name} — ${categoryName} in ${locationName}`
  const description = `Read reviews, view photos, and contact ${business.name} directly. Average rating: ${business.scoreQuality ? (business.scoreQuality / 20).toFixed(1) : 'New'} stars.`

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
    where: { id: slug },
    include: { reviews: true },
  })

  if (!business) return notFound()

  // Format WhatsApp message
  const whatsappMsg = encodeURIComponent(
    `Hello ${business.name}! 👋 I saw your profile on Vallecito and I'd like to make a reservation. When do you have availability?`
  )

  return (
    <div className="min-h-screen bg-[#09090B] font-sans pb-24">
      {/* Hero Image Header */}
      <div className="relative h-[40vh] md:h-[50vh] w-full border-b border-white/10">
        <Image
          src={business.imageUrl || 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop'}
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
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Link>
          
          {business.isClaimed && (
            <div className="flex items-center gap-1.5 bg-[#25D366]/20 backdrop-blur-md border border-[#25D366]/30 text-[#25D366] text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Confiable
            </div>
          )}
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-semibold bg-black/40 px-3 py-1 rounded-full border border-[#D4AF37]/30 backdrop-blur-md mb-4 inline-block">
                {business.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-serif text-white tracking-tight drop-shadow-2xl leading-tight">
                {business.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mt-4">
                {business.rating !== null && (
                  <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <Star className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
                    <span className="font-bold text-white text-base">{business.rating}</span>
                    <span className="text-sm text-white/50">({business.reviewsCount} verified reviews)</span>
                  </div>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${business.lat},${business.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white/70 hover:text-white transition-colors text-sm"
                >
                  <MapPin className="w-4 h-4" /> View on Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Reviews & Details */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Reviews Section */}
          <section>
            <h2 className="text-2xl font-serif text-white mb-6 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#D4AF37]" /> Traveler Reviews
            </h2>
            
            {business.reviews.length > 0 ? (
              <div className="space-y-4">
                {business.reviews.map((review) => (
                  <div key={review.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37]/40 to-transparent border border-white/10 flex items-center justify-center text-white font-serif text-lg">
                          {review.author.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{review.author}</p>
                          <p className="text-white/40 text-xs mt-0.5">Google Maps Review</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'fill-white/10 text-white/10'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed italic">
                      &quot;{review.text}&quot;
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-sm">
                <p className="text-white/50 font-light">No reviews collected for this location yet.</p>
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="lg:col-span-1 relative">
          <div className="sticky top-24 bg-[#09090B]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-serif text-xl text-white mb-2">Book Your Experience</h3>
            <p className="text-white/50 text-sm mb-6 font-light">
              Connect directly with {business.name}. No hidden fees or commissions.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/70 text-sm bg-white/5 p-3 rounded-xl border border-white/5">
                <Clock className="w-4 h-4 text-[#D4AF37]" /> Usually replies within 1 hour
              </div>

              {business.isClaimed && business.whatsapp ? (
                <a
                  href={`https://wa.me/51${business.whatsapp}?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20b858] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_-5px_rgba(37,211,102,0.4)] hover:shadow-[0_0_40px_-5px_rgba(37,211,102,0.6)]"
                >
                  <Zap className="w-4 h-4 fill-current" /> Book via WhatsApp
                </a>
              ) : (
                <div className="space-y-3">
                  <Link
                    href={`/claim/${business.id}`}
                    className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-zinc-200 shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)]"
                  >
                    Check Availability
                  </Link>
                  <p className="text-center text-[10px] text-white/40 uppercase tracking-wide font-semibold mt-2">
                    Operated by Vallecito Concierge
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}