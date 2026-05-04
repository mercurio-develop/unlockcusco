import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const searchRestaurants = tool({
  description: `Search the Restaurant table for dining options.
Use for ANY query about: eating, food, hungry, breakfast, lunch, dinner, coffee, cafe, restaurant, vegan, vegetarian, picantería, ceviche, menu, where to eat.
Do NOT use for lodging, transport, or activities.`,
  inputSchema: z.object({
    location: z.string().optional().describe('Town slug: pisac, urubamba, ollantaytambo, cusco, chinchero, maras'),
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'coffee', 'any']).default('any').describe('Meal type the tourist needs'),
    dietary: z.string().optional().describe('Dietary need: vegan, vegetarian, gluten-free'),
    budget: z.enum(['$', '$$', '$$$', 'any']).default('any'),
  }),
  execute: async ({ location, mealType, dietary, budget }) => {
    const where: Record<string, unknown> = {};

    if (location) {
      where.locationSlug = { contains: location.toLowerCase() };
    }
    if (mealType !== 'any') {
      where.mealService = { contains: mealType };
    }
    if (dietary) {
      where.dietaryOptions = { contains: dietary.toLowerCase() };
    }
    if (budget !== 'any') {
      where.priceTier = budget;
    }

    let restaurants = await prisma.restaurant.findMany({
      where,
      orderBy: { rating: 'desc' },
      take: 5,
    });

    // Fallback: drop location filter if empty
    if (restaurants.length === 0 && location) {
      delete (where as Record<string, unknown>).locationSlug;
      restaurants = await prisma.restaurant.findMany({
        where,
        orderBy: { rating: 'desc' },
        take: 5,
      });
      return { foundInRequestedLocation: false, requestedLocation: location, alternatives: restaurants };
    }

    return {
      foundInRequestedLocation: true,
      location: location ?? 'any',
      mealType,
      results: restaurants,
    };
  },
});
