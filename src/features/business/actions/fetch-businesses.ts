"use server"

import { prisma } from "@/lib/prisma"
import { Business } from "@prisma/client"
import { generateObject } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"

const google = createGoogleGenerativeAI({ 
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY 
});

export interface FetchBusinessesParams {
  query?: string
  category?: string
  loc?: string
  page: number
  limit: number
}

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
  page: number
  limit: number
  businessType?: 'place' | 'service'
}

export async function fetchBusinesses({ query = "", category = "", loc = "", page = 0, limit = 20, businessType }: FetchBusinessesParams) {
  const google = createGoogleGenerativeAI({ 
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY 
  });

  let targetCategory = category
  let searchTerms: string[] = []
  const q = query.trim()
  let isHeuristicMatch = false

  // If there's a complex query and no strict category filter applied yet
  if (q && !targetCategory) {
    if (q.split(" ").length > 2) {
      try {
        const { object } = await generateObject({
          model: google("gemini-2.5-flash"),
          system: "You are a travel concierge AI. Extract search constraints from the user query.",
          schema: z.object({
            categories: z.array(z.enum(["Adventure", "Wellness", "Dining", "Culture", "Stays", "Transport"])).describe("Categories that match the user's intent. Only include if explicitly implied."),
            searchTerms: z.array(z.string()).describe("1-3 essential keywords to search for in the business name or description (e.g., 'vegan', 'massage', 'coffee'). If none, return empty array.")
          }),
          prompt: `User query: "${q}"`
        });

        if (object.categories && object.categories.length > 0) {
          targetCategory = object.categories[0]; // For MVP, just use the first match
          isHeuristicMatch = true;
        }
        if (object.searchTerms && object.searchTerms.length > 0) {
          searchTerms = object.searchTerms;
        }
      } catch (e) {
        console.error("LLM Query Translation failed, falling back to heuristics:", e);
      }
    }

    // Fallback heuristics if LLM failed, skipped, or didn't find a category
    if (!targetCategory) {
       const qLower = q.toLowerCase();
       if (qLower.includes("massage") || qLower.includes("spa") || qLower.includes("wellness") || qLower.includes("recovery") || qLower.includes("retreat") || qLower.includes("yoga")) { targetCategory = "Wellness"; isHeuristicMatch = true; }
       else if (qLower.includes("atv") || qLower.includes("hiking") || qLower.includes("adventure") || qLower.includes("tour") || qLower.includes("trail") || qLower.includes("trekking") || qLower.includes("llama")) { targetCategory = "Adventure"; isHeuristicMatch = true; }
       else if (qLower.includes("picantería") || qLower.includes("restaurant") || qLower.includes("food") || qLower.includes("dining") || qLower.includes("eat") || qLower.includes("coffee") || qLower.includes("vegan") || qLower.includes("cafe")) { targetCategory = "Dining"; isHeuristicMatch = true; }
       else if (qLower.includes("hotel") || qLower.includes("stays") || qLower.includes("sleep") || qLower.includes("boutique")) { targetCategory = "Stays"; isHeuristicMatch = true; }
       else if (qLower.includes("market") || qLower.includes("culture") || qLower.includes("art") || qLower.includes("textile")) { targetCategory = "Culture"; isHeuristicMatch = true; }
       else if (qLower.includes("transport") || qLower.includes("taxi") || qLower.includes("airport")) { targetCategory = "Transport"; isHeuristicMatch = true; }
    }
  }

  const whereClause: Record<string, unknown> = {}
  if (targetCategory) {
    whereClause.category = targetCategory
  }
  if (loc) {
    whereClause.locationSlug = loc
  }
  // Scope to place OR service — default to 'place' when not specified
  whereClause.businessType = businessType ?? 'place'

  // Combine OR queries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orConditions: any[] = []

  if (q && !isHeuristicMatch && searchTerms.length === 0) {
     orConditions.push({ name: { contains: q } })
     orConditions.push({ category: { contains: q } })
  }

  if (searchTerms.length > 0) {
    searchTerms.forEach(term => {
      orConditions.push({ name: { contains: term } })
    })
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
