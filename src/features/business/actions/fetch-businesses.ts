"use server"

import { prisma } from "@/lib/prisma"
import { Business } from "@prisma/client"

// Helper to interleave categories while maintaining relative rating sort
function interleaveCategories(sortedBusinesses: Business[]) {
  const byCategory: Record<string, Business[]> = {}
  sortedBusinesses.forEach((b) => {
    if (!byCategory[b.category]) byCategory[b.category] = []
    byCategory[b.category].push(b)
  })

  const interleaved = []
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

export interface FetchBusinessesParams {
  query?: string
  category?: string
  loc?: string
  page?: number
  limit: number
}

export async function fetchBusinesses({ query = "", category = "", loc = "", page = 0, limit = 20 }: FetchBusinessesParams) {
  let targetCategory = category
  const q = query.trim()
  let isHeuristicMatch = false

  // If there's a complex query and no strict category filter applied yet
  if (q && !targetCategory) {
    // Fallback heuristics to extract a category from the text query
    const qLower = q.toLowerCase();
    if (qLower.includes("massage") || qLower.includes("spa") || qLower.includes("wellness") || qLower.includes("recovery") || qLower.includes("retreat") || qLower.includes("yoga")) { 
      targetCategory = "Wellness"; isHeuristicMatch = true; 
    }
    else if (qLower.includes("atv") || qLower.includes("hiking") || qLower.includes("adventure") || qLower.includes("tour") || qLower.includes("trail") || qLower.includes("trekking") || qLower.includes("llama")) { 
      targetCategory = "Adventure"; isHeuristicMatch = true; 
    }
    else if (qLower.includes("picantería") || qLower.includes("restaurant") || qLower.includes("food") || qLower.includes("dining") || qLower.includes("eat") || qLower.includes("coffee") || qLower.includes("vegan") || qLower.includes("cafe")) { 
      targetCategory = "Dining"; isHeuristicMatch = true; 
    }
    else if (qLower.includes("hotel") || qLower.includes("stays") || qLower.includes("sleep") || qLower.includes("boutique") || qLower.includes("lodging") || qLower.includes("hostel")) { 
      targetCategory = "Stays"; isHeuristicMatch = true; 
    }
    else if (qLower.includes("market") || qLower.includes("culture") || qLower.includes("art") || qLower.includes("textile") || qLower.includes("ruins")) { 
      targetCategory = "Culture"; isHeuristicMatch = true; 
    }
    else if (qLower.includes("transport") || qLower.includes("taxi") || qLower.includes("airport") || qLower.includes("driver")) { 
      targetCategory = "Business"; isHeuristicMatch = true; 
    }
  }

  const whereClause: Record<string, unknown> = {}
  if (targetCategory) {
    const categories = targetCategory.split(',').map(c => c.trim()).filter(Boolean)
    if (categories.length > 1) {
      whereClause.category = { in: categories }
    } else {
      whereClause.category = categories[0]
    }
  }
  if (loc) {
    whereClause.locationSlug = loc
  }

  // Combine OR queries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orConditions: any[] = []

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

  let businesses = await prisma.business.findMany({
    where: whereClause,
  })

  // Sort by a weighted score (rating * log10(reviewsCount + 10)) + (instagramFollowers * 0.001)
  businesses.sort((a, b) => {
    const scoreA = (a.rating || 0) * Math.log10(a.reviewsCount + 10) + (a.isClaimed ? 2 : 0) + ((a.instagramFollowers || 0) * 0.001)
    const scoreB = (b.rating || 0) * Math.log10(b.reviewsCount + 10) + (b.isClaimed ? 2 : 0) + ((b.instagramFollowers || 0) * 0.001)
    return scoreB - scoreA
  })

  // Interleave categories
  businesses = interleaveCategories(businesses)

  const startIndex = page * limit
  const paginatedBusinesses = businesses.slice(startIndex, startIndex + limit)

  return {
    businesses: paginatedBusinesses,
    hasMore: startIndex + limit < businesses.length
  }
}
