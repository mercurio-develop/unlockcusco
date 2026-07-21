import type { Locale } from "@/paths";
import type { BusinessWithRelations } from "../types/business-detail";

export function localizeBusiness(
  business: BusinessWithRelations,
  lang: Locale
): BusinessWithRelations {
  const isEs = lang === "es";
  const localized = { ...business };

  localized.description = business.longDescription || business.description;

  if (!isEs) {
    return localized;
  }

  localized.name = business.nameEs || business.name;
  localized.category = business.categoryEs || business.category;
  localized.tagline = business.taglineEs || business.tagline;
  localized.description =
    business.longDescriptionEs ||
    business.descriptionEs ||
    localized.description;
  localized.specialties = business.specialtiesEs || business.specialties;

  localized.services = business.services.map((s) => ({
    ...s,
    title: s.titleEs || s.title,
    description: s.descriptionEs || s.description,
  }));

  localized.tourPackages = business.tourPackages.map((t) => ({
    ...t,
    title: t.titleEs || t.title,
    tagline: t.taglineEs || t.tagline,
    description: t.descriptionEs || t.description,
    included: t.includedEs || t.included,
    highlights: t.highlightsEs || t.highlights,
    itinerary: t.itineraryEs || t.itinerary,
  }));

  if (localized.premiumProfile) {
    localized.premiumProfile = {
      ...localized.premiumProfile,
      pillars: localized.premiumProfile.pillars.map((p) => ({
        ...p,
        title: p.titleEs || p.title,
        description: p.descriptionEs || p.description,
      })),
    };
  }

  return localized;
}

export function getBusinessDisplayNames(
  business: BusinessWithRelations,
  lang: Locale
) {
  const isEs = lang === "es";
  const bName = isEs && business.nameEs ? business.nameEs : business.name;
  const categoryName = business.category
    ? business.category.charAt(0).toUpperCase() +
      business.category.slice(1).toLowerCase()
    : business.category;
  const locationName = business.locationSlug
    ? business.locationSlug.charAt(0).toUpperCase() +
      business.locationSlug.slice(1)
    : isEs
      ? "el Valle Sagrado"
      : "the Sacred Valley";

  return { isEs, bName, categoryName, locationName };
}

export function buildWhatsappMessage(
  businessName: string,
  isEs: boolean
): string {
  return encodeURIComponent(
    isEs
      ? `¡Hola ${businessName}! 👋 Vi su perfil en UnlockCusco y me gustaría hacer una reserva. ¿Cuándo tienen disponibilidad?`
      : `Hello ${businessName}! 👋 I saw your profile on UnlockCusco and I'd like to make a reservation. When do you have availability?`
  );
}

export function getBusinessHeroImages(business: BusinessWithRelations): string[] {
  let images = [business.imageUrl].filter(Boolean) as string[];
  if (business.premiumProfile?.coverPhotoUrl) {
    images.push(business.premiumProfile.coverPhotoUrl);
  }
  try {
    const heroImages = business.heroImages
      ? JSON.parse(business.heroImages)
      : [];
    if (Array.isArray(heroImages)) {
      images = [...images, ...heroImages];
    }
  } catch {
    // ignore invalid heroImages JSON
  }
  return images;
}

export function getPremiumThemeFlags(business: BusinessWithRelations) {
  const primaryColor = business.premiumProfile?.primaryColor;
  const accentColor = business.premiumProfile?.accentColor;
  const fonts =
    business.premiumProfile?.fonts?.split(",").map((f) => f.trim()) || [];
  const displayFont = fonts[0] ? fonts[0].replace(/ /g, "+") : null;
  const bodyFont = fonts[1] ? fonts[1].replace(/ /g, "+") : null;

  let isDarkTheme = false;
  if (primaryColor) {
    const hex = primaryColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    isDarkTheme = luma < 128;
  }

  return {
    primaryColor,
    accentColor,
    fonts,
    displayFont,
    bodyFont,
    isDarkTheme,
  };
}
