import type { Business } from "@prisma/client"

export function getVisibleBusinesses(
  effectiveBusinesses: Business[], 
  mapBounds: [number, number, number, number] | null, 
  isSearchActive: boolean
): Business[] {
  if (isSearchActive) return effectiveBusinesses;
  if (!mapBounds) return [];
  if (effectiveBusinesses.length === 0) return effectiveBusinesses;
  
  const [west, south, east, north] = mapBounds;
  const centerLat = (south + north) / 2;
  const centerLng = (west + east) / 2;

  const inside: Business[] = [];
  const outside: Business[] = [];

  effectiveBusinesses.forEach(b => {
    if (b.lat == null || b.lng == null) {
      outside.push(b);
      return;
    }
    const lat = Number(b.lat);
    const lng = Number(b.lng);
    if (lng >= west && lng <= east && lat >= south && lat <= north) {
      inside.push(b);
    } else {
      outside.push(b);
    }
  });

  outside.sort((a, b) => {
    if (a.lat == null || a.lng == null) return 1;
    if (b.lat == null || b.lng == null) return -1;
    const distA = Math.pow(Number(a.lat) - centerLat, 2) + Math.pow(Number(a.lng) - centerLng, 2);
    const distB = Math.pow(Number(b.lat) - centerLat, 2) + Math.pow(Number(b.lng) - centerLng, 2);
    return distA - distB;
  });

  return [...inside, ...outside];
}

export function getEffectiveMapBusinesses(
  mapBusinesses: Business[],
  mapSearchResults?: Business[] | null
): Business[] {
  if (!mapSearchResults || mapSearchResults.length === 0) return mapBusinesses;
  const searchMap = new Map(mapSearchResults.map(b => [b.id, b]));
  const otherBusinesses = mapBusinesses.filter(b => !searchMap.has(b.id));
  return [...Array.from(searchMap.values()), ...otherBusinesses];
}
