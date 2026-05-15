import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SafeImageWrapper } from '@/components/ui/safe-image'
import { Star, Zap, MapPin } from 'lucide-react'
import Link from 'next/link'
import { siteConfig } from '@/lib/config/site'
import { SeoDirectory } from '@/components/ui/seo-directory'
import { InteractiveList } from '@/features/discovery/components/interactive-list'

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
  dining:    { label: 'Dining',    emoji: '🍽️' },
  wellness:  { label: 'Wellness',  emoji: '🧘' },
  adventure: { label: 'Adventure', emoji: '🥾' },
  stays:     { label: 'Stays',     emoji: '🛌' },
  culture:   { label: 'Culture',   emoji: '🏺' },
}

export async function generateStaticParams() {
  const combinations = await prisma.business.groupBy({
    by: ['locationSlug', 'category'],
  })
  return combinations
    .filter(c => c.locationSlug && c.category)
    .map(c => ({ location: c.locationSlug, category: c.category }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string; category: string }>
}): Promise<Metadata> {
  const { location, category } = await params
  const loc = LOCATION_LABELS[location] ?? location
  const cat = CATEGORY_LABELS[category] ?? { label: category, emoji: '📍' }
  
  const title = `${cat.emoji} ${cat.label} in ${loc} — VALLECITO Sacred Valley`
  const description = `Discover the best ${cat.label} businesses in ${loc}, Sacred Valley. Book directly with zero commissions via WhatsApp.`

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/explore/${location}/${category}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/explore/${location}/${category}`,
      type: "website",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(cat.label + ' in ' + loc)}&description=${encodeURIComponent('Discover verified local businesses in ' + loc)}`,
          width: 1200,
          height: 630,
          alt: title,
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?title=${encodeURIComponent(cat.label + ' in ' + loc)}&description=${encodeURIComponent('Discover verified local businesses in ' + loc)}`],
    },
  }
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  dining: "Experience the culinary renaissance of the Andes. From traditional *picanterías* serving slow-roasted guinea pig to avant-garde restaurants blending local ingredients with modern techniques, the Sacred Valley offers a world-class dining experience.",
  wellness: "Reconnect with your inner self. Discover holistic spas, ancient Inca healing therapies, yoga retreats, and meditation centers nestled in the tranquil mountains of the Sacred Valley.",
  adventure: "Get your adrenaline pumping. The Sacred Valley is a playground for thrill-seekers, offering world-class trekking, ATV tours, white-water rafting, and zip-lining across breathtaking landscapes.",
  stays: "Rest in unparalleled comfort. Whether you seek a luxury eco-lodge, a boutique hotel, or a cozy family-run inn, find the perfect basecamp for your Andean explorations.",
  culture: "Immerse yourself in living history. Explore vibrant artisan markets, ancient ruins, traditional textile weaving centers, and interactive workshops that preserve the legacy of the Incas.",
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ location: string; category: string }>
}) {
  const { location, category } = await params

  const localBusinesses = await prisma.business.findMany({
    where: { locationSlug: location, category: category },
    orderBy: { rating: 'desc' },
  })

  if (localBusinesses.length === 0) return notFound()

  const loc = LOCATION_LABELS[location] ?? location
  const cat = CATEGORY_LABELS[category] ?? { label: category, emoji: '📍' }
  const description = CATEGORY_DESCRIPTIONS[category] ?? `Explore the best ${cat.label} options in ${loc}.`

  // JSON-LD Structured Data (Breadcrumbs)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Explore",
        "item": "https://vallecito.app/explore"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": loc,
        "item": `https://vallecito.app/explore/${location}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": cat.label,
        "item": `https://vallecito.app/explore/${location}/${category}`
      }
    ]
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Link href="/explore" className="text-slate-500 hover:text-slate-900 text-sm transition-colors mb-6 inline-block">
            ← Explore
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-rose-600 font-bold text-[10px] uppercase tracking-widest">Sacred Valley</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium text-xs uppercase tracking-widest">{loc}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight">
            {cat.emoji} {cat.label}
          </h1>
          <p className="mt-4 text-slate-600 text-lg font-light max-w-2xl leading-relaxed">
            {description}
          </p>
          <p className="mt-6 text-slate-500 text-sm font-medium tracking-wide">
            {localBusinesses.length} verified locations in {loc}
          </p>
        </div>
      </div>

      {/* Interactive List */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <InteractiveList locationSlug={location} category={category} initialBusinesses={localBusinesses} />
      </div>
      
      <SeoDirectory />
    </div>
  )
}

