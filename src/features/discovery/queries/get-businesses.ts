"use server"

import { prisma } from "@/lib/prisma"
import { Business, Prisma } from "@prisma/client"
import { COORDS_MAP } from "@/lib/constants"
import { unstable_cache } from "next/cache"
import { revalidateTag } from "next/cache"

export async function revalidateBusinesses() {
  // Call with type assertion to handle version variance in Next.js types
  ;(revalidateTag as (tag: string) => void)('businesses')
}

// Helper to interleave categories while maintaining relative rating sort
function interleaveCategories(sortedBusinesses: Business[]) {
  const byCategory: Record<string, Business[]> = {}
  sortedBusinesses.forEach((b) => {
    const cat = b.category || 'EXPERIENCE'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(b)
  })

  const interleaved: Business[] = []
  const categories = Object.keys(byCategory)
  let hasMore = true

  while (hasMore) {
    hasMore = false
    for (const cat of categories) {
      if (byCategory[cat] && byCategory[cat].length > 0) {
        const item = byCategory[cat].shift()
        if (item) interleaved.push(item)
        hasMore = true
      }
    }
  }
  return interleaved
}

export interface GetBusinessesParams {
  query?: string
  category?: string
  loc?: string
  radiusKm?: number
  userLat?: number
  userLng?: number
  sort?: string
  page?: number
  limit: number
}

// Helper for mapping price tier
const PRICE_TIER_VALUE: Record<string, number> = {
  "$": 1,
  "$$": 2,
  "$$$": 3,
  "$$$$": 4,
}

// Haversine formula
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

