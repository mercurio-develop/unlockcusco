import { prisma } from "@/lib/prisma";
import type { Business } from "@prisma/client";
import { embed } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

interface UniversalSearchParams {
  query?: string;
  category?: string;
  location?: string;
  limit?: number;
}

/**
 * UniversalSearch: A single unified query function that searches across
 * Businesses, returning a sorted list of Businesses using semantic similarity.
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

  if (queryLower) {
    try {
      // 1. First, fetch explicit name matches to guarantee they appear at the top
      const nameMatches = await prisma.business.findMany({
        where: {
          AND: [
            { name: { contains: queryLower, mode: 'insensitive' as const } },
            ...(locLower ? [{
              OR: locLower.split(',').flatMap(l => {
                const locPart = l.trim();
                return [
                  { locationSlug: { contains: locPart, mode: 'insensitive' as const } },
                  { serviceZones: { contains: locPart, mode: 'insensitive' as const } },
                ];
              })
            }] : []),
            ...(category ? [{
              OR: category.split(',').map(c => {
                const catStr = c.trim();
                const upper = catStr.toUpperCase();
                const matches = [catStr];
                if (upper === 'DINING') matches.push('Meal', 'MEAL', 'meal');
                if (upper === 'STAYS') matches.push('Stay', 'STAY', 'stay');
                if (upper === 'ADVENTURE' || upper === 'AGENCY') matches.push('Experience', 'EXPERIENCE', 'experience');
                if (upper === 'BOLETO') matches.push('Tourist Ticket', 'TOURIST TICKET', 'tourist ticket');
                return { category: { in: matches, mode: 'insensitive' as const } };
              })
            }] : [])
          ]
        },
        take: 5
      });

      // 2. Then do the semantic vector search
      const { embedding } = await embed({
        model: google.textEmbeddingModel('gemini-embedding-2'),
        value: queryLower,
      });

      // Fetch top semantic matches using pgvector cosine distance (<->)
      // We fetch more than limit to allow filtering while maintaining relevance
      const rawResults = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id
        FROM "Business"
        WHERE embedding IS NOT NULL
        ORDER BY embedding <-> ${embedding}::vector
        LIMIT 100
      `;

      if (rawResults.length > 0 || nameMatches.length > 0) {
        const businessIds = rawResults.map(r => r.id);

        let businesses: Business[] = [];
        if (businessIds.length > 0) {
          businesses = await prisma.business.findMany({
            where: {
              AND: [
                { id: { in: businessIds } },
                ...(locLower ? [{
                  OR: locLower.split(',').flatMap(l => {
                    const locPart = l.trim();
                    return [
                      { locationSlug: { contains: locPart, mode: 'insensitive' as const } },
                      { serviceZones: { contains: locPart, mode: 'insensitive' as const } },
                    ];
                  })
                }] : []),
                ...(category ? [{
                  OR: category.split(',').map(c => {
                    const catStr = c.trim();
                    const upper = catStr.toUpperCase();
                    const matches = [catStr];
                    if (upper === 'DINING') matches.push('Meal', 'MEAL', 'meal');
                    if (upper === 'STAYS') matches.push('Stay', 'STAY', 'stay');
                    if (upper === 'ADVENTURE' || upper === 'AGENCY') matches.push('Experience', 'EXPERIENCE', 'experience');
                    if (upper === 'BOLETO') matches.push('Tourist Ticket', 'TOURIST TICKET', 'tourist ticket');
                    return { category: { in: matches, mode: 'insensitive' as const } };
                  })
                }] : [])
              ]
            },
          });
        }

        // Re-sort in memory to maintain semantic distance order
        const semanticBusinesses = businessIds
          .map(id => businesses.find(b => b.id === id))
          .filter((b): b is Business => b !== undefined);

        // Combine name matches and semantic matches, filtering duplicates
        const combinedMap = new Map<string, Business>();
        
        nameMatches.forEach(b => combinedMap.set(b.id, b));
        semanticBusinesses.forEach(b => {
          if (!combinedMap.has(b.id)) {
            combinedMap.set(b.id, b);
          }
        });

        const finalResults = Array.from(combinedMap.values()).slice(0, limit);

        if (finalResults.length > 0) return finalResults;
      }
    } catch (e) {
      console.error("Vector search failed, falling back to lexical:", e);
    }
  }

  // Lexical fallback or default view
  const businesses = (await prisma.business.findMany({
    where: {
      AND: [
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
    take: limit,
    omit: {
      longDescription: true,
      longDescriptionEs: true,
      seoMetaDescEs: true,
      openingHours: true,
      heroImages: true,
      socialLinks: true,
      featuresJson: true,
      themeConfig: true,
    }
  })) as Business[];

  return businesses;
}
