/* eslint-disable @typescript-eslint/no-explicit-any */
import { tool } from 'ai';
import { z } from 'zod';
import { universalSearch } from '@/features/discovery/queries/universal-search';
import { Redis } from '@upstash/redis';
import { calculateDistance } from '@/lib/utils/geo';
import { normalizeLocation, SACRED_VALLEY_LOCATIONS } from '@/lib/ai/utils/location-normalizer';
import { sanitizeToolOutput } from '@/lib/ai/utils/sanitize-tool-output';
import type { Business } from "@prisma/client";

const DB_CATEGORY_MAP: Array<[string[], string]> = [
  [['dining','restaurant','food','eat','lunch','dinner','breakfast','coffee','cafe','ceviche','pizza','vegan','vegetarian','bar','drink','menu','gastro','comida','almuerzo','cena','eats','meal','supper','bistro'],
   'dining'],
  [['hotel','stay','stays','hostel','lodge','accommodation','sleep','airbnb','lodging','room','alojamiento','boutique','resort','inn'],
   'stays'],
  [['massage','spa','wellness','therapy','healer','healing','retreat','yoga','meditation'],
   'wellness'],
  [['taxi','transfer','driver','transport','car','shuttle','van','pickup','colectivo'],
   'transport'],
  [['hike','trek','adventure','atv','quad','climbing','zipline','rafting','canopy','active','sports','outdoors'],
   'adventure'],
  [['market','culture','ruins','craft','artisan','archeolog','village','history','historical','museum','local','community'],
   'culture'],
  [['textiles','weaving','weaver','tejido'],
   'textiles'],
  [['tour','agency','guide','excursion','package'],
   'agency'],
];

const payloadSchema = z.object({
  query: z.string().optional().describe("Broad fetch or specific name"),
  searchKeywords: z.array(z.string()).optional().describe("If the user asks for a vibe, concept, or specific item (e.g., 'romantic', 'pizza'), generate 3-5 related literal keywords that might appear in a business description (e.g., 'wine', 'view', 'candlelight', 'pizza', 'italian'). If it's a general request, leave empty or provide basic keywords."),
  category: z.string().optional().describe("The category to search for, e.g. DINING, STAYS, WELLNESS, TRANSPORT, ADVENTURE, CULTURE, TEXTILES, AGENCY"),
  location: z.string().optional().describe("The specific town to search in, e.g. pisac, urubamba"),
  userLat: z.number().optional(),
  userLng: z.number().optional(),
  intent: z.enum(['SET_START', 'SET_END', 'ADD_WAYPOINT', 'GENERAL']).optional().describe("Contextual intent for the search, determines UI buttons rendered for results.")
});

type Payload = z.infer<typeof payloadSchema>;