async function getBusinessesInternal({ query = "", category = "", loc = "", radiusKm, userLat, userLng, sort = "recommended", page = 0, limit = 20 }: GetBusinessesParams) {
  let targetCategory = category
  const q = query.trim()
  let isHeuristicMatch = false

  // If there's a complex query and no strict category filter applied yet
  if (q && !targetCategory) {
    // Fallback heuristics to extract a category from the text query
    const qLower = q.toLowerCase();
    if (qLower.includes("ayahuasca") || qLower.includes("retreat") || qLower.includes("ashram") || qLower.includes("spiritual") || qLower.includes("san pedro") || qLower.includes("shaman")) {
      targetCategory = "Spiritual"; isHeuristicMatch = true;
    }
    else if (qLower.includes("massage") || qLower.includes("spa") || qLower.includes("wellness") || qLower.includes("recovery") || qLower.includes("yoga")) { 
      targetCategory = "Wellness"; isHeuristicMatch = true; 
    }
    else if (qLower.includes("tour") || qLower.includes("trekking") || qLower.includes("expedition") || qLower.includes("travel") || qLower.includes("agency") || qLower.includes("agencia")) { 
      targetCategory = "Agency"; isHeuristicMatch = true; 
    }
    else if (qLower.includes("atv") || qLower.includes("hiking") || qLower.includes("adventure") || qLower.includes("trail") || qLower.includes("llama")) { 
      targetCategory = "Adventure"; isHeuristicMatch = true; 
    }
    else if (qLower.includes("picantería") || qLower.includes("restaurant") || qLower.includes("food") || qLower.includes("dining") || qLower.includes("eat") || qLower.includes("coffee") || qLower.includes("vegan") || qLower.includes("cafe")) { 
      targetCategory = "Dining"; isHeuristicMatch = true; 
    }
    else if (qLower.includes("hotel") || qLower.includes("stays") || qLower.includes("sleep") || qLower.includes("boutique") || qLower.includes("lodging") || qLower.includes("hostel")) { 
      targetCategory = "Stays"; isHeuristicMatch = true; 
    }
    else if (qLower.includes("textile") || qLower.includes("tejido") || qLower.includes("weaving") || qLower.includes("artesanía") || qLower.includes("artisan") || qLower.includes("tejedoras")) { 
      targetCategory = "Textiles"; isHeuristicMatch = true; 
    }
    else if (qLower.includes("market") || qLower.includes("culture") || qLower.includes("art") || qLower.includes("textile") || qLower.includes("ruins") || qLower.includes("attraction")) { 
      targetCategory = "Culture"; isHeuristicMatch = true; 
    }
    else if (qLower.includes("transport") || qLower.includes("taxi") || qLower.includes("airport") || qLower.includes("driver") || qLower.includes("shuttle") || qLower.includes("transfer")) { 
      targetCategory = "Transport"; isHeuristicMatch = true; 
    }
  }

  const whereClause: Prisma.BusinessWhereInput = {
    category: { notIn: ['AGENCY', 'Agency', 'agency'] }
  }

  if (targetCategory) {
    const categories = targetCategory.split(',').map(c => c.trim()).filter(Boolean)
    if (categories.length > 0) {
      // Expand to cover different casings present in the DB (e.g. 'Dining', 'DINING', 'dining')
      const expandedCategories = new Set<string>();
      for (const cat of categories) {
        if (cat.toUpperCase() === 'AGENCY') continue; // Skip agency searches
        expandedCategories.add(cat);
        expandedCategories.add(cat.toUpperCase());
        expandedCategories.add(cat.toLowerCase());
        expandedCategories.add(cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase());
        // Boleto filter also captures "Tourist Ticket" DB category variant
        if (cat.toUpperCase() === 'BOLETO') {
          expandedCategories.add('Tourist Ticket');
          expandedCategories.add('TOURIST TICKET');
          expandedCategories.add('tourist ticket');
        }
        // Custom mappings for UI to DB
        if (cat.toUpperCase() === 'DINING') {
          expandedCategories.add('Meal');
          expandedCategories.add('MEAL');
          expandedCategories.add('meal');
        }
        if (cat.toUpperCase() === 'STAYS') {
          expandedCategories.add('Stay');
          expandedCategories.add('STAY');
          expandedCategories.add('stay');
        }
        if (cat.toUpperCase() === 'ADVENTURE' || cat.toUpperCase() === 'AGENCY') {
          expandedCategories.add('Experience');
          expandedCategories.add('EXPERIENCE');
          expandedCategories.add('experience');
        }
        if (cat.toUpperCase() === 'CULTURE' || cat.toUpperCase() === 'ATTRACTIONS') {
          expandedCategories.add('Culture');
          expandedCategories.add('CULTURE');
          expandedCategories.add('culture');
          expandedCategories.add('Attractions');
          expandedCategories.add('ATTRACTIONS');
          expandedCategories.add('attractions');
        }
      }
      if (expandedCategories.size > 0) {
        whereClause.category = { in: Array.from(expandedCategories), notIn: ['AGENCY', 'Agency', 'agency'] };
      }
    }
  }

  if (loc && radiusKm === undefined) {
    const locs = loc.split(',').map(l => l.trim()).filter(Boolean)
    if (locs.includes('machu-picchu') && !locs.includes('aguas-calientes')) {
      locs.push('aguas-calientes')
    }
    if (locs.length > 0) {
      whereClause.locationSlug = { in: locs }
    }
  }

  // Combine OR queries
  const orConditions: Prisma.BusinessWhereInput[] = []

  if (q && !isHeuristicMatch) {
     const titleCase = q.charAt(0).toUpperCase() + q.slice(1).toLowerCase();
     orConditions.push({ name: { contains: q } })
     orConditions.push({ name: { contains: q.toLowerCase() } })
     orConditions.push({ name: { contains: titleCase } })
     orConditions.push({ name: { contains: q.toUpperCase() } })
     orConditions.push({ category: { contains: q } })
     orConditions.push({ description: { contains: q } })
     orConditions.push({ description: { contains: q.toLowerCase() } })
     orConditions.push({ description: { contains: titleCase } })
  }

  if (orConditions.length > 0) {
    whereClause.OR = orConditions
  }

  let businesses = (await prisma.business.findMany({
    where: whereClause,
    omit: {
      longDescription: true,
      longDescriptionEs: true,
      seoMetaDescEs: true,
      openingHours: true,
      heroImages: true,
      socialLinks: true,
      featuresJson: true,
      themeConfig: true,
    }
  })) as Business[]

  // Distance Filter
  if (radiusKm !== undefined) {
    let centerLat = userLat;
    let centerLng = userLng;

    if (centerLat === undefined || centerLng === undefined) {
      if (loc && COORDS_MAP[loc]) {
        centerLat = COORDS_MAP[loc].lat;
        centerLng = COORDS_MAP[loc].lng;
      }
    }

    if (centerLat !== undefined && centerLng !== undefined) {
      businesses = businesses.filter(b => {
        if (b.lat === null || b.lng === null) return false;
        const dist = getDistanceKm(centerLat!, centerLng!, b.lat, b.lng);
        return dist <= radiusKm;
      });
    }
  }

  // Sort based on sort parameter
  businesses.sort((a, b) => {
    if (sort === "rating_desc") {
      const ratingA = a.rating || 0
      const ratingB = b.rating || 0
      if (ratingA !== ratingB) return ratingB - ratingA
      // Fallback to reviews count
      return (b.reviewsCount || 0) - (a.reviewsCount || 0)
    } else if (sort === "price_asc") {
      const priceA = PRICE_TIER_VALUE[a.priceTier] || 2
      const priceB = PRICE_TIER_VALUE[b.priceTier] || 2
      if (priceA !== priceB) return priceA - priceB
      // Fallback to rating
      return (b.rating || 0) - (a.rating || 0)
    } else if (sort === "price_desc") {
      const priceA = PRICE_TIER_VALUE[a.priceTier] || 2
      const priceB = PRICE_TIER_VALUE[b.priceTier] || 2
      if (priceA !== priceB) return priceB - priceA
      // Fallback to rating
      return (b.rating || 0) - (a.rating || 0)
    } else {
      // Default: recommended
      const scoreA = (a.rating || 0) * Math.log10((a.reviewsCount || 0) + 10) + (a.isAsociado ? 50 : 0) + (a.isClaimed ? 2 : 0) + ((a.instagramFollowers || 0) * 0.001)
      const scoreB = (b.rating || 0) * Math.log10((b.reviewsCount || 0) + 10) + (b.isAsociado ? 50 : 0) + (b.isClaimed ? 2 : 0) + ((b.instagramFollowers || 0) * 0.001)
      return scoreB - scoreA
    }
  })

  // Interleave categories only if sort is recommended
  if (sort === "recommended") {
    businesses = interleaveCategories(businesses)
  }

  const startIndex = page * limit
  const paginatedBusinesses = businesses.slice(startIndex, startIndex + limit)

  // Calculate category counts based on current filters (EXCLUDING category filter)
  const countWhereClause = { ...whereClause }
  delete countWhereClause.category

  const counts = await prisma.business.groupBy({
    by: ['category'],
    where: countWhereClause,
    _count: {
      _all: true
    }
  })

  const categoryCounts: Record<string, number> = {}
  counts.forEach(c => {
    if (c.category) {
      let key = c.category.toUpperCase()
      if (key === 'ATTRACTIONS') key = 'CULTURE'
      categoryCounts[key] = (categoryCounts[key] || 0) + c._count._all
    }
  })

  return {
    businesses: paginatedBusinesses,
    allBusinesses: businesses.map(b => ({
      ...b,
      longDescription: null,
      longDescriptionEs: null,
      heroImages: "[]",
      socialLinks: "{}",
      specialties: "[]",
      themeConfig: "{}"
    })), // Return stripped-down versions for the map to prevent 2MB cache limit
    categoryCounts,
    hasMore: startIndex + limit < businesses.length
  }
}

export async function getBusinesses(params: GetBusinessesParams) {
  const cacheKey = [
    'get-businesses',
    'v8', // cache buster
    params.query || '',
    params.category || '',
    params.loc || '',
    params.radiusKm?.toString() || '',
    params.userLat ? params.userLat.toFixed(3) : '',
    params.userLng ? params.userLng.toFixed(3) : '',
    params.sort || 'recommended',
    params.page?.toString() || '0',
    params.limit.toString()
  ]

  const fetcher = unstable_cache(
    async () => getBusinessesInternal(params),
    cacheKey,
    {
      revalidate: 60, // 1 minute — keeps fresh when new businesses are added
      tags: ['businesses']
    }
  )

  return fetcher()
}
