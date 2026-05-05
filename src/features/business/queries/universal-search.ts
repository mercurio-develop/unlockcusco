import { prisma } from \"@/lib/prisma\";
import { mapBusinessToUniversal, mapTransportToUniversal, mapTherapistToUniversal } from \"@/lib/utils/entity-mappers\";
import type { UniversalService } from \"@/lib/types/trip\";

interface UniversalSearchParams {
  query?: string;
  category?: string;
  location?: string;
  limit?: number;
}

/**
 * UniversalSearch: A single unified query function that searches across
 * Businesses, Transport, and Therapists, returning a sorted list of UniversalServices.
 */
export async function universalSearch({
  query,
  category,
  location,
  limit = 20
}: UniversalSearchParams): Promise<UniversalService[]> {
  const queryLower = query?.toLowerCase().trim() || \"\";
  const locLower = location?.toLowerCase().trim() || \"\";

  // 1. Parallel DB queries (simplified for MVP, optimization can follow)
  const [businesses, transport, therapists] = await Promise.all([
    prisma.business.findMany({
      where: {
        AND: [
          query ? {
            OR: [
              { name: { contains: query } },
              { category: { contains: query } },
            ]
          } : {},
          location ? { locationSlug: { contains: location.toLowerCase() } } : {}
        ]
      },
      orderBy: { rating: 'desc' },
      take: limit
    }),
    prisma.transport.findMany({
      where: {
        AND: [
          query ? {
            OR: [
              { name: { contains: query } },
              { vehicleType: { contains: query } },
            ]
          } : {},
          location ? { serviceZones: { contains: location.toLowerCase() } } : {}
        ]
      },
      orderBy: { rating: 'desc' },
      take: limit
    }),
    prisma.therapist.findMany({
      where: {
        AND: [
          query ? {
            OR: [
              { name: { contains: query } },
              { tagline: { contains: query } },
            ]
          } : {},
          location ? { location: { contains: location } } : {}
        ]
      },
      orderBy: { rating: 'desc' },
      take: limit
    })
  ]);

  // 2. Map and Combine
  const results: UniversalService[] = [
    ...businesses.map(mapBusinessToUniversal),
    ...transport.map(mapTransportToUniversal),
    ...therapists.map(mapTherapistToUniversal)
  ];

  // 3. Global sort by rating and search relevance
  return results
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit);
}
