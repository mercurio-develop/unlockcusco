import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { siteConfig } from '@/lib/config/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url
  const locales = ['en', 'es']

  const getAlternates = (path: string) => ({
    languages: {
      en: `${baseUrl}/en${path}`,
      es: `${baseUrl}/es${path}`,
      'x-default': `${baseUrl}/en${path}`,
    }
  })

  // 1. Static Pages
  const staticPaths = [
    '', 
    '/explore', 
    '/machu-picchu-tickets', 
    '/guides', 
    '/guides/sacred-valley-1-day-itinerary', 
    '/guides/machu-picchu-circuits-explained', 
    '/guides/best-restaurants-cusco-sacred-valley'
  ]
  const staticPages: MetadataRoute.Sitemap = []
  
  staticPaths.forEach(path => {
    locales.forEach(locale => {
      staticPages.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: path === '' ? 1.0 : 0.9,
        alternates: getAlternates(path)
      })
    })
  })

  // 2. Category + Location Combinations (Discovery Spoke Pages)
  const combinations = await prisma.business.groupBy({
    by: ['locationSlug', 'category'],
  })

  const locationSlugs = Array.from(new Set(combinations.map(c => c.locationSlug).filter(Boolean))) as string[];

  const locationPages: MetadataRoute.Sitemap = []
  locationSlugs.forEach(loc => {
    const path = `/explore/${loc}`
    locales.forEach(locale => {
      locationPages.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.85,
        alternates: getAlternates(path)
      })
    })
  })

  const categoryPages: MetadataRoute.Sitemap = []
  combinations.filter(combo => combo.locationSlug && combo.category).forEach(combo => {
    const path = `/explore/${combo.locationSlug}/${combo.category.toLowerCase()}`
    locales.forEach(locale => {
      categoryPages.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: getAlternates(path)
      })
    })
  })

  // 3. Business Profile Pages (Long-tail)
  const businesses = await prisma.business.findMany({
    select: { slug: true },
  })

  const businessPages: MetadataRoute.Sitemap = []
  businesses.filter(b => b.slug).forEach(b => {
    const path = `/business/${b.slug}`
    locales.forEach(locale => {
      businessPages.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: getAlternates(path)
      })
    })
  })

  return [...staticPages, ...locationPages, ...categoryPages, ...businessPages]
}
