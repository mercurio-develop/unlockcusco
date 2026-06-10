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

  const result = await prisma.$queryRaw<
    (Business & { dist: number })[]
  >`
    SELECT *,
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
    HAVING (
        6371 * acos(
          cos(radians(${lat})) * cos(radians(lat)) *
          cos(radians(lng) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(lat))
        )
      ) <= ${radiusKm}
    ORDER BY rating DESC NULLS LAST, dist ASC
    LIMIT ${limit}
  `;

  return result;
}
