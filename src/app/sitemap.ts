import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { siteConfig } from '@/lib/config/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url

  // 1. Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/explore/machu-picchu`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // 2. Category + Location Combinations (Discovery Spoke Pages)
  const combinations = await prisma.business.groupBy({
    by: ['locationSlug', 'category'],
  })

  const categoryPages: MetadataRoute.Sitemap = combinations
    .filter(combo => combo.locationSlug && combo.category)
    .map(combo => ({
      url: `${baseUrl}/explore/${combo.locationSlug}/${combo.category.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

  // 3. Business Profile Pages (Long-tail)
  const businesses = await prisma.business.findMany({
    select: { slug: true },
  })

  const businessPages: MetadataRoute.Sitemap = businesses
    .filter(b => b.slug)
    .map(b => ({
      url: `${baseUrl}/business/${b.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

  return [...staticPages, ...categoryPages, ...businessPages]
}
