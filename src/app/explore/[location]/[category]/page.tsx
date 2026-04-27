import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Star, Zap, MapPin } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 86400
export const dynamicParams = true

const LOCATION_LABELS: Record<string, string> = {
  urubamba: 'Urubamba',
  pisac: 'Pisac',
  ollantaytambo: 'Ollantaytambo',
  chinchero: 'Chinchero',
  maras: 'Maras',
  yucay: 'Yucay',
  calca: 'Calca',
  cusco: 'Cusco',
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  gastronomia: { label: 'Gastronomía', emoji: '🍽️' },
  bienestar:   { label: 'Bienestar',   emoji: '🧘' },
  aventura:    { label: 'Aventura',    emoji: '🥾' },
  descanso:    { label: 'Descanso',    emoji: '🛌' },
  cultura:     { label: 'Cultura',     emoji: '🏺' },
}

export async function generateStaticParams() {
  const combinations = await prisma.business.groupBy({
    by: ['locationSlug', 'categorySlug'],
  })
  return combinations
    .filter(c => c.locationSlug && c.categorySlug)
    .map(c => ({ location: c.locationSlug, category: c.categorySlug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string; category: string }>
}): Promise<Metadata> {
  const { location, category } = await params
  const loc = LOCATION_LABELS[location] ?? location
  const cat = CATEGORY_LABELS[category] ?? { label: category, emoji: '📍' }
  return {
    title: `${cat.emoji} ${cat.label} en ${loc} — InkaPortal Sacred Valley`,
    description: `Descubre los mejores negocios de ${cat.label} en ${loc}, Valle Sagrado. Reservas directas sin comisiones vía WhatsApp.`,
    openGraph: {
      title: `${cat.label} en ${loc} | InkaPortal`,
      description: `Los mejores de ${cat.label} en ${loc}, Valle Sagrado del Cusco.`,
    },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ location: string; category: string }>
}) {
  const { location, category } = await params

  const localBusinesses = await prisma.business.findMany({
    where: { locationSlug: location, categorySlug: category },
    orderBy: { rating: 'desc' },
  })

  if (localBusinesses.length === 0) return notFound()

  const loc = LOCATION_LABELS[location] ?? location
  const cat = CATEGORY_LABELS[category] ?? { label: category, emoji: '📍' }

  return (
    <div className="min-h-screen bg-[#09090B] font-sans">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-30 mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1526392060635-9d60198d3fe3?q=80&w=3000&auto=format&fit=crop"
            className="w-full h-full object-cover"
            alt=""
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090B]/60 to-[#09090B]" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
          <Link href="/explore" className="text-white/40 hover:text-white/70 text-sm transition-colors mb-6 inline-block">
            ← Explore
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em]">Sacred Valley</span>
            <span className="text-white/20">·</span>
            <span className="text-white/40 text-xs uppercase tracking-widest">{loc}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-white tracking-tight">
            {cat.emoji} {cat.label}
          </h1>
          <p className="mt-3 text-white/50 text-lg font-light">
            {localBusinesses.length} lugares verificados en {loc}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localBusinesses.map((business) => (
            <div
              key={business.id}
              className="group relative flex flex-col rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md hover:border-white/20 hover:shadow-[0_0_40px_-10px_rgba(212,175,55,0.15)] transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={business.imageUrl}
                  alt={business.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {business.isClaimed && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#25D366] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    <Zap className="w-2.5 h-2.5 fill-current" /> Instant
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5">
                <div className="flex justify-between items-start gap-3 mb-4">
                  <h2 className="font-bold text-white text-lg leading-tight line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
                    {business.name}
                  </h2>
                  {business.rating !== null && (
                    <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/10 shrink-0">
                      <Star className="h-3.5 w-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                      <span className="font-bold text-sm text-white">{business.rating}</span>
                    </div>
                  )}
                </div>

                {business.reviewsCount > 0 && (
                  <p className="text-white/40 text-xs mb-4">{business.reviewsCount} reseñas</p>
                )}

                <div className="mt-auto space-y-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${business.lat},${business.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors"
                  >
                    <MapPin className="w-3 h-3" /> Ver en Google Maps
                  </a>

                  {business.isClaimed && business.whatsapp ? (
                    <a
                      href={`https://wa.me/51${business.whatsapp}?text=${encodeURIComponent(`¡Hola ${business.name}! Vi tu perfil en InkaPortal y me gustaría reservar. ¿Tienen disponibilidad?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-green-600 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
                    >
                      Reservar ahora
                    </a>
                  ) : (
                    <Link
                      href={`/claim/${business.id}`}
                      className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-sm font-medium py-3 rounded-xl transition-colors"
                    >
                      Consultar disponibilidad
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
