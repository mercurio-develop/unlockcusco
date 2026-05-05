import { prisma } from "@/lib/prisma";
import type { Business } from "@prisma/client";

interface UniversalSearchParams {
  query?: string;
  category?: string;
  location?: string;
  limit?: number;
}

/**
 * UniversalSearch: A single unified query function that searches across
 * Businesses, returning a sorted list of Businesses.
 */
export async function universalSearch({
  query,
  category,
  location,
  limit = 20
}: UniversalSearchParams): Promise<Business[]> {
  const queryLower = query?.toLowerCase().trim() || "";
  const locLower = location?.toLowerCase().trim() || "";

  // 1. Single unified DB query
  const businesses = await prisma.business.findMany({
    where: {
      AND: [
        queryLower ? {
          OR: [
            { name: { contains: queryLower } },
            { category: { contains: queryLower } },
            { tagline: { contains: queryLower } },
            { vehicleType: { contains: queryLower } },
          ]
        } : {},
        locLower ? {
          OR: [
            { locationSlug: { contains: locLower } },
            { serviceZones: { contains: locLower } },
          ]
        } : {},
        category ? { category: { equals: category } } : {}
      ]
    },
    orderBy: { rating: 'desc' },
    take: limit
  });

  return businesses;
}
