import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const combinations = await prisma.business.groupBy({
    by: ['locationSlug', 'categorySlug'],
  })

  const businesses = await prisma.business.findMany({
    select: { id: true },
  })

  const urls: MetadataRoute.Sitemap = [
    {
      url: 'https://inkaportal.app',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://inkaportal.app/explore',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  for (const combo of combinations) {
    if (!combo.locationSlug || !combo.categorySlug) continue
    urls.push({
      url: `https://inkaportal.app/explore/${combo.locationSlug}/${combo.categorySlug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  for (const b of businesses) {
    if (!b.id) continue
    urls.push({
      url: `https://inkaportal.app/business/${b.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  }

  return urls
}
