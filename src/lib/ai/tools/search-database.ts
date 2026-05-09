import { defineTool as tool } from '@/lib/ai/tool-utils';
import { z } from 'zod';
import { universalSearch } from '@/features/business/queries/universal-search';
import { kv } from '@vercel/kv';
import { calculateDistance } from '@/lib/utils/geo';

interface SearchContext {
  userLat?: number;
  userLng?: number;
  targetDate?: string;
  archetype?: string | null;
  intensity?: number | null;
}

export const createSearchDatabaseTool = (context: SearchContext) => tool({
  description: 'Search the Vallecito library for local businesses, restaurants, food (e.g. ceviche, coffee), and activities. Use this tool immediately when a user asks for recommendations or mentions specific towns like Urubamba, Pisac, or Cusco. Supports Spatial RAG by calculating real-world distances using the user\'s real-time context.',
  inputSchema: z.object({
    query: z.string().describe("The type of business, e.g. ceviche, coffee, textiles, taxi"),
    location: z.string().optional().describe("The specific town to search in, e.g. pisac, urubamba"),
    category: z.string().optional().describe("Optional Prisma BusinessCategory to filter by, e.g. DINING, EXPERIENCE, STAY"),
  }),
  execute: async ({ query, location, category }) => {
    // Incorporate context into the cache key so different profiles don't poison each other's cache
    const cacheKey = `vallecito:search:v6:${query.toLowerCase().trim()}:${location ?? 'any'}:${category ?? 'any'}`;
    
    let results;
    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        const cached = await kv.get(cacheKey);
        if (cached) results = cached as any[];
      }
    } catch (e) {
      console.warn("KV Cache read failed:", e);
    }

    if (!results) {
      results = await universalSearch({ query, location, category, limit: 15 });

      try {
        if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
          await kv.set(cacheKey, results, { ex: 86400 });
        }
      } catch (e) {
        console.warn("KV Cache write failed:", e);
      }
    }

    // Use context variables directly from the chat request
    const { userLat, userLng, archetype, intensity } = context;

    // Spatial RAG Enhancement: Inject distances and sort by proximity + rating
    if (userLat && userLng) {
      const withDistance = results.map((b: any) => {
        let distanceKm = null;
        if (b.lat && b.lng) {
          distanceKm = calculateDistance(userLat, userLng, b.lat, b.lng);
        }
        return { ...b, distanceKm };
      });

      withDistance.sort((a: any, b: any) => {
        // If one has distance and other doesn't, prioritize the one with distance
        if (a.distanceKm !== null && b.distanceKm === null) return -1;
        if (a.distanceKm === null && b.distanceKm !== null) return 1;
        
        // If both have distance, blend distance, rating, and Asociado status into a score
        if (a.distanceKm !== null && b.distanceKm !== null) {
          let scoreA = (a.rating || 0) * 2 - a.distanceKm + (a.isAsociado ? 10 : 0);
          let scoreB = (b.rating || 0) * 2 - b.distanceKm + (b.isAsociado ? 10 : 0);
          
          // Psychographic boosting
          if (archetype === 'ADVENTURER' && a.category === 'EXPERIENCE') scoreA += 5;
          if (archetype === 'LUXURY' && a.priceTier === '$$$') scoreA += 5;
          if (archetype === 'ADVENTURER' && b.category === 'EXPERIENCE') scoreB += 5;
          if (archetype === 'LUXURY' && b.priceTier === '$$$') scoreB += 5;

          return scoreB - scoreA;
        }
        
        // Fallback to Asociado then rating
        if (a.isAsociado !== b.isAsociado) return a.isAsociado ? -1 : 1;
        return (b.rating || 0) - (a.rating || 0);
      });

      return withDistance.slice(0, 10).map((b: any) => ({
        id: b.id,
        name: b.name,
        category: b.category,
        rating: b.rating,
        isAsociado: b.isAsociado,
        priceTier: b.priceTier,
        bookingType: b.bookingType,
        minAdvanceHours: b.minAdvanceHours,
        distanceKm: b.distanceKm ? b.distanceKm.toFixed(1) + ' km away' : 'Distance unknown',
        whatsapp: b.whatsapp,
        tagline: b.tagline,
        imageUrl: b.imageUrl,
        slug: b.slug,
        recommendationNote: b.isAsociado ? "Vallecito Preferred Partner - Highly Recommended" : undefined
      }));
    }
    
    // Return compressed view to save LLM tokens if no coords
    return results.slice(0, 10).map((b: any) => ({
      id: b.id,
      name: b.name,
      category: b.category,
      rating: b.rating,
      isAsociado: b.isAsociado,
      priceTier: b.priceTier,
      bookingType: b.bookingType,
      minAdvanceHours: b.minAdvanceHours,
      whatsapp: b.whatsapp,
      locationSlug: b.locationSlug,
      tagline: b.tagline,
      imageUrl: b.imageUrl,
      slug: b.slug,
      recommendationNote: b.isAsociado ? "Vallecito Preferred Partner - Highly Recommended" : undefined
    }));
  }
});
