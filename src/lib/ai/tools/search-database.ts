import { tool, jsonSchema } from 'ai';
import { z } from 'zod';
import { universalSearch } from '@/features/discovery/queries/universal-search';
import { Redis } from '@upstash/redis';
import { calculateDistance } from '@/lib/utils/geo';
import { normalizeLocation } from '@/lib/ai/utils/location-normalizer';
import Fuse from 'fuse.js';

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

export const searchDatabase = tool({
  description: 'Search database for businesses, activities, food, services. Use for simple "what is in X" queries. Supports Spatial RAG by calculating real-world distances if coordinates are provided.',
  parameters: jsonSchema({
    type: 'object',
    properties: {
      searchKeywords: { 
        type: 'array', 
        items: { type: 'string' },
        description: "If the user asks for a vibe, concept, or specific item (e.g., 'romantic', 'pizza'), generate 3-5 related literal keywords that might appear in a business description (e.g., 'wine', 'view', 'candlelight', 'pizza', 'italian'). If it's a general request, leave empty or provide basic keywords." 
      },
      category: { type: 'string', description: "The category to search for, e.g. DINING, STAYS, WELLNESS, TRANSPORT, ADVENTURE, CULTURE, TEXTILES, AGENCY" },
      location: { type: 'string', description: "The specific town to search in, e.g. pisac, urubamba" },
      userLat: { type: 'number' },
      userLng: { type: 'number' }
    },
    required: []
  }),
  // @ts-ignore
  execute: async ({ query, searchKeywords, category, location, userLat, userLng }: any) => {
    let dbCategory: string | undefined = undefined;
    
    // Normalize location using the fuzzy matcher
    let searchLocation = location ? normalizeLocation(location) : null;
    
    if (searchLocation === 'machupicchu' || searchLocation === 'aguas-calientes') {
      searchLocation = 'machu-picchu';
    }

    // Attempt to map category or first keyword to DB category
    const searchString = [category, ...(searchKeywords || [])].join(" ");
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
    const cacheKey = `vallecito:search:v8:q_${query ?? 'none'}:cat_${dbCategory ?? 'any'}:loc_${searchLocation ?? 'any'}`;
    
    const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
      ? Redis.fromEnv()
      : null;

    let results: Record<string, unknown>[] | undefined;
    try {
      if (redis) {
        const cached = await redis.get<Record<string, unknown>[]>(cacheKey);
        if (cached) results = cached;
      }
    } catch (e) {
      console.warn("KV Cache read failed:", e);
    }

    // If not cached, fetch broad category/location matches from Prisma
    if (!results) {
      try {
        results = (await universalSearch({ 
          query: query || "", // Broad fetch or specific name
          category: dbCategory,
          location: searchLocation || undefined, 
          limit: 100 // Fetch a larger pool for in-memory fuzzy matching
        })) as unknown as Record<string, unknown>[];
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
    results = results.filter((b: any) => typeof b.rating === 'number' && b.rating > 0);

    // Apply In-Memory Fuzzy Search if keywords exist
    if (searchKeywords && searchKeywords.length > 0 && results.length > 0) {
      const fuse = new Fuse(results, {
        keys: ['name', 'tagline', 'description', 'specialties', 'category'],
        includeScore: true,
        threshold: 0.6, // Allow some fuzziness for semantic matching
        ignoreLocation: true,
      });

      // Join keywords into a single string for Fuse to score across all text fields
      const queryStr = searchKeywords.join(" ");
      const fuzzyResults = fuse.search(queryStr);
      
      // Map back to the original objects, keeping only matches
      if (fuzzyResults.length > 0) {
        results = fuzzyResults.map(res => res.item as Record<string, unknown>);
      }
    }

    // Spatial RAG Enhancement: Inject distances and sort by proximity + rating
    if (userLat && userLng) {
      const withDistance = results.map((b: any) => {
        let distanceKm = null;
        if (b.lat && b.lng) {
          distanceKm = calculateDistance(userLat, userLng, b.lat as number, b.lng as number);
        }
        return { ...b, distanceKm };
      });

      withDistance.sort((a: { distanceKm?: number | null; isAsociado?: boolean; rating?: number | null }, b: { distanceKm?: number | null; isAsociado?: boolean; rating?: number | null }) => {
        if (a.distanceKm !== null && b.distanceKm === null) return -1;
        if (a.distanceKm === null && b.distanceKm !== null) return 1;
        
        if (a.distanceKm !== null && a.distanceKm !== undefined && b.distanceKm !== null && b.distanceKm !== undefined) {
          const scoreA = (a.rating ?? -1) * 2 - a.distanceKm + (a.isAsociado ? 10 : 0);
          const scoreB = (b.rating ?? -1) * 2 - b.distanceKm + (b.isAsociado ? 10 : 0);
          return scoreB - scoreA;
        }
        
        if (a.isAsociado !== b.isAsociado) return a.isAsociado ? -1 : 1;
        return (b.rating ?? -1) - (a.rating ?? -1);
      });

      return withDistance.slice(0, 10).map((b: Record<string, unknown>) => ({
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
        imageUrl: b.imageUrl,
        slug: b.slug,
        recommendationNote: b.isAsociado ? "Vallecito Preferred Partner - Highly Recommended" : undefined
      }));
    }
    
    // Return compressed view to save LLM tokens if no coords
    return results.slice(0, 10).map((b: Record<string, unknown>) => ({
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
      imageUrl: b.imageUrl,
      slug: b.slug,
      recommendationNote: b.isAsociado ? "Vallecito Preferred Partner - Highly Recommended" : undefined
    }));
  }
});
