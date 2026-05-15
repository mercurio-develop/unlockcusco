import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
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
    by: ['locationSlug'],
  })
  return combinations
    .filter(c => c.locationSlug)
    .map(c => ({ location: c.locationSlug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string }>
}): Promise<Metadata> {
  const { location } = await params
  const loc = LOCATION_LABELS[location] ?? location
  
  const title = `Explore ${loc} — VALLECITO Sacred Valley`
  const description = `Discover the best experiences, restaurants, hotels, and adventures in ${loc}, Sacred Valley. Book directly with zero commissions.`

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/explore/${location}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/explore/${location}`,
      type: "website",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent('Explore ' + loc)}&description=${encodeURIComponent('Discover verified local businesses in ' + loc)}`,
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
      images: [`/api/og?title=${encodeURIComponent('Explore ' + loc)}&description=${encodeURIComponent('Discover verified local businesses in ' + loc)}`],
    },
  }
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ location: string }>
}) {
  const { location } = await params

  const localBusinesses = await prisma.business.findMany({
    where: { locationSlug: location },
    orderBy: { rating: 'desc' },
    take: 30
  })

  if (localBusinesses.length === 0) return notFound()

  const loc = LOCATION_LABELS[location] ?? location

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
      }
    ]
  }

  const availableCategories = await prisma.business.groupBy({
    by: ['category'],
    where: { locationSlug: location }
  })

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
            ← Explore The Valley
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-rose-600 font-bold text-[10px] uppercase tracking-widest">Sacred Valley</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight">
            Explore {loc}
          </h1>
          <p className="mt-4 text-slate-600 text-lg font-light max-w-2xl leading-relaxed">
            Discover unlisted experiences, hidden gems, and fully organized itineraries in {loc}. Book directly with local providers with zero commissions.
          </p>
          
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-8">
            {availableCategories.map(c => {
              const catLabel = CATEGORY_LABELS[c.category.toLowerCase()]
              if (!catLabel) return null
              return (
                <Link 
                  key={c.category}
                  href={`/explore/${location}/${c.category.toLowerCase()}`}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-full text-slate-700 hover:text-rose-700 transition-colors font-medium text-sm shadow-sm"
                >
                  <span>{catLabel.emoji}</span>
                  <span>{catLabel.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Interactive List */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <InteractiveList locationSlug={location} initialBusinesses={localBusinesses} />
      </div>
    </div>
  )
}
