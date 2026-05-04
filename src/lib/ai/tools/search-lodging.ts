import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const searchLodging = tool({
  description: `Search the Lodging table for accommodation options.
Use for ANY query about: sleeping, staying, hotel, hostel, lodge, ecolodge, glamping, guesthouse, where to sleep, base camp, accommodation, place to stay.
Do NOT use for restaurants, transport, or activities.`,
  inputSchema: z.object({
    location: z.string().optional().describe('Town slug: pisac, urubamba, ollantaytambo, cusco, chinchero, maras'),
    lodgingType: z.enum(['hotel', 'hostel', 'ecolodge', 'glamping', 'guesthouse', 'any']).default('any'),
    budget: z.enum(['$', '$$', '$$$', 'any']).default('any'),
    maxPricePerNight: z.number().optional().describe('Max price per night in USD'),
  }),
  execute: async ({ location, lodgingType, budget, maxPricePerNight }) => {
    const where: Record<string, unknown> = {};

    if (location) {
      where.locationSlug = { contains: location.toLowerCase() };
    }
    if (lodgingType !== 'any') {
      where.lodgingType = lodgingType;
    }
    if (budget !== 'any') {
      where.priceTier = budget;
    }
    if (maxPricePerNight) {
      where.pricePerNightUsd = { lte: maxPricePerNight };
    }

    let lodging = await prisma.lodging.findMany({
      where,
      orderBy: [{ rating: 'desc' }, { reviewsCount: 'desc' }],
      take: 5,
    });

    // Fallback: drop location filter if empty
    if (lodging.length === 0 && location) {
      delete (where as Record<string, unknown>).locationSlug;
      lodging = await prisma.lodging.findMany({
        where,
        orderBy: [{ rating: 'desc' }, { reviewsCount: 'desc' }],
        take: 5,
      });
      return { foundInRequestedLocation: false, requestedLocation: location, alternatives: lodging };
    }

    return {
      foundInRequestedLocation: true,
      location: location ?? 'any',
      lodgingType,
      results: lodging,
    };
  },
});
