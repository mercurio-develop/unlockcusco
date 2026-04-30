import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { calculateDetourKm } from '@/lib/geo/math';

export const searchDatabase = tool({
  description: 'Search database for businesses, activities, food, services. Use for simple "what is in X" queries.',
  inputSchema: z.object({
    query: z.string().describe("The type of business, e.g. coffee, textiles, taxi"),
    location: z.string().optional().describe("The specific town to search in, e.g. pisac, urubamba"),
    routeStart: z.object({ lat: z.number(), lng: z.number() }).optional(),
    routeEnd: z.object({ lat: z.number(), lng: z.number() }).optional(),
  }),
  execute: async ({ query, location, routeStart, routeEnd }) => {
    const whereClause: any = {
      OR: [
        { name: { contains: query } },
        { category: { contains: query } },
        { categorySlug: { contains: query.toLowerCase() } },
      ]
    };

    if (location) {
      whereClause.locationSlug = { contains: location.toLowerCase() };
    }

    const businesses = await prisma.business.findMany({
      where: whereClause,
      orderBy: { rating: 'desc' }
    });

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

      return scored.slice(0, 3);
    }

    return businesses.slice(0, 5);
  }
});
