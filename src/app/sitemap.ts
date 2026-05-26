import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { siteConfig } from '@/lib/config/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all active businesses
  const businesses = await prisma.business.findMany({
    select: {
      slug: true,
    },
  });

  // Fetch all location/category combinations for the explore directory
  const combinations = await prisma.business.groupBy({
    by: ['locationSlug', 'category'],
  });

  const baseUrl = siteConfig.url;

  // Base routes
  const routes = [
    '',
    '/explore',
    '/guides',
  ].flatMap((route) => [
    {
      url: `${baseUrl}/en${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    },
    {
      url: `${baseUrl}/es${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    }
  ]);

  // Business routes
  const businessRoutes = businesses.flatMap((business) => [
    {
      url: `${baseUrl}/en/business/${business.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/es/business/${business.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }
  ]);

  // Explore location/category routes
  const exploreRoutes = combinations
    .filter(c => c.locationSlug && c.category)
    .flatMap((c) => [
      {
        url: `${baseUrl}/en/explore/${c.locationSlug}/${c.category}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/es/explore/${c.locationSlug}/${c.category}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }
    ]);

  return [...routes, ...businessRoutes, ...exploreRoutes];
}
