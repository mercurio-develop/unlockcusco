import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { siteConfig } from '@/lib/config/site'

export function generateSitemaps() {
  return [{ id: 'main' }, { id: 'explore' }, { id: 'businesses' }]
}

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url
  const locales = ['en', 'es']

  const getAlternates = (path: string) => ({
    languages: {
      en: `${baseUrl}/en${path}`,
      es: `${baseUrl}/es${path}`,
      'x-default': `${baseUrl}/en${path}`,
    }
  })

  // 1. Main Pages (Home, Static, Guides)
  if (id === 'main') {
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
    return staticPages
  }

  // 2. Explore Pages (Location + Category Hubs)
  if (id === 'explore') {
    const combinations = await prisma.business.groupBy({
      by: ['locationSlug', 'category'],
    })

    const locationSlugs = Array.from(new Set(combinations.map(c => c.locationSlug).filter(Boolean))) as string[];

    const explorePages: MetadataRoute.Sitemap = []
    
    // Location Hubs
    locationSlugs.forEach(loc => {
      const path = `/explore/${loc}`
      locales.forEach(locale => {
        explorePages.push({
          url: `${baseUrl}/${locale}${path}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.85,
          alternates: getAlternates(path)
        })
      })
    })

    // Category Hubs
    combinations.filter(combo => combo.locationSlug && combo.category).forEach(combo => {
      const path = `/explore/${combo.locationSlug}/${combo.category.toLowerCase()}`
      locales.forEach(locale => {
        explorePages.push({
          url: `${baseUrl}/${locale}${path}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: getAlternates(path)
        })
      })
    })

    return explorePages
  }

  // 3. Business Profile Pages (Long-tail)
  if (id === 'businesses') {
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
    return businessPages
  }

  return []
}
