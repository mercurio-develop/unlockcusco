"use server";

import { prisma } from "@/lib/prisma";
import type { BusinessWithRelations } from "../types/business-detail";

export async function getBusinessBySlug(
  slug: string
): Promise<BusinessWithRelations | null> {
  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      reviews: {
        take: 10,
        orderBy: { rating: "desc" },
      },
      services: true,
      premiumProfile: {
        include: {
          pillars: true,
        },
      },
      tourPackages: true,
    },
  });

  return business as BusinessWithRelations | null;
}

export async function getBusinessForMetadata(slug: string) {
  return prisma.business.findUnique({
    where: { slug },
    include: { premiumProfile: true },
  });
}
