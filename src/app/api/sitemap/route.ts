import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { siteConfig } from '@/lib/config/site'

export const revalidate = 86400 // Cache for 24 hours

export async function GET() {
  const baseUrl = siteConfig.url
  const locales = ['en', 'es']

  const getAlternates = (path: string) => `
<xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en${path}" />
<xhtml:link rel="alternate" hreflang="es" href="${baseUrl}/es${path}" />
<xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en${path}" />`

  const generateUrl = (path: string, priority: number, changefreq: string) => {
    return locales.map(locale => `
<url>
<loc>${baseUrl}/${locale}${path}</loc>${getAlternates(path)}
<lastmod>${new Date().toISOString()}</lastmod>
<changefreq>${changefreq}</changefreq>
<priority>${priority}</priority>
</url>`).join('')
  }

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
  const staticUrls = staticPaths.map(path => generateUrl(path, path === '' ? 1.0 : 0.9, 'daily')).join('')

  // 2. Category + Location Combinations (Discovery Spoke Pages)
  const combinations = await prisma.business.groupBy({
    by: ['locationSlug', 'category'],
  })

  const locationSlugs = Array.from(new Set(combinations.map(c => c.locationSlug).filter(Boolean))) as string[];
  const locationUrls = locationSlugs.map(loc => generateUrl(`/explore/${loc}`, 0.85, 'weekly')).join('')
  
  const categoryUrls = combinations.filter(combo => combo.locationSlug && combo.category).map(combo => generateUrl(`/explore/${combo.locationSlug}/${combo.category.toLowerCase()}`, 0.8, 'weekly')).join('')

  // 3. Business Profile Pages (Long-tail)
  const businesses = await prisma.business.findMany({
    select: { slug: true },
  })
  
  const businessUrls = businesses.filter(b => b.slug).map(b => generateUrl(`/business/${b.slug}`, 0.7, 'monthly')).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticUrls}
${locationUrls}
${categoryUrls}
${businessUrls}
</urlset>`

  return new NextResponse(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
