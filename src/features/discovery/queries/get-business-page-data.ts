"use server";

import type { Business } from "@prisma/client";
import type { Locale } from "@/paths";
import { getNearbyBusinesses } from "./get-nearby-businesses";
import { getBusinessBySlug } from "./get-business-by-slug";
import { buildBusinessJsonLd } from "../utils/build-business-seo";
import {
  getBusinessDisplayNames,
  getBusinessHeroImages,
  getPremiumThemeFlags,
  localizeBusiness,
} from "../utils/business-detail-helpers";
import type { BusinessWithRelations } from "../types/business-detail";

export async function getBusinessPageData(slug: string, lang: Locale) {
  const raw = await getBusinessBySlug(slug);
  if (!raw) return null;

  const business = localizeBusiness(raw, lang);
  const display = getBusinessDisplayNames(business, lang);
  const images = getBusinessHeroImages(business);
  const theme = getPremiumThemeFlags(business);
  const jsonLd = buildBusinessJsonLd(business, lang);

  let comparableExperiences: Business[] = [];
  if (business.category && business.lat !== null && business.lng !== null) {
    comparableExperiences = await getNearbyBusinesses(
      business.lat,
      business.lng,
      [business.category],
      business.id,
      5,
      20
    );
  }

  let nearbyStays: Business[] = [];
  let nearbyDining: Business[] = [];

  if (
    business.category?.toUpperCase() === "BOLETO" &&
    business.lat !== null &&
    business.lng !== null
  ) {
    nearbyStays = await getNearbyBusinesses(
      business.lat,
      business.lng,
      ["STAYS", "STAY"],
      business.id,
      8,
      2
    );
    nearbyDining = await getNearbyBusinesses(
      business.lat,
      business.lng,
      ["DINING", "MEAL"],
      business.id,
      8,
      2
    );
  }

  return {
    business: business as BusinessWithRelations,
    display,
    images,
    theme,
    jsonLd,
    comparableExperiences,
    nearbyStays,
    nearbyDining,
  };
}
