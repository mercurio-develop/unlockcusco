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
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 1);

  // 1. Single unified DB query
  const businesses = await prisma.business.findMany({
    where: {
      AND: [
        // Match all words in the query (if provided)
        ...queryWords.map(word => ({
          OR: [
            { name: { contains: word, mode: 'insensitive' as const } },
            { category: { contains: word, mode: 'insensitive' as const } },
            { tagline: { contains: word, mode: 'insensitive' as const } },
            { description: { contains: word, mode: 'insensitive' as const } },
            { specialties: { contains: word, mode: 'insensitive' as const } },
            { vehicleType: { contains: word, mode: 'insensitive' as const } },
          ]
        })),
        locLower ? {
          OR: locLower.split(',').flatMap(l => {
            const locPart = l.trim();
            return [
              { locationSlug: { contains: locPart, mode: 'insensitive' as const } },
              { serviceZones: { contains: locPart, mode: 'insensitive' as const } },
            ];
          })
        } : {},
        category ? {
          OR: category.split(',').map(c => {
            const catStr = c.trim();
            const upper = catStr.toUpperCase();
            const matches = [catStr];
            if (upper === 'DINING') matches.push('Meal', 'MEAL', 'meal');
            if (upper === 'STAYS') matches.push('Stay', 'STAY', 'stay');
            if (upper === 'ADVENTURE' || upper === 'AGENCY') matches.push('Experience', 'EXPERIENCE', 'experience');
            if (upper === 'BOLETO') matches.push('Tourist Ticket', 'TOURIST TICKET', 'tourist ticket');
            
            return {
              category: { in: matches, mode: 'insensitive' as const }
            };
          })
        } : {}
      ]
    },
    orderBy: [
      { isAsociado: 'desc' },
      { rating: { sort: 'desc', nulls: 'last' } }
    ],
    take: limit
  });

  return businesses;
}
