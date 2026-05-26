import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { siteConfig } from '@/lib/config/site'

import { BusinessList } from "@/features/discovery/components/business-list"
import { getCategoryData } from '@/features/discovery/constants'
import { getDictionary, Locale } from '@/lib/dictionaries'

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
  
  const params: { location: string, lang: string }[] = []
  combinations
    .filter(c => c.locationSlug)
    .forEach(c => {
      params.push({ location: c.locationSlug as string, lang: 'en' })
      params.push({ location: c.locationSlug as string, lang: 'es' })
    })
    
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string, lang: string }>
}): Promise<Metadata> {
  const { location, lang } = await params
  const loc = LOCATION_LABELS[location] ?? location
  const isEs = lang === 'es'
  
  const title = isEs ? `Explorar ${loc} — UNLOCKCUSCO Valle Sagrado` : `Explore ${loc} — UNLOCKCUSCO Sacred Valley`
  const description = isEs 
    ? `Descubre las mejores experiencias, restaurantes, hoteles y aventuras en ${loc}, Valle Sagrado. Reserva directamente sin comisiones.`
    : `Discover the best experiences, restaurants, hotels, and adventures in ${loc}, Sacred Valley. Book directly with zero commissions.`

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/${lang}/explore/${location}`,
      languages: {
        en: `${siteConfig.url}/en/explore/${location}`,
        es: `${siteConfig.url}/es/explore/${location}`,
        'x-default': `${siteConfig.url}/en/explore/${location}`,
      }
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/${lang}/explore/${location}`,
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
  params: Promise<{ location: string, lang: string }>
}) {
  const { location, lang } = await params
  const dict = await getDictionary(lang as Locale)

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
        "name": dict.explore.exploreUnlockCusco,
        "item": `${siteConfig.url}/${lang}/explore`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": loc,
        "item": `${siteConfig.url}/${lang}/explore/${location}`
      }
    ]
  }

  const availableCategoriesRaw = await prisma.business.groupBy({
    by: ['category'],
    where: { locationSlug: location },
    _count: {
      _all: true
    }
  })

  // Combine counts for categories that only differ by case
  const combinedCategories: Record<string, { category: string, count: number }> = {}
  availableCategoriesRaw.forEach(c => {
    if (c.category && c.category.toUpperCase() !== 'AGENCY') {
      const key = c.category.toUpperCase()
      if (!combinedCategories[key]) {
        combinedCategories[key] = { category: c.category, count: c._count._all }
      } else {
        combinedCategories[key].count += c._count._all
      }
    }
  })
  const availableCategories = Object.values(combinedCategories)

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
          <Link href={`/${lang}/explore`} className="text-slate-500 hover:text-slate-900 text-sm transition-colors mb-6 inline-block">
            &larr; {dict.explore.exploreTheValley}
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-rose-600 font-bold text-[10px] uppercase tracking-widest">{dict.explore.sacredValley}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight">
            {dict.nav.explore} {loc}
          </h1>
          <p className="mt-4 text-slate-600 text-lg font-light max-w-2xl leading-relaxed">
            {dict.explore.locationDesc.replace('{loc}', loc)}
          </p>
          
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-8">
            {availableCategories.map(c => {
              const catData = getCategoryData(c.category)
              const Icon = catData.icon
              if (!catData || catData.value === 'Unknown') return null
              return (
                <Link 
                  key={c.category}
                  href={`/${lang}/explore/${location}/${c.category.toLowerCase()}`}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-full text-slate-700 hover:text-slate-900 transition-colors font-medium text-sm shadow-sm"
                >
                  <Icon className={`w-4 h-4 ${catData.theme.match(/text-\w+-\d+/)?.[0] || 'text-slate-500'}`} />
                  <span>{dict.explore.categories[catData.value as keyof typeof dict.explore.categories] || catData.label}</span>
                  <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full ml-1 font-bold">{c.count}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Interactive List */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <BusinessList locationSlug={location} initialBusinesses={localBusinesses} dict={dict} />
      </div>
    </div>
  )
}
