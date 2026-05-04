import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { calculateDistance } from '@/lib/utils/geo';
import { trackAiRecommendation } from '@/features/business/actions/track-ai';
import { COORDS_MAP } from '@/lib/constants';

function getCoords(location: string) {
  const lower = location.toLowerCase();
  for (const [key, coords] of Object.entries(COORDS_MAP)) {
    if (lower.includes(key)) return { ...coords };
  }
  return { ...COORDS_MAP.urubamba };
}

function score(rating: number, distKm: number) {
  return (rating ? rating / 20 : 0) * 0.6 + Math.max(0, 10 - distKm) * 0.4;
}

const DESIRE_MAP: Record<string, { category: string; icon: string; cost: number; keywords: string[] }> = {
  coffee:     { category: 'Dining',   icon: '☕', cost: 12, keywords: ['coffee', 'cafe', 'cafeteria'] },
  cafe:       { category: 'Dining',   icon: '☕', cost: 12, keywords: ['coffee', 'cafe', 'cafeteria'] },
  breakfast:  { category: 'Dining',   icon: '🥐', cost: 15, keywords: ['breakfast', 'desayuno', 'brunch'] },
  lunch:      { category: 'Dining',   icon: '🍽️', cost: 20, keywords: ['lunch', 'almuerzo', 'restaurant', 'food'] },
  dinner:     { category: 'Dining',   icon: '🍽️', cost: 25, keywords: ['dinner', 'cena', 'restaurant', 'food'] },
  food:       { category: 'Dining',   icon: '🍽️', cost: 20, keywords: ['food', 'comida', 'restaurant'] },
  restaurant: { category: 'Dining',   icon: '🍽️', cost: 25, keywords: ['restaurant', 'comida', 'food'] },
  market:     { category: 'Culture',  icon: '🛍️', cost: 0,  keywords: ['market', 'mercado', 'artisan', 'textiles'] },
  ruins:      { category: 'Culture',  icon: '🏺', cost: 10, keywords: ['ruins', 'ruinas', 'archeological', 'site'] },
  culture:    { category: 'Culture',  icon: '🏺', cost: 10, keywords: ['culture', 'cultura', 'tradition', 'village'] },
  hike:       { category: 'Adventure', icon: '🥾', cost: 15, keywords: ['hike', 'trek', 'walk', 'mountain'] },
  atv:        { category: 'Adventure', icon: '🏍️', cost: 40, keywords: ['atv', 'quad', 'motorcycle'] },
  adventure:  { category: 'Adventure', icon: '🥾', cost: 20, keywords: ['adventure', 'aventura', 'trek', 'climb'] },
  massage:    { category: 'Wellness',  icon: '🧘', cost: 35, keywords: ['massage', 'masaje', 'spa', 'therapy'] },
  spa:        { category: 'Wellness',  icon: '🧘', cost: 35, keywords: ['spa', 'wellness', 'relaxation', 'massage'] },
};

function resolveDesire(desire: string) {
  const key = desire.toLowerCase();
  for (const [pattern, meta] of Object.entries(DESIRE_MAP)) {
    if (key.includes(pattern)) return meta;
  }
  return { category: 'Dining', icon: '📍', cost: 15, keywords: [key] };
}

