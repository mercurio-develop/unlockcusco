import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { calculateDetourKm } from '@/lib/geo/math';
import { kv } from '@vercel/kv';

export const searchDatabase = tool({
  description: `Search for experiences, activities, culture, and wellness businesses.
Use for: hike, trek, ATV, ruins, market, textiles, art, massage, spa, yoga, boleto, museum, adventure.
Do NOT use for restaurants/food (use searchRestaurants) or lodging/hotels (use searchLodging) or taxis (use estimateTaxiFare).`,
  inputSchema: z.object({
    query: z.string().describe("Activity or experience type, e.g. textiles, ruins, ATV, massage"),
    location: z.string().optional().describe("Town slug: pisac, urubamba, ollantaytambo, cusco, maras"),
    routeStart: z.object({ lat: z.number(), lng: z.number() }).optional(),
    routeEnd: z.object({ lat: z.number(), lng: z.number() }).optional(),
  }),
  execute: async ({ query, location, routeStart, routeEnd }) => {
    // 1. Normalize the query for caching
    const cacheKey = `vallecito:search:${query.toLowerCase().trim()}:${location ?? 'any'}:${routeStart?.lat ?? 'none'}`;
    
    // 2. Check KV Cache safely
    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        const cached = await kv.get(cacheKey);
        if (cached) return cached;
      }
    } catch (e) {
      console.warn("KV Cache read failed:", e);
    }

    const whereClause: any = {
      NOT: { category: { in: ['Dining', 'Stays', 'Descanso'] } },
      OR: [
        { name: { contains: query } },
        { category: { contains: query } },
        { categorySlug: { contains: query.toLowerCase() } },
      ]
    };

    if (location) {
      whereClause.locationSlug = { contains: location.toLowerCase() };
    }

    let businesses = await prisma.business.findMany({
      where: whereClause,
      orderBy: { rating: "desc" }
    });

    // Fallback if no exact location match
    if (businesses.length === 0 && location) {
      delete whereClause.locationSlug;
      const fallbackBusinesses = await prisma.business.findMany({
        where: whereClause,
        orderBy: { rating: "desc" }
      });
      
      const result = {
        foundInRequestedLocation: false,
        requestedLocation: location,
        alternatives: fallbackBusinesses.slice(0, 5)
      };

      try {
        if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
          await kv.set(cacheKey, result, { ex: 86400 });
        }
      } catch (e) {
        console.warn("KV Cache write failed:", e);
      }
      return result;
    }

    let finalResult;

    if (routeStart && routeEnd) {
      const scored = businesses.map(business => {
        let vallecitoScore = 0;
        
        if (business.marginTier === 'PRO') vallecitoScore += 40;

        let detourKm = 0;
        if (business.lat !== null && business.lng !== null) {
          detourKm = calculateDetourKm(
            routeStart.lat, routeStart.lng,
            routeEnd.lat, routeEnd.lng,
            business.lat, business.lng
          );
        }

        if (detourKm > 3.0) return null;

        vallecitoScore -= (detourKm * 5);

        return { ...business, vallecitoScore, detourKm };
      }).filter(Boolean) as (typeof businesses[0] & { vallecitoScore: number, detourKm: number })[];

      scored.sort((a, b) => b.vallecitoScore - a.vallecitoScore);

      finalResult = scored.slice(0, 3);
    } else {
      finalResult = businesses.slice(0, 5);
    }

    // 4. Cache the final scored array for 24 hours
    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        await kv.set(cacheKey, finalResult, { ex: 86400 });
      }
    } catch (e) {
      console.warn("KV Cache write failed:", e);
    }
    
    return finalResult;
  }
});