export const searchDatabase = tool({
  description: 'Search database for businesses, activities, food, services. Use for simple "what is in X" queries. Supports Spatial RAG by calculating real-world distances if coordinates are provided.',
  parameters: payloadSchema,
  execute: async ({ query, searchKeywords, category, location, userLat, userLng, intent }: Payload) => {
    let dbCategory: string | undefined = undefined;
    
    // Normalize location using the fuzzy matcher
    let searchLocation = location ? normalizeLocation(location) : null;
    
    // If the LLM forgot to put the location in the parameter, check the query
    if (!searchLocation && query) {
      const qLower = query.toLowerCase();
      for (const town of SACRED_VALLEY_LOCATIONS) {
        if (qLower.includes(town)) {
          searchLocation = town;
          break;
        }
      }
    }

    if (searchLocation === 'machupicchu' || searchLocation === 'aguas-calientes') {
      searchLocation = 'machu-picchu';
    }

    // Attempt to map category or first keyword to DB category
    const searchString = [category, query, ...(searchKeywords || [])].join(" ");
    const dbCategories = new Set<string>();
    for (const [keywords, cat] of DB_CATEGORY_MAP) {
      for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        if (regex.test(searchString)) {
          dbCategories.add(cat);
          break;
        }
      }
    }
    if (dbCategories.size > 0) {
      dbCategory = Array.from(dbCategories).join(',');
    }

    // Cache key based on basic parameters (we don't cache fuzzy keyword expansions to allow for varied results)
    const cacheKey = `unlockcusco:search:v10:q_${query ?? 'none'}:cat_${dbCategory ?? 'any'}:loc_${searchLocation ?? 'any'}`;
    
    const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
      ? Redis.fromEnv()
      : null;

    let results: Business[] | undefined;
    try {
      if (redis) {
        const cached = await redis.get<Business[]>(cacheKey);
        if (cached) results = cached;
      }
    } catch (e) {
      console.warn("KV Cache read failed:", e);
    }

    // If not cached, fetch broad category/location matches from Prisma
    if (!results) {
      try {
        // Construct a semantic query by combining provided query and keywords
        const semanticQuery = [query, ...(searchKeywords || [])].filter(Boolean).join(" ");

        results = await universalSearch({ 
          query: semanticQuery,
          category: dbCategory,
          location: searchLocation || undefined, 
          limit: 30 // Smaller limit since it's already ranked semantically
        });
      } catch (e) {
        console.error("universalSearch failed:", e);
        results = [];
      }

      if (results.length > 0 && redis) {
        try {
          await redis.set(cacheKey, results, { ex: 3600 }); // Cache for 1 hour
        } catch (e) {
          console.warn("KV Cache write failed:", e);
        }
      }
    }

    // Strict Filter: Only return businesses with valid ratings (> 0)
    results = results.filter((b) => typeof b.rating === 'number' && b.rating > 0);

    let isFallback = false;
    
    if (results.length === 0 && searchLocation) {
      try {
        const semanticQuery = [query, ...(searchKeywords || [])].filter(Boolean).join(" ");
        results = await universalSearch({
          query: semanticQuery,
          category: dbCategory,
          limit: 30
        });
        results = results.filter((b) => typeof b.rating === 'number' && b.rating > 0);
        if (results.length > 0) {
          isFallback = true;
        }
      } catch(e) {
        console.error("universalSearch fallback failed:", e);
      }
    }

    // Spatial RAG Enhancement: Inject distances and sort by proximity + rating
    if (userLat && userLng) {
      const withDistance = results.map((b) => {
        let distanceKm: number | null = null;
        if (b.lat && b.lng) {
          distanceKm = calculateDistance(userLat, userLng, b.lat, b.lng);
        }
        return { ...b, distanceKm };
      });

      withDistance.sort((a, b) => {
        if (a.distanceKm !== null && b.distanceKm === null) return -1;
        if (a.distanceKm === null && b.distanceKm !== null) return 1;
        
        if (a.distanceKm !== null && b.distanceKm !== null) {
          const scoreA = (a.rating ?? -1) * 2 - a.distanceKm + (a.isAsociado ? 10 : 0);
          const scoreB = (b.rating ?? -1) * 2 - b.distanceKm + (b.isAsociado ? 10 : 0);
          return scoreB - scoreA;
        }
        
        if (a.isAsociado !== b.isAsociado) return a.isAsociado ? -1 : 1;
        return (b.rating ?? -1) - (a.rating ?? -1);
      });

      const mappedResults = withDistance.slice(0, 10).map((b) => ({
        id: b.id,
        name: b.name,
        category: b.category,
        rating: b.rating,
        lat: b.lat,
        lng: b.lng,
        isAsociado: b.isAsociado,
        priceTier: b.priceTier,
        distanceKm: b.distanceKm ? Number(b.distanceKm).toFixed(1) + ' km away' : 'Distance unknown',
        whatsapp: b.whatsapp,
        tagline: b.tagline,
        description: b.description,
        descriptionEs: b.descriptionEs,
        imageUrl: b.imageUrl,
        slug: b.slug,
        locationSlug: b.locationSlug,
        recommendationNote: b.isAsociado ? "UnlockCusco Preferred Partner - Highly Recommended" : undefined
      }));

      return sanitizeToolOutput({
        intent,
        results: isFallback ? { alternatives: mappedResults, requestedLocation: searchLocation } : mappedResults
      });
    }
    
    // Return compressed view to save LLM tokens if no coords
    const mappedResults = results.slice(0, 10).map((b) => ({
      id: b.id,
      name: b.name,
      category: b.category,
      rating: b.rating,
      lat: b.lat,
      lng: b.lng,
      isAsociado: b.isAsociado,
      priceTier: b.priceTier,
      whatsapp: b.whatsapp,
      locationSlug: b.locationSlug,
      tagline: b.tagline,
      description: b.description,
      descriptionEs: b.descriptionEs,
      imageUrl: b.imageUrl,
      slug: b.slug,
      recommendationNote: b.isAsociado ? "UnlockCusco Preferred Partner - Highly Recommended" : undefined
    }));

    return sanitizeToolOutput({
      intent,
      results: mappedResults
    });
  }
     
} as any);
