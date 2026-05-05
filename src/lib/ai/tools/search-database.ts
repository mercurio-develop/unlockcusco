import { tool } from 'ai';
import { z } from 'zod';
import { universalSearch } from '@/features/business/queries/universal-search';
import { kv } from '@vercel/kv';

export const searchDatabase = tool({
  description: 'Search database for businesses, activities, food, services. Use for simple "what is in X" queries.',
  inputSchema: z.object({
    query: z.string().describe("The type of business, e.g. coffee, textiles, taxi"),
    location: z.string().optional().describe("The specific town to search in, e.g. pisac, urubamba"),
  }),
  execute: async ({ query, location }) => {
    const cacheKey = `vallecito:search:v2:${query.toLowerCase().trim()}:${location ?? 'any'}`;
    
    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        const cached = await kv.get(cacheKey);
        if (cached) return cached;
      }
    } catch (e) {
      console.warn("KV Cache read failed:", e);
    }

    const results = await universalSearch({ query, location, limit: 10 });

    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        await kv.set(cacheKey, results, { ex: 86400 });
      }
    } catch (e) {
      console.warn("KV Cache write failed:", e);
    }
    
    return results;
  }
});
