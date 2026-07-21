import type {
  Business,
  BusinessPillar,
  BusinessPremiumProfile,
  BusinessService,
  Review,
  TourPackage,
} from "@prisma/client";

export interface SocialLink {
  platform?: string;
  url: string;
}

export interface BusinessWithRelations extends Business {
  reviews: Review[];
  services: BusinessService[];
  premiumProfile:
    | (BusinessPremiumProfile & {
        pillars: BusinessPillar[];
      })
    | null;
  tourPackages: TourPackage[];
}

export interface JsonLdReview {
  "@type": "Review";
  reviewRating: {
    "@type": "Rating";
    ratingValue: number;
  };
  author: {
    "@type": "Person";
    name: string;
  };
  reviewBody: string;
  datePublished: string;
}

export interface BusinessJsonLd {
  "@context": "https://schema.org";
  "@type": string;
  name: string;
  image?: string[];
  description: string;
  url: string;
  telephone?: string;
  priceRange: string;
  sameAs?: string[];
  address: {
    "@type": "PostalAddress";
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  geo?: {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
  };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
  };
  review?: JsonLdReview[];
}