export const buildItinerary = tool({
  description: `Builds a complete, bookable day itinerary for a tourist in the Sacred Valley.
Queries the real database for best-rated places near each location, returns top 3 swappable alternatives per step.
USE THIS for any request involving: travel between towns, coffee/food/activities, accommodation, or planning a day.
CALL IT as soon as you have origin + destination. Ask for missing info conversationally first if needed.`,

  inputSchema: z.object({
    originLocation: z.string().describe('Tourist\'s current location, e.g. "Pisac"'),
    destination:    z.string().describe('Final destination for the night, e.g. "Ollantaytambo"'),
    desires:        z.array(z.string()).describe('Stops the tourist wants, e.g. ["coffee", "market"]'),
    constraints:    z.string().optional().describe('Any constraints: "train at 6am", "vegetarian", "budget"'),
  }),

  execute: async ({ originLocation, destination, desires, constraints }) => {
    const originCoords = getCoords(originLocation);
    const destCoords   = getCoords(destination);
    
    // BOUNDED CORRIDOR ALGORITHM
    const VALLEY_ARRAY = ["cusco", "taray", "pisac", "calca", "urubamba", "ollantaytambo"];
    const PLATEAU_ARRAY = ["cusco", "poroy", "chinchero", "maras", "moray", "urubamba", "ollantaytambo"];
    
    let corridor: string[] = [originLocation.toLowerCase(), destination.toLowerCase()];
    
    const getCorridor = (arr: string[]) => {
      const oIdx = arr.findIndex(t => originLocation.toLowerCase().includes(t));
      const dIdx = arr.findIndex(t => destination.toLowerCase().includes(t));
      if (oIdx !== -1 && dIdx !== -1) {
        const start = Math.min(oIdx, dIdx);
        const end = Math.max(oIdx, dIdx);
        return arr.slice(start, end + 1);
      }
      return null;
    };

    const valleyCorridor = getCorridor(VALLEY_ARRAY);
    const plateauCorridor = getCorridor(PLATEAU_ARRAY);
    
    if (valleyCorridor && plateauCorridor) {
      // Pick the shorter corridor if both match (e.g. Cusco to Urubamba)
      corridor = valleyCorridor.length <= plateauCorridor.length ? valleyCorridor : plateauCorridor;
    } else if (valleyCorridor) {
      corridor = valleyCorridor;
    } else if (plateauCorridor) {
      corridor = plateauCorridor;
    }

    const waypoints = [];
    const recommendedIds = new Set<string>();
    const usedLocationSlugs = new Set<string>();
    const usedBusinessIds = new Set<string>();

    // --- Activity steps (Nodes) ---
    for (const desire of desires) {
      const { category, cost, keywords } = resolveDesire(desire);

      const sharedWhere = {
        locationSlug: { in: corridor },
        id: { notIn: Array.from(usedBusinessIds) },
        OR: [
          { name: { contains: desire } },
          ...keywords.map(kw => ({ name: { contains: kw } })),
        ],
      };

      // Route to the correct domain table
      let candidates: { id: string; name: string; lat: number | null; lng: number | null; rating: number | null; locationSlug: string; whatsapp: string | null; category: string; categorySlug?: string; scoreQuality?: number }[];

      if (category === 'Dining') {
        const rows = await prisma.restaurant.findMany({
          where: { locationSlug: { in: corridor }, id: { notIn: Array.from(usedBusinessIds) }, OR: [{ name: { contains: desire } }, ...keywords.map(kw => ({ name: { contains: kw } }))] },
          orderBy: { rating: 'desc' },
          take: 50,
        });
        candidates = rows.map(r => ({ ...r, category: 'Dining', categorySlug: 'dining' }));
      } else if (category === 'Stays') {
        const rows = await prisma.lodging.findMany({
          where: { locationSlug: { in: corridor }, id: { notIn: Array.from(usedBusinessIds) }, OR: [{ name: { contains: desire } }, ...keywords.map(kw => ({ name: { contains: kw } }))] },
          orderBy: { rating: 'desc' },
          take: 50,
        });
        candidates = rows.map(r => ({ ...r, category: 'Stays', categorySlug: 'stays' }));
      } else {
        candidates = await prisma.business.findMany({
          where: {
            ...sharedWhere,
            NOT: { category: { in: ['Dining', 'Stays', 'Descanso'] } },
            OR: [
              { category: { equals: category } },
              { categorySlug: { in: keywords } },
              { name: { contains: desire } },
              ...keywords.map(kw => ({ name: { contains: kw } })),
              ...keywords.map(kw => ({ categorySlug: { contains: kw } })),
            ],
          },
          orderBy: { rating: 'desc' },
          take: 50,
        });
      }

      const alts = candidates
        .filter(b => b.lat !== null && b.lng !== null && b.rating !== null)
        .map(b => {
          const lat = b.lat as number;
          const lng = b.lng as number;
          const dist = calculateDistance(originCoords.lat, originCoords.lng, lat, lng);
          
          // Boost score if the town hasn't been used yet to encourage distribution
          let locationBoost = usedLocationSlugs.has(b.locationSlug) ? 0 : 0.5;
          
          return { b, dist, s: score(b.rating! + locationBoost, dist) };
        })
        .sort((a, b) => b.s - a.s)
        .slice(0, 3)
        .map(({ b, dist }) => ({
          id: b.id,
          name: b.name,
          rating: b.rating!,
          lat: b.lat,
          lng: b.lng,
          whatsapp: b.whatsapp ?? undefined,
          distanceKm: dist.toFixed(1),
          category: b.category,
          cost,
          locationSlug: b.locationSlug,
        }));

      if (alts.length === 0) continue;

      const selected = alts[0];
      usedLocationSlugs.add(selected.locationSlug);
      usedBusinessIds.add(selected.id);
      
      const primaryLoc = selected.locationSlug ? (selected.locationSlug.charAt(0).toUpperCase() + selected.locationSlug.slice(1)) : originLocation;
      const actualLocation = primaryLoc.toLowerCase() !== originLocation.toLowerCase() ? primaryLoc : originLocation;

      alts.forEach(a => recommendedIds.add(a.id));

      const displayCategory = desire.charAt(0).toUpperCase() + desire.slice(1);

      waypoints.push({
        id: selected.id,
        category: displayCategory,
        title: selected.name,
        locationStr: actualLocation,
        durationMins: 90,
        priceUsd: cost,
        lat: selected.lat,
        lng: selected.lng,
        rating: (selected as any).scoreQuality ? (selected as any).scoreQuality / 20 : 0,
        alternatives: alts
      });
    }

    // Sort waypoints geographically (by distance from origin) to prevent zigzagging routes
    waypoints.sort((a, b) => {
      const distA = calculateDistance(originCoords.lat, originCoords.lng, a.lat!, a.lng!);
      const distB = calculateDistance(originCoords.lat, originCoords.lng, b.lat!, b.lng!);
      return distA - distB;
    });

    // --- Transit Edges ---
    const transitEdges = [];
    
    // Create edges connecting origin -> waypoints -> destination
    const nodes = [
      { locationStr: originLocation, coords: originCoords },
      ...waypoints.map(w => ({ locationStr: w.locationStr, coords: { lat: w.lat!, lng: w.lng! } })),
      { locationStr: destination, coords: destCoords }
    ];

    for (let i = 0; i < nodes.length - 1; i++) {
      const fromNode = nodes[i];
      const toNode = nodes[i + 1];
      
      const transitKm = calculateDistance(fromNode.coords.lat, fromNode.coords.lng, toNode.coords.lat, toNode.coords.lng);
      const transitCost = Math.max(15, Math.round(transitKm * 1.8));

      const taxiRows = await prisma.business.findMany({
        where: {
          categorySlug: 'taxi',
        }
      });

      const oLower = fromNode.locationStr.toLowerCase();
      const dLower = toNode.locationStr.toLowerCase();

      const validTaxis = taxiRows.filter(t => {
        const zones = JSON.parse((t as any).serviceZones || "[]") as string[];
        return zones.some(z => oLower.includes(z) || dLower.includes(z));
      }).map(t => {
        const zones = JSON.parse((t as any).serviceZones || "[]") as string[];
        const coversBoth = zones.some(z => oLower.includes(z)) && zones.some(z => dLower.includes(z));
        return { ...t, coversBoth, zonesCount: zones.length, zones };
      }).sort((a, b) => {
        if (a.coversBoth && !b.coversBoth) return -1;
        if (!a.coversBoth && b.coversBoth) return 1;
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;
        if (ratingA !== ratingB) return ratingB - ratingA;
        return (b as any).zonesCount - (a as any).zonesCount;
      });

      if (validTaxis.length > 0) {
        validTaxis.slice(0, 3).forEach(t => recommendedIds.add(t.id));
        const alternatives = validTaxis.slice(1, 3).map(t => ({
          id: t.id,
          name: t.name,
          priceUsd: transitCost,
          whatsapp: t.whatsapp ?? undefined,
        }));
        
        // Add public transport option
        alternatives.push({
          id: 'colectivo-' + fromNode.locationStr,
          name: 'Public Transport (Colectivo)',
          priceUsd: Math.max(1, Math.round(transitKm * 0.15)),
          whatsapp: undefined,
        });

        transitEdges.push({
          fromLocation: fromNode.locationStr,
          toLocation: toNode.locationStr,
          defaultDriver: {
            id: validTaxis[0].id,
            name: validTaxis[0].name,
            priceUsd: transitCost,
            whatsapp: validTaxis[0].whatsapp ?? undefined,
          },
          alternativeDrivers: alternatives
        });
      } else {
        transitEdges.push({
          fromLocation: fromNode.locationStr,
          toLocation: toNode.locationStr,
          defaultDriver: {
            id: 'valle-safe-' + fromNode.locationStr,
            name: 'Valle Safe SUV',
            priceUsd: transitCost,
          },
          alternativeDrivers: [
            { id: 'sv-transfers-' + fromNode.locationStr, name: 'Sacred Valley Transfers', priceUsd: Math.max(10, transitCost - 5), whatsapp: undefined },
            { id: 'colectivo-' + fromNode.locationStr, name: 'Public Transport (Colectivo)', priceUsd: Math.max(1, Math.round(transitKm * 0.15)), whatsapp: undefined }
          ]
        });
      }
    }

    // Track AI Recommendations
    try {
      for (const id of Array.from(recommendedIds)) {
        trackAiRecommendation(id).catch(console.error);
      }
    } catch (e) {
      console.error("Failed to track AI recommendations:", e);
    }

    return {
      origin: {
        title: originLocation,
        locationStr: originLocation,
        lat: originCoords.lat,
        lng: originCoords.lng,
      },
      destination: {
        title: destination,
        locationStr: destination,
        lat: destCoords.lat,
        lng: destCoords.lng,
      },
      needsAccommodationUpsell: true,
      waypoints,
      transitEdges,
      title: `${originLocation} → ${destination}`,
      constraints: constraints ?? '',
      totalCost: waypoints.reduce((sum, w) => sum + (w.priceUsd ?? 0), 0) + transitEdges.reduce((sum, e) => sum + (e.defaultDriver.priceUsd ?? 0), 0)
    };
  },
});
