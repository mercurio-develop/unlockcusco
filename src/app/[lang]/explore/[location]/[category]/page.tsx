import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SafeImageWrapper } from '@/components/ui/safe-image'
import { Star, Zap, MapPin } from 'lucide-react'
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

export async function generateStaticParams() {
  const combinations = await prisma.business.groupBy({
    by: ['locationSlug', 'category'],
  })
  
  const params: { location: string, category: string, lang: string }[] = []
  combinations
    .filter(c => c.locationSlug && c.category)
    .forEach(c => {
      params.push({ location: c.locationSlug as string, category: c.category as string, lang: 'en' })
      params.push({ location: c.locationSlug as string, category: c.category as string, lang: 'es' })
    })
    
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string; category: string, lang: string }>
}): Promise<Metadata> {
  const { location, category, lang } = await params
  const loc = LOCATION_LABELS[location] ?? location
  const cat = getCategoryData(category)
  const isEs = lang === 'es'
  
  const title = isEs ? `${cat.label} en ${loc} — UNLOCKCUSCO Valle Sagrado` : `${cat.label} in ${loc} — UNLOCKCUSCO Sacred Valley`
  const description = isEs
    ? `Descubre los mejores negocios de ${cat.label} en ${loc}, Valle Sagrado. Reserva directamente sin comisiones vía WhatsApp.`
    : `Discover the best ${cat.label} businesses in ${loc}, Sacred Valley. Book directly with zero commissions via WhatsApp.`

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/${lang}/explore/${location}/${category}`,
      languages: {
        en: `${siteConfig.url}/en/explore/${location}/${category}`,
        es: `${siteConfig.url}/es/explore/${location}/${category}`,
        'x-default': `${siteConfig.url}/en/explore/${location}/${category}`,
      }
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/${lang}/explore/${location}/${category}`,
      type: "website",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(cat.label + (isEs ? ' en ' : ' in ') + loc)}&description=${encodeURIComponent('Discover verified local businesses in ' + loc)}`,
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
      images: [`/api/og?title=${encodeURIComponent(cat.label + (isEs ? ' en ' : ' in ') + loc)}&description=${encodeURIComponent('Discover verified local businesses in ' + loc)}`],
    },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ location: string; category: string, lang: string }>
}) {
  const { location, category, lang } = await params
  const dict = await getDictionary(lang as Locale)

  const localBusinesses = await prisma.business.findMany({
    where: { locationSlug: location, category: category },
    orderBy: { rating: 'desc' },
  })

  if (localBusinesses.length === 0) return notFound()

  const loc = LOCATION_LABELS[location] ?? location
  const cat = getCategoryData(category)
  const CatIcon = cat.icon
  
  const displayCategoryLabel = dict.explore.categories[cat.value as keyof typeof dict.explore.categories] || cat.label
  
  const description = dict.explore.categoryDescriptions?.[category.toLowerCase() as keyof typeof dict.explore.categoryDescriptions] 
    ?? dict.explore.categoryDesc.replace('{category}', displayCategoryLabel).replace('{loc}', loc)

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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": displayCategoryLabel,
        "item": `${siteConfig.url}/${lang}/explore/${location}/${category}`
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
          <Link href={`/${lang}/explore/${location}`} className="text-slate-500 hover:text-slate-900 text-sm transition-colors mb-6 inline-block">
            &larr; {dict.explore.backTo} {loc}
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-rose-600 font-bold text-[10px] uppercase tracking-widest">{dict.explore.sacredValley}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium text-xs uppercase tracking-widest">{loc}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight flex items-center gap-3">
            <CatIcon className={`w-8 h-8 md:w-10 md:h-10 ${cat.theme.match(/text-\w+-\d+/)?.[0] || 'text-rose-600'}`} />
            {displayCategoryLabel}
          </h1>
          <p className="mt-4 text-slate-600 text-lg font-light max-w-2xl leading-relaxed">
            {description}
          </p>
          <p className="mt-6 text-slate-500 text-sm font-medium tracking-wide">
            {localBusinesses.length} {dict.explore.verifiedLocations} {loc}
          </p>
        </div>
      </div>

      {/* Interactive List */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <BusinessList locationSlug={location} category={category} initialBusinesses={localBusinesses} dict={dict} />
      </div>
    </div>
  )
}

