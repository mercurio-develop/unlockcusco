import { tool } from 'ai';
import { z } from 'zod';
import { universalSearch } from '@/features/business/queries/universal-search';
import { kv } from '@vercel/kv';
import { calculateDistance } from '@/lib/utils/geo';

export const searchDatabase = tool({
  description: 'Search database for businesses, activities, food, services. Use for simple "what is in X" queries. Supports Spatial RAG by calculating real-world distances if coordinates are provided.',
  inputSchema: z.object({
    query: z.string().describe("The type of business, e.g. coffee, textiles, taxi"),
    location: z.string().optional().describe("The specific town to search in, e.g. pisac, urubamba"),
    userLat: z.number().optional().describe("User's current latitude for distance calculation"),
    userLng: z.number().optional().describe("User's current longitude for distance calculation"),
  }),
  execute: async ({ query, location, userLat, userLng }) => {
    const cacheKey = `vallecito:search:v2:${query.toLowerCase().trim()}:${location ?? 'any'}`;
    
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
      results = await universalSearch({ query, location, limit: 15 });

      try {
        if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
          await kv.set(cacheKey, results, { ex: 86400 });
        }
      } catch (e) {
        console.warn("KV Cache write failed:", e);
      }
    }

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
          const scoreA = (a.rating || 0) * 2 - a.distanceKm + (a.isAsociado ? 10 : 0);
          const scoreB = (b.rating || 0) * 2 - b.distanceKm + (b.isAsociado ? 10 : 0);
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
      whatsapp: b.whatsapp,
      locationSlug: b.locationSlug,
      tagline: b.tagline,
      imageUrl: b.imageUrl,
      slug: b.slug,
      recommendationNote: b.isAsociado ? "Vallecito Preferred Partner - Highly Recommended" : undefined
    }));
  }
});
