"use server"

import { prisma } from "@/lib/prisma"

export async function fetchAccommodations(destination: string) {
  try {
    const stayRows = await prisma.business.findMany({
      where: {
        category: 'place',
        locationSlug: { contains: destination.toLowerCase() },
        OR: [
          { category: { contains: 'STAY' } },
          { category: { contains: 'Stay' } },
          { category: { contains: 'Hotel' } },
          { category: { contains: 'Hostel' } },
        ],
      },
      orderBy: { rating: 'desc' },
      take: 5,
    });

    return stayRows.map((b) => ({
      id: b.id,
      name: b.name,
      rating: b.rating,
      lat: b.lat,
      lng: b.lng,
      whatsapp: b.whatsapp ?? undefined,
      category: 'Stay',
      cost: 60,
      locationSlug: b.locationSlug,
    }));
  } catch (error) {
    console.error("Failed to fetch accommodations:", error);
    return [];
  }
}
