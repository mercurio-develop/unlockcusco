import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import type { Locale } from "@/paths";
import {
  businessPath,
  exploreCategoryPath,
  exploreLocationPath,
  explorePath,
  homePath,
} from "@/paths";
import type { BusinessJsonLd, BusinessWithRelations } from "../types/business-detail";
import {
  getBusinessDisplayNames,
  getBusinessHeroImages,
} from "./business-detail-helpers";

const SCHEMA_TYPE_MAP: Record<string, string> = {
  DINING: "Restaurant",
  MEAL: "Restaurant",
  AGENCY: "TravelAgency",
  WELLNESS: "HealthAndBeautyBusiness",
  STAYS: "LodgingBusiness",
  CULTURE: "TouristAttraction",
};

export async function buildBusinessMetadata(
  lang: Locale,
  business: Awaited<
    ReturnType<typeof import("../queries/get-business-by-slug").getBusinessForMetadata>
  >
): Promise<Metadata> {
  if (!business) {
    return { title: "Not Found | UnlockCusco" };
  }

  const isEs = lang === "es";
  const bName = isEs && business.nameEs ? business.nameEs : business.name;
  const bCategory =
    isEs && business.categoryEs ? business.categoryEs : business.category;
  const bTagline =
    isEs && business.taglineEs ? business.taglineEs : business.tagline;
  const bSeoMetaTitle =
    isEs && business.seoMetaTitleEs
      ? business.seoMetaTitleEs
      : business.seoMetaTitle;
  const bSeoMetaDesc =
    isEs && business.seoMetaDescEs
      ? business.seoMetaDescEs
      : business.seoMetaDesc;

  const categoryName = bCategory
    ? bCategory.charAt(0).toUpperCase() + bCategory.slice(1).toLowerCase()
    : bCategory;
  const locationName = business.locationSlug
    ? business.locationSlug.charAt(0).toUpperCase() +
      business.locationSlug.slice(1)
    : isEs
      ? "el Valle Sagrado"
      : "the Sacred Valley";

  const isDining = business.category?.toUpperCase() === "DINING";

  let title = bSeoMetaTitle;
  let description = bSeoMetaDesc;

  if (isDining) {
    if (!title) {
      title = isEs
        ? `${bName}: Menú, Fotos y Reseñas`
        : `${bName}: Menu, Photos & Reviews | Unlock Cusco`;
    }
    if (!description) {
      description = isEs
        ? `Descubre ${bName} en ${locationName}. Mira fotos reales de sus platos, explora el menú actualizado y lee reseñas auténticas. ¡Reserva hoy!`
        : `Discover ${bName} in ${locationName}. View real photos of their dishes, explore the updated menu, and read authentic reviews. Book today!`;
    }
  }

  if (!title) {
    title = `${bName} — ${categoryName} ${isEs ? "en" : "in"} ${locationName}`;
  }

  if (!description) {
    description =
      bTagline ||
      (isEs
        ? `Lee reseñas, mira fotos y contacta a ${bName} directamente. Calificación: ${business.rating?.toFixed(1) || "Nuevo"} estrellas.`
        : `Read reviews, view photos, and contact ${bName} directly. Average rating: ${business.rating?.toFixed(1) || "New"} stars.`);
  }

  const canonical = `${siteConfig.url}${businessPath(lang, business.slug)}`;
  const ogImage =
    business.premiumProfile?.coverPhotoUrl ||
    business.premiumProfile?.logoUrl ||
    `/api/og?title=${encodeURIComponent(bName || "UnlockCusco")}&description=${encodeURIComponent((categoryName || "") + (isEs ? " en " : " in ") + locationName)}&image=${encodeURIComponent(business.imageUrl || "")}${business.rating ? "&rating=" + business.rating : ""}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: `${siteConfig.url}${businessPath("en", business.slug)}`,
        es: `${siteConfig.url}${businessPath("es", business.slug)}`,
        "x-default": `${siteConfig.url}${businessPath("en", business.slug)}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "UnlockCusco",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${bName} - ${categoryName}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function buildBusinessJsonLd(
  business: BusinessWithRelations,
  lang: Locale
): BusinessJsonLd {
  const { categoryName, locationName } = getBusinessDisplayNames(business, lang);
  const images = getBusinessHeroImages(business);
  const businessType =
    SCHEMA_TYPE_MAP[business.category?.toUpperCase() || ""] || "LocalBusiness";

  let socialLinks: { url: string }[] = [];
  try {
    const parsed = business.socialLinks ? JSON.parse(business.socialLinks) : [];
    socialLinks = Array.isArray(parsed) ? parsed : [];
  } catch {
    socialLinks = [];
  }

  const sameAsLinks = socialLinks.map((s) => s.url).filter(Boolean);
  if (business.instagramHandle) {
    sameAsLinks.push(
      `https://instagram.com/${business.instagramHandle.replace("@", "")}`
    );
  }

  const jsonLd: BusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": businessType,
    name: business.name || "Business",
    image: images.length > 0 ? images : undefined,
    description: business.description || business.tagline || "",
    url: `${siteConfig.url}${businessPath(lang, business.slug)}`,
    telephone: business.whatsapp
      ? `+51${business.whatsapp.replace(/\D/g, "")}`
      : undefined,
    priceRange: business.priceTier || "$$",
    sameAs: sameAsLinks.length > 0 ? sameAsLinks : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: locationName || "",
      addressRegion: "Cusco",
      addressCountry: "PE",
    },
    geo:
      business.lat && business.lng
        ? {
            "@type": "GeoCoordinates",
            latitude: business.lat,
            longitude: business.lng,
          }
        : undefined,
    aggregateRating:
      business.rating && business.reviewsCount
        ? {
            "@type": "AggregateRating",
            ratingValue: business.rating,
            reviewCount: business.reviewsCount,
          }
        : undefined,
  };

  if (business.reviews?.length) {
    jsonLd.review = business.reviews.slice(0, 5).map((review) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating || 5,
      },
      author: {
        "@type": "Person",
        name: review.author || "UnlockCusco User",
      },
      reviewBody: review.text || "",
      datePublished: new Date().toISOString().split("T")[0],
    }));
  }

  return jsonLd;
}

export function buildBusinessBreadcrumbJsonLd(
  business: BusinessWithRelations,
  lang: Locale,
  exploreLabel: string
) {
  const { categoryName, locationName } = getBusinessDisplayNames(business, lang);
  const locationSlug = business.locationSlug || "sacred-valley";
  const categorySlug = business.category?.toLowerCase() || "general";

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: lang === "es" ? "Inicio" : "Home",
        item: `${siteConfig.url}${homePath(lang)}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: exploreLabel,
        item: `${siteConfig.url}${explorePath(lang)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: locationName,
        item: `${siteConfig.url}${exploreLocationPath(lang, locationSlug)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: categoryName,
        item: `${siteConfig.url}${exploreCategoryPath(lang, locationSlug, categorySlug)}`,
      },
      {
        "@type": "ListItem",
        position: 5,
        name: business.name,
        item: `${siteConfig.url}${businessPath(lang, business.slug)}`,
      },
    ],
  };
}
