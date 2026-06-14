import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Business } from "@prisma/client";

/**
 * Uses the Haversine formula directly in PostgreSQL to calculate distance
 * and find nearby businesses of the specified categories.
 */
export async function getNearbyBusinesses(
  lat: number,
  lng: number,
  categories: string[],
  excludeId: string,
  limit: number = 10,
  radiusKm: number = 2
): Promise<(Business & { dist: number })[]> {
  const upperCategories = categories.map(c => c.toUpperCase());

  // Fetch only IDs and distances via raw query to avoid Prisma crashing on the Unsupported 'vector' type
  const rawResult = await prisma.$queryRaw<
    { id: string; dist: number }[]
  >`
    SELECT id,
      (
        6371 * acos(
          cos(radians(${lat})) * cos(radians(lat)) *
          cos(radians(lng) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(lat))
        )
      ) AS dist
    FROM "Business"
    WHERE
      id != ${excludeId}
      AND lat IS NOT NULL
      AND lng IS NOT NULL
      AND UPPER(category) IN (${Prisma.join(upperCategories)})
      AND (
        6371 * acos(
          cos(radians(${lat})) * cos(radians(lat)) *
          cos(radians(lng) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(lat))
        )
      ) <= ${radiusKm}
    ORDER BY rating DESC NULLS LAST, dist ASC
    LIMIT ${limit}
  `;

  if (rawResult.length === 0) return [];

  // Fetch the full business records securely using Prisma
  const businesses = await prisma.business.findMany({
    where: {
      id: { in: rawResult.map((r) => r.id) }
    }
  });

  // Map the distances back and maintain the ordered sorting from the raw query
  return rawResult.map((raw) => {
    const business = businesses.find((b) => b.id === raw.id)!;
    return {
      ...business,
      dist: raw.dist
    };
  }).filter(b => b.id); // Filter out any mismatched records just in case
}
